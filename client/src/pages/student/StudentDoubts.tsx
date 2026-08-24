import { useState, useEffect, useRef } from "react";
import api from "@/services/api";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  BookOpen,
  AlertCircle,
  RefreshCw,
  FileText,
  CheckCircle2,
  ChevronRight,
  User,
  X,
} from "lucide-react";

interface Subject {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  teacherAvatar: string | null;
  hasConversation: boolean;
  conversationStatus: string | null;
  unresolvedDoubts: number;
}

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  senderRole: "STUDENT" | "TEACHER";
  attachmentUrl: string | null;
  attachmentType: string | null;
  read: boolean;
  createdAt: string;
}

interface ChatInfo {
  id: string;
  subject: string;
  subjectCode: string;
  teacher: string;
  teacherAvatar: string | null;
  className: string;
  status: string;
}

export function StudentDoubts() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [opening, setOpening] = useState(false);
  const [resolving, setResolving] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!conversationId) {
      fetchSubjects();
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      fetchChatMessages();
      inputRef.current?.focus();
    }
  }, [conversationId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (conversationId) {
      interval = setInterval(() => {
        fetchChatMessages();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/doubts/student/subjects");
      setSubjects(res.data.data || res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    if (!conversationId) return;
    try {
      const res = await api.get(`/doubts/student/chat/${conversationId}`);
      const data = res.data.data || res.data;
      setChatInfo(data.conversation);
      setMessages(data.messages || []);
    } catch {
      // Silently fail on poll errors
    }
  };

  const handleSubjectClick = async (subject: Subject) => {
    setOpening(true);
    setError(null);
    try {
      const res = await api.post("/doubts/student/open-subject", {
        subjectId: subject.subjectId,
      });
      const data = res.data.data || res.data;
      setSelectedSubject(subject);
      setConversationId(data.conversationId);
      setChatInfo({
        id: data.conversationId,
        subject: data.subjectName || subject.subjectName,
        subjectCode: data.subjectCode || subject.subjectCode,
        teacher: data.teacherName || subject.teacherName,
        teacherAvatar: data.teacherAvatar || subject.teacherAvatar,
        className: "",
        status: "NEW",
      });
    } catch (err: any) {
      setError(err.message || "Failed to open chat");
    } finally {
      setOpening(false);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || !conversationId || sending) return;
    setSending(true);
    const msgText = inputMessage.trim();
    setInputMessage("");
    try {
      await api.post("/doubts/student/send", {
        conversationId,
        message: msgText,
      });
      await fetchChatMessages();
    } catch (err: any) {
      setError(err.message || "Failed to send message");
      setInputMessage(msgText);
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!conversationId) return;
    setResolving(true);
    try {
      await api.post("/doubts/resolve", { conversationId });
      setConversationId(null);
      setSelectedSubject(null);
      setChatInfo(null);
      setMessages([]);
      fetchSubjects();
    } catch (err: any) {
      setError(err.message || "Failed to mark as resolved");
    } finally {
      setResolving(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {error && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 p-1 hover:bg-red-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View 1: Subject List */}
      {!conversationId && (
        <>
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Doubts</h1>
            </div>
            <button
              onClick={fetchSubjects}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="divide-y divide-gray-100">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="px-6 py-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                      </div>
                      <div className="w-5 h-5 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                  No subjects found
                </h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  You don't have any assigned subjects yet. Contact your admin to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {subjects.map((subject) => (
                  <button
                    key={subject.subjectId}
                    onClick={() => handleSubjectClick(subject)}
                    disabled={opening}
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {subject.subjectCode?.slice(0, 3).toUpperCase() || "SUB"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {subject.subjectName}
                        </h3>
                        {subject.unresolvedDoubts > 0 && (
                          <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                            {subject.unresolvedDoubts} open
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 truncate">
                          {subject.teacherName}
                        </span>
                        {subject.hasConversation && (
                          <span className="text-xs text-green-600 font-medium ml-1">
                            · Active
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* View 2: Chat Screen */}
      {conversationId && (
        <>
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
            <button
              onClick={() => {
                setConversationId(null);
                setSelectedSubject(null);
                setChatInfo(null);
                setMessages([]);
              }}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 truncate">
                {chatInfo?.teacher || selectedSubject?.teacherName || "Teacher"}
              </h2>
              <p className="text-xs text-gray-500 truncate">
                {chatInfo?.subject || selectedSubject?.subjectName}{" "}
                ({chatInfo?.subjectCode || selectedSubject?.subjectCode})
              </p>
            </div>
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="flex items-center gap-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className={cn("w-4 h-4", resolving && "animate-spin")} />
              Resolved
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <MessageCircle className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.senderRole === "STUDENT" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                      msg.senderRole === "STUDENT"
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
                    )}
                  >
                    {msg.senderRole === "TEACHER" && (
                      <p className="text-xs font-semibold text-indigo-600 mb-1">
                        {msg.senderName}
                      </p>
                    )}
                    {msg.attachmentType === "image" && msg.attachmentUrl ? (
                      <div className="mb-1">
                        <img
                          src={msg.attachmentUrl}
                          alt="Shared image"
                          className="rounded-lg max-w-full max-h-48 object-cover"
                        />
                      </div>
                    ) : msg.attachmentType === "file" ? (
                      <div className="flex items-center gap-2 mb-1 p-2 rounded-lg bg-black/5">
                        <FileText className="w-8 h-8 flex-shrink-0" />
                        <div className="min-w-0">
                          <a
                            href={msg.attachmentUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium underline"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ) : null}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 mt-1.5",
                        msg.senderRole === "STUDENT" ? "justify-end" : "justify-start"
                      )}
                    >
                      <span
                        className={cn(
                          "text-[10px]",
                          msg.senderRole === "STUDENT" ? "text-indigo-200" : "text-gray-400"
                        )}
                      >
                        {formatTime(msg.createdAt)}
                      </span>
                      {msg.senderRole === "STUDENT" && (
                        <span
                          className={cn(
                            "text-[10px]",
                            msg.read ? "text-indigo-200" : "text-indigo-300"
                          )}
                        >
                          {msg.read ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white border-t border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 bg-gray-100 border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim() || sending}
                className={cn(
                  "p-2.5 rounded-full transition-all",
                  inputMessage.trim() && !sending
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

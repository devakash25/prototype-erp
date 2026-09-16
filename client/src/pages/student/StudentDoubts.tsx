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
  User,
  X,
  Users,
} from "lucide-react";

interface Subject {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  teacherAvatar: string | null;
  hasGroup: boolean;
  groupId: string | null;
  status: string | null;
}

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  senderRole: "STUDENT" | "TEACHER";
  senderUserRole: string;
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
        fetchChatMessagesSilent();
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

  const fetchChatMessagesSilent = async () => {
    if (!conversationId) return;
    try {
      const res = await api.get(`/doubts/student/chat/${conversationId}`);
      const data = res.data.data || res.data;
      setChatInfo(data.conversation);
      setMessages(data.messages || []);
    } catch {
      // Silent poll
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
      setConversationId(data.groupId);
      setChatInfo({
        id: data.groupId,
        subject: data.subject || subject.subjectName,
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
    <div className="flex flex-col h-full bg-slate-900">
      {error && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg shadow-lg max-w-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-2 p-1 hover:bg-red-500/10 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View 1: Subject List */}
      {!conversationId && (
        <>
          <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-indigo-400" />
              <div>
                <h1 className="text-xl font-bold text-white">Class Doubts</h1>
                <p className="text-xs text-slate-400">Group chat with your class & teacher</p>
              </div>
            </div>
            <button onClick={fetchSubjects} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" disabled={loading}>
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="divide-y divide-slate-700">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="px-6 py-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-700 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-slate-700 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-slate-700/50 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-400 mb-1">No subjects found</h3>
                <p className="text-sm text-slate-500 max-w-xs">You don't have any assigned subjects yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {subjects.map((subject) => (
                  <button key={subject.subjectId} onClick={() => handleSubjectClick(subject)} disabled={opening}
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-800 transition-colors text-left disabled:opacity-50">
                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {subject.subjectCode?.slice(0, 3).toUpperCase() || "SUB"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-sm truncate">{subject.subjectName}</h3>
                        {subject.hasGroup && (
                          <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                            <Users className="w-3 h-3" /> Group
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <User className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-slate-400 truncate">{subject.teacherName}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 flex-shrink-0">{subject.hasGroup ? "Open" : "Start"}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* View 2: Group Chat */}
      {conversationId && (
        <>
          <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
            <button onClick={() => { setConversationId(null); setSelectedSubject(null); setChatInfo(null); setMessages([]); fetchSubjects(); }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white truncate">{chatInfo?.subject || selectedSubject?.subjectName}</h2>
                <span className="flex items-center gap-1 text-[10px] font-medium text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">
                  <Users className="w-2.5 h-2.5" /> Group
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{chatInfo?.teacher || selectedSubject?.teacherName} &bull; Class</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  <MessageCircle className="w-7 h-7 text-slate-500" />
                </div>
                <p className="text-sm text-slate-400">No messages yet. Ask a doubt!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderRole === "STUDENT" && msg.senderUserRole === "STUDENT"
                const isTeacher = msg.senderRole === "TEACHER"
                return (
                  <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[75%]")}>
                      {!isMe && (
                        <p className={cn("text-[10px] font-medium mb-0.5 ml-1", isTeacher ? "text-indigo-400" : "text-slate-400")}>
                          {msg.senderName} {isTeacher && "(Teacher)"}
                        </p>
                      )}
                      <div className={cn("rounded-2xl px-4 py-2.5 shadow-sm",
                        isMe ? "bg-indigo-600 text-white rounded-br-md" : isTeacher ? "bg-indigo-500/10 border border-indigo-500/20 text-white rounded-bl-md" : "bg-slate-800 border border-slate-700 text-white rounded-bl-md"
                      )}>
                        {msg.attachmentType === "image" && msg.attachmentUrl && (
                          <div className="mb-1"><img src={msg.attachmentUrl} alt="Shared image" className="rounded-lg max-w-full max-h-48 object-cover" /></div>
                        )}
                        {msg.attachmentType === "file" && (
                          <div className="flex items-center gap-2 mb-1 p-2 rounded-lg bg-white/5">
                            <FileText className="w-8 h-8 flex-shrink-0" />
                            <div className="min-w-0">
                              <a href={msg.attachmentUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-xs font-medium underline">Download</a>
                            </div>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                        <div className={cn("flex items-center gap-1.5 mt-1.5", isMe ? "justify-end" : "justify-start")}>
                          <span className={cn("text-[10px]", isMe ? "text-indigo-200" : "text-slate-500")}>{formatTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-slate-800 border-t border-slate-700 px-4 py-3">
            <div className="flex items-center gap-2">
              <input ref={inputRef} type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask a doubt to the group..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={sending}
              />
              <button onClick={handleSend} disabled={!inputMessage.trim() || sending}
                className={cn("p-2.5 rounded-full transition-all",
                  inputMessage.trim() && !sending ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md" : "bg-slate-700 text-slate-500 cursor-not-allowed"
                )}>
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

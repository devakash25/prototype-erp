import { useState, useEffect, useRef, useCallback } from 'react'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw, Send, Search, ArrowLeft, MessageCircle, User, Users,
  FileText, Check, CheckCheck, X, BookOpen, GraduationCap, UserCheck,
} from 'lucide-react'

interface InboxItem {
  id: string; parentName: string; parentAvatar: string | null; parentId: string;
  studentName: string; studentId: string; className: string; rollNumber: string | null;
  admissionNumber: string; recipientType: string; lastMessage: string | null;
  lastMessageTime: string | null; unreadCount: number; parentOnline: boolean;
}

interface ChatMessage {
  id: string; senderId: string; senderRole: string; senderName: string;
  senderAvatar: string | null; message: string; attachmentUrl: string | null;
  attachmentType: string | null; isRead: boolean; createdAt: string;
}

interface ChatData {
  conversation: { id: string; recipientType: string; parentName: string; parentAvatar: string | null; parentId: string; parentOnline: boolean };
  student: { id: string; name: string; admissionNumber: string; rollNumber: string | null; className: string; attendancePercentage: number | null };
  messages: ChatMessage[];
}

export function TeacherParentMessages() {
  const [view, setView] = useState<'inbox' | 'chat'>('inbox')
  const [inbox, setInbox] = useState<InboxItem[]>([])
  const [chatData, setChatData] = useState<ChatData | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchInbox = useCallback(async () => {
    setLoading(true); setError(null)
    try { const res = await api.get('/parent-messaging/teacher/inbox'); setInbox(res.data.data) }
    catch (err: any) { setError(err.response?.data?.error?.message || 'Failed to load inbox') }
    finally { setLoading(false) }
  }, [])

  const fetchChat = useCallback(async (conversationId: string) => {
    setLoading(true); setError(null)
    try { const res = await api.get(`/parent-messaging/teacher/chat/${conversationId}`); setChatData(res.data.data) }
    catch (err: any) { setError(err.response?.data?.error?.message || 'Failed to load messages') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchInbox() }, [fetchInbox])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatData?.messages])

  const handleOpenChat = (item: InboxItem) => { setView('chat'); fetchChat(item.id) }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatData || sending) return
    setSending(true)
    try {
      await api.post('/parent-messaging/teacher/send', { conversationId: chatData.conversation.id, message: newMessage })
      setNewMessage(''); await fetchChat(chatData.conversation.id); inputRef.current?.focus()
    } catch (err: any) { setError(err.response?.data?.error?.message || 'Failed to send') }
    finally { setSending(false) }
  }

  const filteredInbox = inbox.filter((item) =>
    item.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.className.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (date: string | null) => {
    if (!date) return ''
    const d = new Date(date); const now = new Date()
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Inbox Sidebar */}
      <div className={cn('w-full md:w-[420px] border-r border-gray-200 flex flex-col', view === 'chat' && 'hidden md:flex')}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Parent Messages</h2>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search by parent, student, or class..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && !inbox.length ? <div className="flex justify-center py-12"><RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" /></div> :
          !filteredInbox.length ? (
            <div className="text-center py-16 text-gray-500"><MessageCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" /><p className="text-sm">No parent messages</p></div>
          ) : filteredInbox.map((item) => (
            <button key={item.id} onClick={() => handleOpenChat(item)} className="w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left">
              <div className="relative shrink-0"><div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">{item.parentName.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
              {item.parentOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5"><span className="font-semibold text-gray-900 text-sm truncate">{item.parentName}</span><span className="text-xs text-gray-400 shrink-0">{formatTime(item.lastMessageTime)}</span></div>
                <div className="flex items-center gap-1 text-xs text-indigo-600 mb-0.5"><User className="h-3 w-3" />{item.studentName}<span className="text-gray-400"> | {item.className}</span></div>
                <div className="flex items-center justify-between"><p className="text-xs text-gray-500 truncate">{item.lastMessage || 'No messages yet'}</p>
                {item.unreadCount > 0 && <span className="ml-2 shrink-0 bg-red-500 text-white text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{item.unreadCount}</span>}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn('flex-1 flex', view !== 'chat' && 'hidden md:flex')}>
        {!chatData ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center"><MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-200" /><p className="text-lg font-medium">Select a conversation</p><p className="text-sm">Choose a parent message to reply</p></div>
          </div>
        ) : (
          <div className="flex-1 flex">
            {/* Messages Column */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
                <button onClick={() => { setView('inbox'); setChatData(null) }} className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5 text-gray-600" /></button>
                <div className="relative"><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">{chatData.conversation.parentName.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
                {chatData.conversation.parentOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />}</div>
                <div className="flex-1"><div className="font-semibold text-gray-900 text-sm">{chatData.conversation.parentName}</div>
                <div className="text-xs text-gray-500">Parent of {chatData.student.name}</div></div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {loading && !chatData.messages.length ? <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" /></div> : null}
                {chatData.messages.map((m) => {
                  const isTeacher = m.senderRole === 'TEACHER'
                  return (
                    <div key={m.id} className={cn('flex', isTeacher ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm', isTeacher ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md')}>
                        {!isTeacher && <div className="text-xs font-medium text-green-600 mb-1">{m.senderName}</div>}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.message}</p>
                        {m.attachmentUrl && (
                          <div className="mt-2 pt-2 border-t border-white/20">
                            {m.attachmentType === 'IMAGE' ? <img src={m.attachmentUrl} alt="attachment" className="rounded-lg max-h-48" /> :
                            <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer" className={cn('flex items-center gap-2 text-xs underline', isTeacher ? 'text-indigo-100' : 'text-indigo-600')}><FileText className="h-4 w-4" /> View Attachment</a>}
                          </div>
                        )}
                        <div className={cn('flex items-center gap-1 mt-1', isTeacher ? 'justify-end' : '')}>
                          <span className={cn('text-xs', isTeacher ? 'text-indigo-200' : 'text-gray-400')}>{formatTime(m.createdAt)}</span>
                          {isTeacher && (m.isRead ? <CheckCheck className="h-3.5 w-3.5 text-indigo-200" /> : <Check className="h-3.5 w-3.5 text-indigo-200" />)}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                {error && <div className="mb-2 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg flex items-center justify-between">{error}<button onClick={() => setError(null)}><X className="h-3.5 w-3.5" /></button></div>}
                <div className="flex items-center gap-2">
                  <input ref={inputRef} type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()} placeholder="Type a reply..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button onClick={handleSendMessage} disabled={!newMessage.trim() || sending} className={cn('p-2.5 rounded-full transition-colors', newMessage.trim() && !sending ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-400')}>
                    {sending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Student Info Side Panel */}
            <div className="hidden lg:block w-72 border-l border-gray-200 bg-white overflow-y-auto">
              <div className="p-5 text-center border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl mx-auto mb-3">{chatData.student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
                <h3 className="font-bold text-gray-900">{chatData.student.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{chatData.student.className}</p>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-gray-50 rounded-xl p-3"><div className="flex items-center gap-2 mb-1"><User className="h-4 w-4 text-gray-400" /><span className="text-xs font-medium text-gray-500 uppercase">Roll Number</span></div><p className="text-sm font-semibold text-gray-900">{chatData.student.rollNumber || 'N/A'}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><div className="flex items-center gap-2 mb-1"><BookOpen className="h-4 w-4 text-gray-400" /><span className="text-xs font-medium text-gray-500 uppercase">Admission No.</span></div><p className="text-sm font-semibold text-gray-900">{chatData.student.admissionNumber}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><div className="flex items-center gap-2 mb-1"><GraduationCap className="h-4 w-4 text-gray-400" /><span className="text-xs font-medium text-gray-500 uppercase">Class & Section</span></div><p className="text-sm font-semibold text-gray-900">{chatData.student.className}</p></div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1"><UserCheck className="h-4 w-4 text-gray-400" /><span className="text-xs font-medium text-gray-500 uppercase">Attendance</span></div>
                  {chatData.student.attendancePercentage != null ? (
                    <div><div className="flex items-center justify-between mb-1"><p className="text-sm font-semibold text-gray-900">{chatData.student.attendancePercentage}%</p></div>
                    <div className="w-full bg-gray-200 rounded-full h-2"><div className={cn('h-2 rounded-full', chatData.student.attendancePercentage >= 75 ? 'bg-green-500' : chatData.student.attendancePercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500')} style={{ width: `${chatData.student.attendancePercentage}%` }} /></div></div>
                  ) : <p className="text-sm text-gray-500">No data</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherParentMessages

import { useState, useEffect, useRef, useCallback } from 'react'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw, Send, Search, ArrowLeft, MessageCircle, User, BookOpen,
  Image, FileText, Check, CheckCheck, X, Upload,
} from 'lucide-react'

interface Recipient {
  teacherId: string; teacherName: string; teacherAvatar: string | null;
  role: string; subject: string | null; studentId: string; studentName: string;
  className: string; lastMessage: string | null; lastMessageTime: string | null;
  unreadCount: number; online: boolean; conversationId: string | null;
}

interface Conversation {
  id: string; recipientType: string; teacherName: string; teacherAvatar: string | null;
  teacherId: string; studentName: string; studentId: string; className: string;
  lastMessage: string | null; lastMessageTime: string | null; unreadCount: number; online: boolean;
}

interface ChatMessage {
  id: string; senderId: string; senderRole: string; senderName: string;
  senderAvatar: string | null; message: string; attachmentUrl: string | null;
  attachmentType: string | null; isRead: boolean; createdAt: string;
}

type View = 'conversations' | 'recipients' | 'chat'

export function ParentMessages() {
  const [view, setView] = useState<View>('conversations')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'coordinator' | 'teachers'>('coordinator')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchConversations = useCallback(async () => {
    setLoading(true); setError(null)
    try { const res = await api.get('/parent-messaging/parent/conversations'); setConversations(res.data.data) }
    catch (err: any) { setError(err.response?.data?.error?.message || 'Failed to load conversations') }
    finally { setLoading(false) }
  }, [])

  const fetchRecipients = useCallback(async () => {
    setLoading(true); setError(null)
    try { const res = await api.get('/parent-messaging/parent/recipients'); setRecipients(res.data.data) }
    catch (err: any) { setError(err.response?.data?.error?.message || 'Failed to load recipients') }
    finally { setLoading(false) }
  }, [])

  const fetchChat = useCallback(async (conversationId: string) => {
    setLoading(true); setError(null)
    try {
      const res = await api.get(`/parent-messaging/parent/chat/${conversationId}`)
      setMessages(res.data.data.messages)
      setSelectedConversation(res.data.data.conversation)
    } catch (err: any) { setError(err.response?.data?.error?.message || 'Failed to load messages') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchConversations() }, [fetchConversations])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleOpenChat = (conv: Conversation) => {
    setSelectedConversation(conv); setView('chat'); fetchChat(conv.id)
  }

  const handleStartChat = async (recipient: Recipient) => {
    if (recipient.conversationId) {
      setSelectedConversation({ id: recipient.conversationId, recipientType: recipient.role === 'Class Coordinator' ? 'CLASS_COORDINATOR' : 'SUBJECT_TEACHER', ...recipient } as any)
      setView('chat'); fetchChat(recipient.conversationId); return
    }
    setSelectedRecipient(recipient)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return
    setSending(true)
    try {
      if (selectedConversation) {
        await api.post('/parent-messaging/parent/send', { conversationId: selectedConversation.id, message: newMessage })
        fetchChat(selectedConversation.id)
      } else if (selectedRecipient) {
        const res = await api.post('/parent-messaging/parent/start', {
          studentId: selectedRecipient.studentId, teacherId: selectedRecipient.teacherId,
          recipientType: selectedRecipient.role === 'Class Coordinator' ? 'CLASS_COORDINATOR' : 'SUBJECT_TEACHER',
          message: newMessage,
        })
        const conv = res.data.data
        setSelectedConversation({ id: conv.id, ...selectedRecipient, recipientType: conv.recipientType } as any)
        setSelectedRecipient(null); setView('chat')
        await fetchChat(conv.id)
      }
      setNewMessage(''); inputRef.current?.focus()
    } catch (err: any) { setError(err.response?.data?.error?.message || 'Failed to send') }
    finally { setSending(false) }
  }

  const filteredRecipients = recipients.filter((r) =>
    (activeTab === 'coordinator' ? r.role === 'Class Coordinator' : r.role === 'Subject Teacher') &&
    (r.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) || r.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || r.studentName.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const formatTime = (date: string | null) => {
    if (!date) return ''
    const d = new Date(date); const now = new Date()
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className={cn('w-full md:w-96 border-r border-gray-200 flex flex-col', view === 'chat' && 'hidden md:flex')}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Messages</h2>
            {view === 'conversations' && (
              <button onClick={() => { setView('recipients'); fetchRecipients() }} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700">
                <MessageCircle className="h-3.5 w-3.5" /> New Chat
              </button>
            )}
          </div>
          {view === 'conversations' && (
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          )}
          {view === 'recipients' && (
            <div className="flex items-center gap-2">
              <button onClick={() => { setView('conversations'); setSelectedRecipient(null) }} className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-4 w-4 text-gray-600" /></button>
              <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search teachers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
          )}
        </div>

        {view === 'conversations' && (
          <div className="flex-1 overflow-y-auto">
            {!conversations.length && !loading ? (
              <div className="text-center py-16 text-gray-500"><MessageCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" /><p className="text-sm">No conversations yet</p><p className="text-xs text-gray-400 mt-1">Start a new chat with a teacher</p></div>
            ) : conversations.map((c) => (
              <button key={c.id} onClick={() => handleOpenChat(c)} className="w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left">
                <div className="relative shrink-0"><div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">{c.teacherName.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
                {c.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5"><span className="font-semibold text-gray-900 text-sm truncate">{c.teacherName}</span><span className="text-xs text-gray-400 shrink-0">{formatTime(c.lastMessageTime)}</span></div>
                  <div className="text-xs text-indigo-600 mb-0.5">{c.role || 'Teacher'} {c.studentName && <span className="text-gray-400"> | {c.studentName}</span>}</div>
                  <div className="flex items-center justify-between"><p className="text-xs text-gray-500 truncate">{c.lastMessage || 'No messages yet'}</p>
                  {c.unreadCount > 0 && <span className="ml-2 shrink-0 bg-indigo-600 text-white text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{c.unreadCount}</span>}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {view === 'recipients' && (
          <div className="flex-1 overflow-y-auto">
            <div className="flex border-b border-gray-100">
              <button onClick={() => setActiveTab('coordinator')} className={cn('flex-1 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors', activeTab === 'coordinator' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500')}>Class Coordinator</button>
              <button onClick={() => setActiveTab('teachers')} className={cn('flex-1 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors', activeTab === 'teachers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500')}>Subject Teachers</button>
            </div>
            <div className="p-2">
              {filteredRecipients.map((r, i) => (
                <button key={`${r.teacherId}-${r.studentId}-${i}`} onClick={() => handleStartChat(r)} className="w-full p-3 flex items-start gap-3 hover:bg-gray-50 rounded-xl transition-colors text-left">
                  <div className="relative shrink-0"><div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">{r.teacherName.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
                  {r.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{r.teacherName}</div>
                    <div className="text-xs text-gray-500">{r.subject || r.role}</div>
                    <div className="text-xs text-gray-400">{r.studentName} - {r.className}</div>
                  </div>
                  {r.lastMessage && <div className="text-xs text-gray-400 shrink-0">{formatTime(r.lastMessageTime)}</div>}
                </button>
              ))}
              {!filteredRecipients.length && <p className="text-center text-gray-400 text-sm py-8">No teachers found</p>}
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className={cn('flex-1 flex flex-col', view !== 'chat' && 'hidden md:flex')}>
        {!selectedConversation && !selectedRecipient ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center"><MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-200" /><p className="text-lg font-medium">Select a conversation</p><p className="text-sm">Choose a teacher to start messaging</p></div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
              <button onClick={() => { setView('conversations'); setMessages([]); setSelectedConversation(null); setSelectedRecipient(null) }} className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5 text-gray-600" /></button>
              <div className="relative"><div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">{(selectedConversation?.teacherName || selectedRecipient?.teacherName || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</div>
              {(selectedConversation?.online || selectedRecipient?.online) && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />}</div>
              <div className="flex-1"><div className="font-semibold text-gray-900 text-sm">{selectedConversation?.teacherName || selectedRecipient?.teacherName}</div>
              <div className="text-xs text-gray-500">{selectedConversation?.role || selectedRecipient?.role} {selectedConversation?.studentName || selectedRecipient?.studentName ? ` | ${(selectedConversation?.studentName || selectedRecipient?.studentName)}` : ''}</div></div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {loading && !messages.length ? <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" /></div> : null}
              {messages.map((m) => {
                const isParent = m.senderRole === 'PARENT'
                return (
                  <div key={m.id} className={cn('flex', isParent ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm', isParent ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md')}>
                      {!isParent && <div className="text-xs font-medium text-indigo-600 mb-1">{m.senderName}</div>}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.message}</p>
                      {m.attachmentUrl && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          {m.attachmentType === 'IMAGE' ? <img src={m.attachmentUrl} alt="attachment" className="rounded-lg max-h-48" /> :
                          <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer" className={cn('flex items-center gap-2 text-xs underline', isParent ? 'text-indigo-100' : 'text-indigo-600')}>
                            <FileText className="h-4 w-4" /> View Attachment</a>}
                        </div>
                      )}
                      <div className={cn('flex items-center gap-1 mt-1', isParent ? 'justify-end' : '')}>
                        <span className={cn('text-xs', isParent ? 'text-indigo-200' : 'text-gray-400')}>{formatTime(m.createdAt)}</span>
                        {isParent && (m.isRead ? <CheckCheck className="h-3.5 w-3.5 text-indigo-200" /> : <Check className="h-3.5 w-3.5 text-indigo-200" />)}
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
                <input ref={inputRef} type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button onClick={handleSendMessage} disabled={!newMessage.trim() || sending}
                  className={cn('p-2.5 rounded-full transition-colors', newMessage.trim() && !sending ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-400')}>
                  {sending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ParentMessages

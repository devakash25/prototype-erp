import { useState, useEffect, useRef, useCallback } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Users,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  Search,
  Eye,
  User,
} from 'lucide-react'

type View = 'classes' | 'conversations' | 'chat'

interface ClassItem {
  classId: string
  className: string
  classCode: string
  subjects: Array<{ id: string; name: string; code: string }>
  pendingDoubts: number
  totalStudents: number
  role: string
}

interface Conversation {
  id: string
  subject: string
  subjectCode: string
  className: string
  classCode: string
  classId: string
  studentCount: number
  lastMessage: string | null
  lastMessageSender: string | null
  lastMessageSenderRole: string | null
  lastMessageTime: string
  status: 'new' | 'unread' | 'answered' | 'resolved'
  unreadCount: number
  messageCount: number
}

interface Message {
  id: string
  text: string
  senderId: string
  senderName: string
  senderAvatar: string | null
  senderRole: 'STUDENT' | 'TEACHER'
  senderUserRole: string
  attachmentUrl: string | null
  attachmentType: string | null
  read: boolean
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-blue-700', bg: 'bg-blue-100' },
  unread: { label: 'Unread', color: 'text-orange-700', bg: 'bg-orange-100' },
  answered: { label: 'Answered', color: 'text-green-700', bg: 'bg-green-100' },
  resolved: { label: 'Resolved', color: 'text-gray-600', bg: 'bg-gray-100' },
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.new
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', config.bg, config.color)}>
      {config.label}
    </span>
  )
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHrs < 24) return `${diffHrs}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function formatMessageTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function TeacherDoubts() {
  const [view, setView] = useState<View>('classes')
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [selectedClassName, setSelectedClassName] = useState('')
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [conversationSearch, setConversationSearch] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [chatData, setChatData] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: classes, loading: classesLoading, error: classesError, refetch: refetchClasses } = useApi<ClassItem[]>(
    '/doubts/teacher/classes'
  )

  const { data: conversationsData, loading: convLoading, error: convError, refetch: refetchConversations } = useApi<Conversation[]>(
    selectedClassId ? `/doubts/teacher/conversations?classId=${selectedClassId}` : '',
    [selectedClassId]
  )

  const conversations = conversationsData ?? []
  const messages: Message[] = chatData?.messages ?? []

  const filteredConversations = conversations.filter((conv) => {
    if (!conversationSearch) return true
    const search = conversationSearch.toLowerCase()
    return (
      conv.subject.toLowerCase().includes(search) ||
      conv.subjectCode.toLowerCase().includes(search)
    )
  })

  const fetchChat = useCallback(async (silent = false) => {
    if (!selectedConversationId) return
    try {
      const res = await api.get(`/doubts/teacher/chat/${selectedConversationId}`)
      const data = res.data.data || res.data
      if (!silent) setChatData(data)
      else setChatData((prev: any) => ({ ...prev, messages: data.messages }))
    } catch {}
  }, [selectedConversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll classes
  useEffect(() => {
    if (view !== 'classes') return
    const interval = setInterval(() => refetchClasses(), 10000)
    return () => clearInterval(interval)
  }, [view, refetchClasses])

  // Poll conversations
  useEffect(() => {
    if (view !== 'conversations' || !selectedClassId) return
    const interval = setInterval(() => refetchConversations(), 5000)
    return () => clearInterval(interval)
  }, [view, selectedClassId, refetchConversations])

  // Poll chat
  useEffect(() => {
    if (view !== 'chat' || !selectedConversationId) return
    fetchChat()
    const interval = setInterval(() => fetchChat(true), 5000)
    return () => clearInterval(interval)
  }, [view, selectedConversationId, fetchChat])

  const handleSelectClass = (cls: ClassItem) => {
    setSelectedClassId(cls.classId)
    setSelectedClassName(cls.className)
    setView('conversations')
    setConversationSearch('')
  }

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversationId(conv.id)
    setSelectedConversation(conv)
    setView('chat')
  }

  const handleBackToClasses = () => {
    setView('classes')
    setSelectedClassId(null)
    setSelectedClassName('')
    refetchClasses()
  }

  const handleBackToConversations = () => {
    setView('conversations')
    setSelectedConversationId(null)
    setSelectedConversation(null)
    refetchConversations()
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || sending) return
    setSending(true)
    try {
      await api.post('/doubts/teacher/send', {
        conversationId: selectedConversationId,
        message: newMessage.trim(),
      })
      setNewMessage('')
      await fetchChat()
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const handleMarkResolved = async () => {
    if (!selectedConversationId) return
    try {
      await api.post('/doubts/resolve', { conversationId: selectedConversationId })
      await refetchConversations()
      handleBackToConversations()
    } catch (err) {
      console.error('Failed to mark as resolved:', err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (classesError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600">Failed to load doubt data</p>
        <button onClick={refetchClasses} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  // VIEW 1: Class List
  if (view === 'classes') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Doubt Groups</h1>
            <p className="text-gray-500 text-sm">Class-wise subject groups with doubts</p>
          </div>
          <button onClick={refetchClasses} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50">
            <RefreshCw className={cn('h-4 w-4', classesLoading && 'animate-spin')} /> Refresh
          </button>
        </div>

        {classesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : !classes?.length ? (
          <div className="text-center py-16 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No classes with doubts</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div key={cls.classId} onClick={() => handleSelectClass(cls)} className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{cls.className}</h3>
                    <p className="text-xs text-gray-500">{cls.classCode}</p>
                  </div>
                  {cls.pendingDoubts > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                      {cls.pendingDoubts} pending
                    </span>
                  )}
                </div>
                {cls.subjects?.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {cls.subjects.map((s) => (
                        <span key={s.id} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md">{s.name}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>{cls.totalStudents} students</span>
                  {cls.role === 'coordinator' && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded">Coordinator</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // VIEW 2: Subject Groups
  if (view === 'conversations') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={handleBackToClasses} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{selectedClassName}</h1>
            <p className="text-sm text-gray-500">Subject doubt groups</p>
          </div>
          <button onClick={refetchConversations} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50">
            <RefreshCw className={cn('h-4 w-4', convLoading && 'animate-spin')} /> Refresh
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by subject..."
            value={conversationSearch}
            onChange={(e) => setConversationSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {convError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            Failed to load groups. <button onClick={refetchConversations} className="underline">Retry</button>
          </div>
        )}

        {convLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : !filteredConversations.length ? (
          <div className="text-center py-16 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">{conversationSearch ? 'No groups match your search' : 'No doubt groups yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conv) => (
              <div key={conv.id} onClick={() => handleSelectConversation(conv)} className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-indigo-50 rounded-full">
                    <MessageCircle className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">{conv.subject}</h3>
                          <span className="text-xs text-gray-400">{conv.subjectCode}</span>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="h-3 w-3" /> {conv.studentCount} students in group
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={conv.status} />
                        {conv.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-xs font-bold bg-red-500 text-white">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    {conv.lastMessage && (
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          <span className="font-medium">{conv.lastMessageSender}</span>: {conv.lastMessage}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatTime(conv.lastMessageTime)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // VIEW 3: Group Chat
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
        <button onClick={handleBackToConversations} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900 truncate">{selectedConversation?.subject}</h2>
            <span className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
              <Users className="w-2.5 h-2.5" /> Group
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {chatData?.conversation?.studentCount || selectedConversation?.studentCount || 0} students &bull; {selectedConversation?.className}
          </p>
        </div>
        <StatusBadge status={selectedConversation?.status ?? 'new'} />
        {selectedConversation?.status !== 'resolved' && (
          <button
            onClick={handleMarkResolved}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            Resolve
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="h-12 w-12 mb-3 text-gray-300" />
            <p>No messages yet. Students will post doubts here.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isTeacher = msg.senderRole === 'TEACHER'
            return (
              <div key={msg.id} className={cn('flex', isTeacher ? 'justify-end' : 'justify-start')}>
                <div className="flex items-end gap-2 max-w-[75%]">
                  {!isTeacher && (
                    <div className="flex-shrink-0 p-1.5 bg-gray-200 rounded-full">
                      <User className="h-3 w-3 text-gray-500" />
                    </div>
                  )}
                  <div>
                    {!isTeacher && (
                      <p className="text-[10px] font-medium text-gray-500 mb-0.5 ml-1">
                        {msg.senderName}
                      </p>
                    )}
                    <div
                      className={cn(
                        'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                        isTeacher
                          ? 'bg-indigo-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 border rounded-bl-md shadow-sm'
                      )}
                    >
                      {msg.text}
                    </div>
                    <div className={cn('flex items-center gap-1 mt-1 text-[10px] text-gray-400', isTeacher ? 'justify-end' : 'justify-start')}>
                      <span>{formatMessageTime(msg.createdAt)}</span>
                      {isTeacher && (
                        msg.read ? <Eye className="h-3 w-3 text-blue-400" /> : <Eye className="h-3 w-3 text-gray-300" />
                      )}
                    </div>
                  </div>
                  {isTeacher && (
                    <div className="flex-shrink-0 p-1.5 bg-indigo-100 rounded-full">
                      <User className="h-3 w-3 text-indigo-500" />
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {selectedConversation?.status !== 'resolved' && (
        <div className="flex items-center gap-3 px-4 py-3 border-t bg-white">
          <input
            type="text"
            placeholder="Reply to the group..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            className="flex-1 px-4 py-2.5 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className={cn(
              'p-2.5 rounded-full transition-colors',
              newMessage.trim() && !sending
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}

      {selectedConversation?.status === 'resolved' && (
        <div className="px-4 py-3 border-t bg-gray-50 text-center text-sm text-gray-500">
          This doubt group has been resolved.
        </div>
      )}
    </div>
  )
}

export default TeacherDoubts

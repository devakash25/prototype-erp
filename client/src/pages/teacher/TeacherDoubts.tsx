import { useState, useEffect, useRef } from 'react'
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
  id: string
  name: string
  subjects: string[]
  pendingDoubts: number
  totalStudents: number
}

interface Conversation {
  id: string
  studentName: string
  rollNumber: string
  subject: string
  lastMessage: string
  lastMessageTime: string
  status: 'new' | 'unread' | 'answered' | 'resolved'
  unreadCount: number
}

interface Message {
  id: string
  sender: 'student' | 'teacher'
  message: string
  timestamp: string
  read: boolean
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
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  )
}

function SkeletonConversations() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  )
}

function SkeletonMessages() {
  return (
    <div className="flex-1 p-4 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
          <div className="h-10 w-48 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      ))}
    </div>
  )
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: classes, loading: classesLoading, error: classesError, refetch: refetchClasses } = useApi<ClassItem[]>(
    '/doubts/teacher/classes'
  )

  const { data: conversationsData, loading: convLoading, error: convError, refetch: refetchConversations } = useApi<Conversation[]>(
    selectedClassId ? `/doubts/teacher/conversations?classId=${selectedClassId}` : '',
    [selectedClassId]
  )

  const { data: messagesData, loading: msgLoading, error: msgError, refetch: refetchMessages } = useApi<Message[]>(
    selectedConversationId ? `/doubts/teacher/chat/${selectedConversationId}` : '',
    [selectedConversationId]
  )

  const conversations = conversationsData ?? []
  const messages = messagesData ?? []

  const filteredConversations = conversations.filter((conv) => {
    if (!conversationSearch) return true
    const search = conversationSearch.toLowerCase()
    return (
      conv.studentName.toLowerCase().includes(search) ||
      conv.rollNumber.toLowerCase().includes(search)
    )
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (view !== 'chat' || !selectedConversationId) return
    const interval = setInterval(() => {
      refetchMessages()
    }, 5000)
    return () => clearInterval(interval)
  }, [view, selectedConversationId, refetchMessages])

  const handleSelectClass = (cls: ClassItem) => {
    setSelectedClassId(cls.id)
    setSelectedClassName(cls.name)
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
  }

  const handleBackToConversations = () => {
    setView('conversations')
    setSelectedConversationId(null)
    setSelectedConversation(null)
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
      await refetchMessages()
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
        <p className="text-lg text-gray-600">Failed to load doubt solving data</p>
        <button
          onClick={refetchClasses}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
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
          <h1 className="text-2xl font-bold text-gray-900">Doubt Solving</h1>
          <button
            onClick={refetchClasses}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={cn('h-4 w-4', classesLoading && 'animate-spin')} /> Refresh
          </button>
        </div>

        {classesLoading ? (
          <SkeletonCards />
        ) : !classes?.length ? (
          <div className="text-center py-16 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No classes with doubts</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                onClick={() => handleSelectClass(cls)}
                className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{cls.name}</h3>
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
                      {cls.subjects.map((subject, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md">
                          {typeof subject === 'string' ? subject : (subject as any).name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>{cls.totalStudents} students</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // VIEW 2: Conversations List
  if (view === 'conversations') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToClasses}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{selectedClassName}</h1>
            <p className="text-sm text-gray-500">Conversations</p>
          </div>
          <button
            onClick={refetchConversations}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={cn('h-4 w-4', convLoading && 'animate-spin')} /> Refresh
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name or roll number..."
            value={conversationSearch}
            onChange={(e) => setConversationSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {convError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            Failed to load conversations. <button onClick={refetchConversations} className="underline">Retry</button>
          </div>
        )}

        {convLoading ? (
          <SkeletonConversations />
        ) : !filteredConversations.length ? (
          <div className="text-center py-16 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">
              {conversationSearch ? 'No conversations match your search' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-gray-100 rounded-full">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{conv.studentName}</h3>
                        <p className="text-xs text-gray-500">{conv.rollNumber}</p>
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
                    <div className="mt-1.5">
                      <span className="inline-block px-1.5 py-0.5 text-xs bg-indigo-50 text-indigo-600 rounded mb-1">
                        {conv.subject}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-sm text-gray-600 truncate flex-1">{conv.lastMessage}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // VIEW 3: Chat
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
        <button
          onClick={handleBackToConversations}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900 truncate">
              {selectedConversation?.studentName}
            </h2>
            <span className="text-xs text-gray-500">({selectedConversation?.rollNumber})</span>
          </div>
          <p className="text-xs text-gray-500">{selectedConversation?.subject}</p>
        </div>
        <StatusBadge status={selectedConversation?.status ?? 'new'} />
        {selectedConversation?.status !== 'resolved' && (
          <button
            onClick={handleMarkResolved}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark as Resolved
          </button>
        )}
      </div>

      {/* Messages Area */}
      {msgError ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-gray-600">Failed to load messages</p>
          <button
            onClick={refetchMessages}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      ) : msgLoading ? (
        <SkeletonMessages />
      ) : !messages.length ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <MessageCircle className="h-12 w-12 mb-3 text-gray-300" />
          <p>No messages yet. Start the conversation.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex', msg.sender === 'teacher' ? 'justify-end' : 'justify-start')}
            >
              <div className="flex items-end gap-2 max-w-[75%]">
                {msg.sender === 'student' && (
                  <div className="flex-shrink-0 p-1.5 bg-gray-200 rounded-full">
                    <User className="h-3 w-3 text-gray-500" />
                  </div>
                )}
                <div>
                  <div
                    className={cn(
                      'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                      msg.sender === 'teacher'
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-white text-gray-900 border rounded-bl-md shadow-sm'
                    )}
                  >
                    {msg.message}
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-1 mt-1 text-[10px] text-gray-400',
                      msg.sender === 'teacher' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <span>{formatMessageTime(msg.timestamp)}</span>
                    {msg.sender === 'teacher' && (
                      msg.read ? (
                        <Eye className="h-3 w-3 text-blue-400" />
                      ) : (
                        <Eye className="h-3 w-3 text-gray-300" />
                      )
                    )}
                  </div>
                </div>
                {msg.sender === 'teacher' && (
                  <div className="flex-shrink-0 p-1.5 bg-indigo-100 rounded-full">
                    <User className="h-3 w-3 text-indigo-500" />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Message Input */}
      {selectedConversation?.status !== 'resolved' && (
        <div className="flex items-center gap-3 px-4 py-3 border-t bg-white">
          <input
            type="text"
            placeholder="Type your message..."
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
          This conversation has been resolved.
        </div>
      )}
    </div>
  )
}

export default TeacherDoubts

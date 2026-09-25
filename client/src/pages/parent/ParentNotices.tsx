import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import {
  RefreshCw,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Filter,
} from 'lucide-react'

function getTypeIcon(type: string) {
  switch (type?.toUpperCase()) {
    case 'URGENT':
      return { icon: AlertTriangle, color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' }
    case 'EMERGENCY':
      return { icon: AlertTriangle, color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' }
    case 'EVENT':
      return { icon: Calendar, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400' }
    case 'HOLIDAY':
      return { icon: CheckCircle2, color: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' }
    case 'ACADEMIC':
      return { icon: Info, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' }
    default:
      return { icon: Bell, color: 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400' }
  }
}

function getPriorityBadge(priority: string) {
  switch (priority?.toUpperCase()) {
    case 'URGENT':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'HIGH':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'NORMAL':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'LOW':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

function getTypeBadge(type: string) {
  switch (type?.toUpperCase()) {
    case 'ACADEMIC':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'EVENT':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'HOLIDAY':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'EMERGENCY':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

export function ParentNotices() {
  const [searchParams] = useSearchParams()
  const childId = searchParams.get('childId') || ''
  const [typeFilter, setTypeFilter] = useState('ALL')

  const { data: notices, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-notices', childId],
    queryFn: async () => {
      const res = await api.get(`/parent/notices?childId=${childId}`)
      return res.data?.data ?? res.data
    },
    enabled: !!childId,
  })

  if (!childId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-lg text-gray-500 dark:text-gray-400">Select a child to view notices</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600 dark:text-gray-400">Failed to load notices</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const allNotices = notices || []
  const filteredNotices = typeFilter === 'ALL'
    ? allNotices
    : allNotices.filter((n: any) => n.type?.toUpperCase() === typeFilter)

  const types = ['ALL', 'ACADEMIC', 'EVENT', 'HOLIDAY', 'EMERGENCY', 'GENERAL']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notices & Announcements</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Stay updated with school notifications</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Filter by type */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-gray-400" />
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              typeFilter === t
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Notices List */}
      {filteredNotices.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center py-16">
          <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-lg text-gray-500 dark:text-gray-400">No notices available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotices.map((notice: any, idx: number) => {
            const { icon: TypeIcon, color } = getTypeIcon(notice.type)
            return (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg shrink-0 ${color}`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{notice.title}</h3>
                      {notice.priority && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityBadge(notice.priority)}`}>
                          {notice.priority}
                        </span>
                      )}
                      {notice.type && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadge(notice.type)}`}>
                          {notice.type}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{notice.message || notice.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                      {notice.author && <span>By {notice.author}</span>}
                      <span>
                        {notice.createdAt
                          ? new Date(notice.createdAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

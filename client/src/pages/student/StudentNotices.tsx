import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  AlertCircle,
  Bell,
  Info,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

export function StudentNotices() {
  const { data: notices, loading, error, refetch } = useApi('/student/notices')

  function getTypeIcon(type: string) {
    switch (type?.toUpperCase()) {
      case 'URGENT':
        return { icon: AlertTriangle, color: 'text-red-600 bg-red-50' }
      case 'WARNING':
        return { icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' }
      case 'SUCCESS':
        return { icon: CheckCircle2, color: 'text-green-600 bg-green-50' }
      case 'INFO':
        return { icon: Info, color: 'text-blue-600 bg-blue-50' }
      default:
        return { icon: Bell, color: 'text-gray-600 bg-gray-50' }
    }
  }

  function getPriorityBadge(priority: string) {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return 'bg-red-100 text-red-700'
      case 'HIGH':
        return 'bg-amber-100 text-amber-700'
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-700'
      case 'LOW':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600">Failed to load notices</p>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
          <p className="text-gray-500 text-sm">Announcements and notifications</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="space-y-3">
                <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : !notices?.length ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm text-center py-16 text-gray-500">
          <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg">No notices available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((notice: any, idx: number) => {
            const { icon: TypeIcon, color } = getTypeIcon(notice.type)
            return (
              <div
                key={idx}
                className={cn(
                  'bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow',
                  !notice.isRead && 'border-l-4 border-l-blue-500'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('p-2 rounded-lg shrink-0', color)}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={cn('font-semibold', notice.isRead ? 'text-gray-700' : 'text-gray-900')}>
                        {notice.title}
                      </h3>
                      {notice.priority && (
                        <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getPriorityBadge(notice.priority))}>
                          {notice.priority}
                        </span>
                      )}
                      {!notice.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notice.message}</p>
                    <p className="text-xs text-gray-400">
                      {notice.createdAt
                        ? new Date(notice.createdAt).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </p>
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

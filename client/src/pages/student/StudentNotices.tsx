import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, AlertCircle, Bell, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'

export function StudentNotices() {
  const { data: notices, loading, error, refetch } = useApi('/student/notices')

  function getTypeIcon(type: string) {
    switch (type?.toUpperCase()) {
      case 'URGENT': return { icon: AlertTriangle, color: 'text-red-400 bg-red-500/10' }
      case 'WARNING': return { icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10' }
      case 'SUCCESS': return { icon: CheckCircle2, color: 'text-green-400 bg-green-500/10' }
      case 'INFO': return { icon: Info, color: 'text-blue-400 bg-blue-500/10' }
      default: return { icon: Bell, color: 'text-slate-400 bg-slate-700' }
    }
  }

  function getPriorityBadge(priority: string) {
    switch (priority?.toUpperCase()) {
      case 'URGENT': return 'bg-red-500/10 text-red-400'
      case 'HIGH': return 'bg-amber-500/10 text-amber-400'
      case 'MEDIUM': return 'bg-blue-500/10 text-blue-400'
      case 'LOW': return 'bg-slate-700 text-slate-400'
      default: return 'bg-slate-700 text-slate-400'
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-400">Failed to load notices</p>
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
          <h1 className="text-2xl font-bold text-white">Notices</h1>
          <p className="text-slate-400 text-sm">Announcements and notifications</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="space-y-3">
                <div className="h-5 w-2/3 bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-700/50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : !notices?.length ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 text-center py-16">
          <Bell className="h-12 w-12 mx-auto mb-3 text-slate-600" />
          <p className="text-lg text-slate-400">No notices available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((notice: any, idx: number) => {
            const { icon: TypeIcon, color } = getTypeIcon(notice.type)
            return (
              <div
                key={idx}
                className={cn(
                  'bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors',
                  !notice.isRead && 'border-l-4 border-l-blue-500'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('p-2 rounded-lg shrink-0', color)}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={cn('font-semibold', notice.isRead ? 'text-slate-400' : 'text-white')}>
                        {notice.title}
                      </h3>
                      {notice.priority && (
                        <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getPriorityBadge(notice.priority))}>
                          {notice.priority}
                        </span>
                      )}
                      {!notice.isRead && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{notice.message}</p>
                    <p className="text-xs text-slate-500">
                      {notice.createdAt ? new Date(notice.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
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

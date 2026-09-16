import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  Bell,
  RefreshCw,
  CheckCheck,
  Filter,
  AlertCircle,
} from 'lucide-react'

const priorityBadge: Record<string, string> = {
  high: 'bg-red-500/15 text-red-400',
  medium: 'bg-yellow-500/15 text-yellow-400',
  low: 'bg-emerald-500/15 text-emerald-400',
}

export function PrincipalNotifications() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const { data, loading, error, refetch } = useApi('/notifications')

  const notifications = data?.notifications || data?.data?.notifications || data || []

  const filtered = filter === 'unread'
    ? notifications.filter((n: any) => !n.isRead)
    : notifications

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`)
      refetch()
    } catch (e) {
      console.error(e)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-slate-400 text-sm">View and manage notifications</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-lg bg-red-500/15 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-white font-medium mb-1">Failed to load notifications</p>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white hover:bg-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 text-sm">View and manage notifications</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <div className="flex gap-2">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-lg font-medium transition-colors',
                  filter === f
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                )}
              >
                {f === 'all' ? 'All' : 'Unread'}
              </button>
            ))}
          </div>
          {notifications.some((n: any) => !n.isRead) && (
            <button
              onClick={async () => {
                try {
                  const unread = notifications.filter((n: any) => !n.isRead)
                  await Promise.all(unread.map((n: any) => api.put(`/notifications/${n.id}/read`)))
                  refetch()
                } catch (e) {
                  console.error(e)
                }
              }}
              className="ml-auto flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-500/15 text-indigo-400 rounded-lg hover:bg-indigo-500/25 transition-colors"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Bell className="w-12 h-12 mb-3 text-slate-600" />
            <p>{filter === 'unread' ? 'No unread notifications' : 'No notifications'}</p>
          </div>
        ) : (
          filtered.map((notif: any) => (
            <button
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
              className={cn(
                'w-full text-left rounded-xl border p-4 transition-colors hover:bg-slate-700/30',
                notif.isRead ? 'bg-slate-800 border-slate-700' : 'bg-slate-800 border-indigo-500/30'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                    notif.priority === 'high' ? 'bg-red-500/15' : 'bg-indigo-500/15'
                  )}
                >
                  <Bell className={cn('w-5 h-5', notif.priority === 'high' ? 'text-red-400' : 'text-indigo-400')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">{notif.title}</h3>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                    {notif.priority && (
                      <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium capitalize shrink-0', priorityBadge[notif.priority])}>
                        {notif.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">{notif.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

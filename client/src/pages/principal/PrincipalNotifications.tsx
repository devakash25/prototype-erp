import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  Bell,
  RefreshCw,
  CheckCheck,
  Filter,
} from 'lucide-react'

const priorityBadge: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

export function PrincipalNotifications() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const { data, loading, refetch } = useApi('/notifications')

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm">View and manage notifications</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex gap-2">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-lg font-medium transition-colors',
                  filter === f
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              className="ml-auto flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
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
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Bell className="w-12 h-12 mb-3 text-gray-300" />
            <p>{filter === 'unread' ? 'No unread notifications' : 'No notifications'}</p>
          </div>
        ) : (
          filtered.map((notif: any) => (
            <button
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
              className={cn(
                'w-full text-left bg-white rounded-xl border p-4 transition-colors hover:bg-gray-50',
                notif.isRead ? 'border-gray-200' : 'border-indigo-200 bg-indigo-50/30'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                    notif.priority === 'high' ? 'bg-red-100' : 'bg-indigo-100'
                  )}
                >
                  <Bell className={cn('w-5 h-5', notif.priority === 'high' ? 'text-red-600' : 'text-indigo-600')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{notif.title}</h3>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                    {notif.priority && (
                      <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium capitalize shrink-0', priorityBadge[notif.priority])}>
                        {notif.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

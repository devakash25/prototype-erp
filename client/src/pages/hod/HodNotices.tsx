import { useApi } from '@/hooks/useApi'
import { RefreshCw, Bell, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HodNotices() {
  const { data, loading, error, refetch } = useApi<any[]>('/hod/notices')
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-4"><p className="text-red-500">{error}</p><button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button></div>
  const notices = data || []
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Department Notices</h1><p className="text-gray-500 text-sm">Notifications and announcements</p></div>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="space-y-3">
        {notices.map((n: any) => (
          <div key={n.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-4">
              <div className={cn('p-2 rounded-lg shrink-0', n.priority === 'URGENT' ? 'bg-red-50' : n.priority === 'HIGH' ? 'bg-amber-50' : 'bg-blue-50')}>
                <Bell className={cn('w-5 h-5', n.priority === 'URGENT' ? 'text-red-600' : n.priority === 'HIGH' ? 'text-amber-600' : 'text-blue-600')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{n.title}</h3>
                  {n.priority && <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', n.priority === 'URGENT' ? 'bg-red-50 text-red-700' : n.priority === 'HIGH' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700')}>{n.priority}</span>}
                </div>
                <p className="text-sm text-gray-600 mb-2">{n.message}</p>
                <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
        {notices.length === 0 && <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-2"><AlertCircle className="w-8 h-8" /><p>No notices found</p></div>}
      </div>
    </div>
  )
}

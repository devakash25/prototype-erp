import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { RefreshCw, HelpCircle, CheckCircle, XCircle, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HodHelpdesk() {
  const [statusFilter, setStatusFilter] = useState('all')
  const { data, loading, error, refetch } = useApi<any>(`/hod/helpdesk?status=${statusFilter}`, [statusFilter])
  const handleAction = async (id: string, action: string) => {
    try { await api.post(`/hod/helpdesk/${id}/action`, { action }); refetch() } catch (e) { console.error(e) }
  }
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-4"><p className="text-red-500">{error}</p><button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button></div>
  const d = data || {}
  const tickets = d.tickets || []
  const summary = d.summary || []
  const getCount = (s: string) => summary.find((x: any) => x.status === s)?._count || 0
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Helpdesk</h1><p className="text-gray-500 text-sm">Department helpdesk tickets</p></div>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', count: d.total || 0, color: 'gray' },
          { label: 'Open', count: getCount('OPEN'), color: 'blue' },
          { label: 'In Progress', count: getCount('IN_PROGRESS'), color: 'yellow' },
          { label: 'Resolved', count: getCount('RESOLVED'), color: 'green' },
          { label: 'Closed', count: getCount('CLOSED'), color: 'gray' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-sm text-gray-500">{s.label}</p><p className="text-xl font-bold text-gray-900">{s.count}</p></div>
        ))}
      </div>
      <div className="flex gap-2">
        {['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-4 py-2 rounded-lg text-sm font-medium', statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>{s === 'all' ? 'All' : s.replace('_', ' ')}</button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50"><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creator</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.creator?.fullName}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{t.category}</span></td>
                  <td className="px-6 py-4"><span className={cn('px-2 py-1 text-xs font-medium rounded-full', t.priority === 'URGENT' ? 'bg-red-50 text-red-700' : t.priority === 'HIGH' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700')}>{t.priority}</span></td>
                  <td className="px-6 py-4"><span className={cn('px-2 py-1 text-xs font-medium rounded-full', t.status === 'OPEN' ? 'bg-blue-50 text-blue-700' : t.status === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-700' : t.status === 'RESOLVED' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700')}>{t.status}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {t.status === 'OPEN' && <button onClick={() => handleAction(t.id, 'assign')} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Assign"><UserPlus className="w-4 h-4" /></button>}
                      {(t.status === 'OPEN' || t.status === 'IN_PROGRESS') && <button onClick={() => handleAction(t.id, 'resolve')} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Resolve"><CheckCircle className="w-4 h-4" /></button>}
                      {t.status === 'RESOLVED' && <button onClick={() => handleAction(t.id, 'close')} className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100" title="Close"><XCircle className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No tickets found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

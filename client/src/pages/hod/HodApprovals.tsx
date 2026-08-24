import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { RefreshCw, ClipboardList, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HodApprovals() {
  const [status, setStatus] = useState('all')
  const { data, loading, error, refetch } = useApi<any>(`/hod/workflows?status=${status}`, [status])
  const handleAction = async (id: string, action: string) => {
    try { await api.post(`/hod/workflows/${id}/action`, { action }); refetch() } catch (e) { console.error(e) }
  }
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-4"><p className="text-red-500">{error}</p><button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button></div>
  const d = data || {}
  const workflows = d.workflows || []
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Approvals</h1><p className="text-gray-500 text-sm">Review and approve workflow requests</p></div>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setStatus(s)} className={cn('px-4 py-2 rounded-lg text-sm font-medium', status === s ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50"><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creator</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {workflows.map((w: any) => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{w.title}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700">{w.type}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{w.creator?.fullName}</td>
                  <td className="px-6 py-4"><span className={cn('px-2 py-1 text-xs font-medium rounded-full', w.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' : w.status === 'APPROVED' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>{w.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(w.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {w.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(w.id, 'approve')} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => handleAction(w.id, 'reject')} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><XCircle className="w-4 h-4" /></button>
                      </div>
                    ) : <span className="text-xs text-gray-400">{w.actions?.length || 0} action(s)</span>}
                  </td>
                </tr>
              ))}
              {workflows.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No workflows found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

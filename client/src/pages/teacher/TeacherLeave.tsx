import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { RefreshCw, Plus, X, Calendar as CalIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TeacherLeave() {
  const { data: leaves, loading, error, refetch } = useApi<any[]>('/teacher/leave')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: 'casual', startDate: '', endDate: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try { await api.post('/teacher/leave', form); setShowForm(false); setForm({ type: 'casual', startDate: '', endDate: '', reason: '' }); refetch() } catch (err) { console.error(err) }
    setSubmitting(false)
  }

  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-4"><p className="text-red-500">{error}</p><button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button></div>
  const list = leaves || []
  const pending = list.filter((l: any) => l.status === 'pending').length
  const approved = list.filter((l: any) => l.status === 'approved').length
  const rejected = list.filter((l: any) => l.status === 'rejected').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Leave Management</h1><p className="text-gray-500 text-sm">Apply and track leave requests</p></div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><Plus className="w-4 h-4" />Apply Leave</button>
          <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-sm text-gray-500">Pending</p><p className="text-xl font-bold text-amber-600">{pending}</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-sm text-gray-500">Approved</p><p className="text-xl font-bold text-green-600">{approved}</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-sm text-gray-500">Rejected</p><p className="text-xl font-bold text-red-600">{rejected}</p></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50"><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {list.map((l: any) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">{l.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(l.startDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(l.endDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{l.totalDays}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{l.reason}</td>
                  <td className="px-6 py-4"><span className={cn('px-2 py-1 text-xs font-medium rounded-full', l.status === 'pending' ? 'bg-amber-50 text-amber-700' : l.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>{l.status}</span></td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No leave records</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Apply Leave</h2><button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="casual">Casual</option><option value="sick">Sick</option><option value="earned">Earned</option><option value="unpaid">Unpaid</option></select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label><input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Reason</label><textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button><button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { AlertTriangle, Plus, X } from 'lucide-react'

export function HostelComplaints() {
  const [status, setStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'plumbing', priority: 'NORMAL' })
  const qc = useQueryClient()

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['hostel-complaints', status],
    queryFn: () => api.get('/hostel/complaints', { params: { status } }).then(r => r.data),
  })

  const createMut = useMutation({
    mutationFn: (data: any) => api.post('/hostel/complaints', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hostel-complaints'] }); setShowForm(false); setForm({ title: '', description: '', category: 'plumbing', priority: 'NORMAL' }) },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch(`/hostel/complaints/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hostel-complaints'] }),
  })

  const categories = ['plumbing', 'electricity', 'furniture', 'cleaning', 'security', 'food', 'other']
  const priorityColors: any = { LOW: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400', NORMAL: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', HIGH: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', URGENT: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' }
  const statusColors: any = { OPEN: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', IN_PROGRESS: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400', RESOLVED: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', CLOSED: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><AlertTriangle className="w-6 h-6" /> Hostel Complaints</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"><Plus className="w-4 h-4" /> Raise Complaint</button>
      </div>

      <div className="flex gap-2">
        {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(s => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm ${status === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}>{s || 'All'}</button>
        ))}
      </div>

      {showForm && (
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800 space-y-3">
          <div className="flex items-center justify-between"><h3 className="font-semibold dark:text-white">Raise Complaint</h3><button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="block text-xs dark:text-gray-400 mb-1">Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" /></div>
            <div className="col-span-2"><label className="block text-xs dark:text-gray-400 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" /></div>
            <div><label className="block text-xs dark:text-gray-400 mb-1">Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm capitalize">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="block text-xs dark:text-gray-400 mb-1">Priority</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm">{['LOW', 'NORMAL', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          </div>
          <button onClick={() => form.title && createMut.mutate(form)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">Submit</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800"><tr>
            <th className="px-4 py-3 text-left dark:text-gray-300">Title</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Category</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Student</th>
            <th className="px-4 py-3 text-center dark:text-gray-300">Priority</th>
            <th className="px-4 py-3 text-center dark:text-gray-300">Status</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Date</th>
            <th className="px-4 py-3 text-right dark:text-gray-300">Action</th>
          </tr></thead>
          <tbody className="divide-y dark:divide-gray-700">
            {isLoading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr> :
              (complaints || []).length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No complaints</td></tr> :
              (complaints || []).map((c: any) => (
                <tr key={c.id} className="dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 dark:text-white">{c.title}</td>
                  <td className="px-4 py-3 dark:text-gray-300 capitalize">{c.category}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{c.creator?.firstName || '-'}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs ${priorityColors[c.priority] || ''}`}>{c.priority}</span></td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs ${statusColors[c.status] || ''}`}>{c.status}</span></td>
                  <td className="px-4 py-3 dark:text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                      <select value={c.status} onChange={e => updateMut.mutate({ id: c.id, status: e.target.value })} className="text-xs px-2 py-1 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Bell, Plus, CheckCircle, Clock, AlertTriangle, Info, Send, X, Edit3, Trash2, RefreshCw } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'

const typeIcons: Record<string, typeof Bell> = { INFO: Info, SUCCESS: CheckCircle, WARNING: AlertTriangle, ERROR: AlertTriangle, ACADEMIC: Bell, FEE: Bell, EVENT: Bell, GENERAL: Bell }
const typeColors: Record<string, string> = { INFO: 'bg-blue-100 text-blue-600', SUCCESS: 'bg-green-100 text-green-600', WARNING: 'bg-yellow-100 text-yellow-600', ERROR: 'bg-red-100 text-red-600', ACADEMIC: 'bg-indigo-100 text-indigo-600', FEE: 'bg-orange-100 text-orange-600', EVENT: 'bg-purple-100 text-purple-600', GENERAL: 'bg-gray-100 text-gray-600' }

const emptyForm = { title: '', message: '', type: 'GENERAL', target: 'ALL_STUDENTS', scheduledAt: '' }

export function NotificationsPage() {
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [targetFilter, setTargetFilter] = useState('ALL')
  const { data, loading, refetch } = useApi('/notifications?limit=50')
  const notifications = (data?.notifications || []).filter((n: any) => {
    if (typeFilter !== 'ALL' && n.type !== typeFilter) return false
    if (targetFilter !== 'ALL' && n.target !== targetFilter) return false
    return true
  })

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (n: any) => {
    setEditingId(n.id)
    setForm({
      title: n.title || '',
      message: n.message || '',
      type: n.type || 'GENERAL',
      target: n.target || 'ALL_STUDENTS',
      scheduledAt: n.scheduledAt ? new Date(n.scheduledAt).toISOString().slice(0, 16) : '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.message) {
      alert('Title and message are required')
      return
    }
    setSaving(true)
    try {
      const payload: any = {
        title: form.title,
        message: form.message,
        type: form.type,
        target: form.target,
      }
      if (form.scheduledAt) {
        payload.scheduledAt = new Date(form.scheduledAt).toISOString()
      }

      if (editingId) {
        await api.put(`/notifications/${editingId}`, payload)
      } else {
        await api.post('/notifications', payload)
      }
      setShowModal(false)
      refetch()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save notification')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return
    try {
      await api.delete(`/notifications/${id}`)
      refetch()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Notifications</h1><p className="text-sm text-gray-500">Send and manage institutional notifications</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"><Plus className="w-4 h-4" />Create Notification</button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="ALL">All Types</option>
          <option value="ACADEMIC">Academic</option><option value="FEE">Fee</option><option value="EVENT">Event</option><option value="GENERAL">General</option>
        </select>
        <select value={targetFilter} onChange={(e) => setTargetFilter(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="ALL">All Targets</option>
          <option value="ALL_STUDENTS">All Students</option><option value="ALL_EMPLOYEES">All Employees</option><option value="ALL_PARENTS">All Parents</option>
        </select>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Bell className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-gray-900">{data?.stats?.total || 0}</p><p className="text-xs text-gray-500">Total</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Send className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold text-green-600">{data?.stats?.sent || 0}</p><p className="text-xs text-gray-500">Sent</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><Clock className="w-5 h-5 text-orange-600" /></div><div><p className="text-2xl font-bold text-orange-600">{data?.stats?.pending || 0}</p><p className="text-xs text-gray-500">Scheduled</p></div></div></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="divide-y divide-gray-100">
          {loading ? <div className="px-5 py-10 text-center text-sm text-gray-500">Loading...</div> :
            notifications.length === 0 ? <div className="px-5 py-10 text-center text-sm text-gray-500">No notifications found</div> :
            notifications.map((n: any) => {
              const Icon = typeIcons[n.type] || Bell
              return (
                <div key={n.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className={cn('p-2 rounded-lg mt-0.5', typeColors[n.type] || 'bg-gray-100')}><Icon className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{n.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{n.type}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{n.message}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>Target: {n.target?.replace('ALL_', '').replace('_', ' ')}</span>
                      <span>{formatDate(n.createdAt || n.scheduledAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(n)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                      <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button onClick={() => handleDelete(n.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Notification' : 'Create Notification'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Notification title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  rows={4} placeholder="Write your notification message..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                    <option value="GENERAL">General</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="FEE">Fee</option>
                    <option value="EVENT">Event</option>
                    <option value="INFO">Info</option>
                    <option value="SUCCESS">Success</option>
                    <option value="WARNING">Warning</option>
                    <option value="ERROR">Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                  <select value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                    <option value="ALL_STUDENTS">All Students</option>
                    <option value="ALL_EMPLOYEES">All Employees</option>
                    <option value="ALL_PARENTS">All Parents</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (optional)</label>
                <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <p className="text-xs text-gray-400 mt-1">Leave empty to send immediately</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Send Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

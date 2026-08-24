import { useState } from 'react'
import { Megaphone, Plus, Calendar, Send, Eye, Edit3, Trash2, X, RefreshCw } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'

const typeColors: Record<string, string> = { ACADEMIC: 'bg-indigo-100 text-indigo-700', EVENT: 'bg-purple-100 text-purple-700', FEE: 'bg-orange-100 text-orange-700', GENERAL: 'bg-gray-100 text-gray-700', HOLIDAY: 'bg-green-100 text-green-700', EXAM: 'bg-red-100 text-red-700' }

const emptyForm = { title: '', content: '', type: 'GENERAL', target: 'ALL_STUDENTS', priority: 'MEDIUM', status: 'DRAFT' }

export function AnnouncementsPage() {
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const { data, loading, refetch } = useApi('/announcements?limit=50')
  const announcements = (data?.announcements || []).filter((a: any) => {
    if (typeFilter !== 'ALL' && a.type !== typeFilter) return false
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false
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

  const openEdit = (a: any) => {
    setEditingId(a.id)
    setForm({
      title: a.title || '',
      content: a.content || a.message || '',
      type: a.type || 'GENERAL',
      target: a.target || 'ALL_STUDENTS',
      priority: a.priority || 'MEDIUM',
      status: a.status || 'DRAFT',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.content) {
      alert('Title and content are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        content: form.content,
        type: form.type,
        target: form.target,
        priority: form.priority,
        status: form.status,
      }

      if (editingId) {
        await api.put(`/announcements/${editingId}`, payload)
      } else {
        await api.post('/announcements', payload)
      }
      setShowModal(false)
      refetch()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save announcement')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    try {
      await api.delete(`/announcements/${id}`)
      refetch()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.put(`/announcements/${id}`, { status: newStatus })
      refetch()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Announcements</h1><p className="text-sm text-gray-500">Create and manage institutional announcements</p></div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"><Plus className="w-4 h-4" />Create Announcement</button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="ALL">All Types</option>
          <option value="ACADEMIC">Academic</option><option value="EVENT">Event</option><option value="FEE">Fee</option><option value="GENERAL">General</option><option value="HOLIDAY">Holiday</option><option value="EXAM">Exam</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="ALL">All Status</option>
          <option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Megaphone className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-gray-900">{data?.stats?.total || 0}</p><p className="text-xs text-gray-500">Total</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Send className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold text-green-600">{data?.stats?.published || 0}</p><p className="text-xs text-gray-500">Published</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><Eye className="w-5 h-5 text-orange-600" /></div><div><p className="text-2xl font-bold text-orange-600">{data?.stats?.draft || 0}</p><p className="text-xs text-gray-500">Draft</p></div></div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {announcements.map((a: any) => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', typeColors[a.type] || 'bg-gray-100 text-gray-700')}>{a.type}</span>
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', a.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : a.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700')}>{a.status}</span>
              </div>
              <div className="flex items-center gap-1">
                {a.status === 'DRAFT' && (
                  <button onClick={() => handleStatusChange(a.id, 'PUBLISHED')} className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors" title="Publish">
                    Publish
                  </button>
                )}
                {a.status === 'PUBLISHED' && (
                  <button onClick={() => handleStatusChange(a.id, 'ARCHIVED')} className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Archive">
                    Archive
                  </button>
                )}
                <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                  <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button onClick={() => handleDelete(a.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{a.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{a.content || a.message}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /><span>{formatDate(a.createdAt)}</span></div>
              {a.target && <span className="px-2 py-0.5 bg-gray-100 rounded-full">{a.target.replace('ALL_', '').replace('_', ' ')}</span>}
              {a.priority && <span className="px-2 py-0.5 bg-gray-100 rounded-full">{a.priority}</span>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Announcement' : 'Create Announcement'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Announcement title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  rows={5} placeholder="Write your announcement content..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                    <option value="GENERAL">General</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="EVENT">Event</option>
                    <option value="FEE">Fee</option>
                    <option value="HOLIDAY">Holiday</option>
                    <option value="EXAM">Exam</option>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

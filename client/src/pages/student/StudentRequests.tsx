import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import { RefreshCw, LifeBuoy, Search, Plus, X, Send, AlertCircle } from 'lucide-react'

const statusOptions = ['all', 'open', 'in_progress', 'resolved', 'closed'] as const
const categoryOptions = ['all', 'academic', 'finance', 'hostel', 'transport', 'library', 'general'] as const

const statusBadge: Record<string, string> = {
  open: 'bg-green-500/15 text-green-400',
  in_progress: 'bg-yellow-500/15 text-yellow-400',
  resolved: 'bg-blue-500/15 text-blue-400',
  closed: 'bg-slate-500/15 text-slate-400',
}

const categoryBadge: Record<string, string> = {
  academic: 'bg-purple-500/15 text-purple-400',
  finance: 'bg-emerald-500/15 text-emerald-400',
  hostel: 'bg-orange-500/15 text-orange-400',
  transport: 'bg-blue-500/15 text-blue-400',
  library: 'bg-teal-500/15 text-teal-400',
  general: 'bg-slate-500/15 text-slate-400',
}

export function StudentRequests() {
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const { data: requests, loading, error, refetch } = useApi<any[]>('/student/requests')
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newCategory, setNewCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async () => {
    if (!newTitle.trim()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await api.post('/student/requests', {
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory,
      })
      setShowNewRequest(false)
      setNewTitle('')
      setNewDescription('')
      setNewCategory('general')
      refetch()
    } catch (err: any) {
      setSubmitError(err.response?.data?.error?.message || 'Failed to create request')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-300">{error}</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
          Retry
        </button>
      </div>
    )
  }

  const items = requests || []
  const filtered = items.filter((r: any) => {
    const matchesStatus = status === 'all' || r.status === status
    const matchesCategory = category === 'all' || r.category === category
    const matchesSearch = r.title?.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Requests</h1>
          <p className="text-slate-400 text-sm">Track your complaints and support requests</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </button>
          <button
            onClick={() => setShowNewRequest(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> New Request
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace('_', ' ')}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <LifeBuoy className="w-12 h-12 mb-3 text-slate-600" />
            <p>No requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-700/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Description</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Category</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filtered.map((req: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-white">{req.title}</td>
                    <td className="px-5 py-4 text-sm text-slate-400 max-w-[200px] truncate">{req.description || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', categoryBadge[req.category] || 'bg-slate-500/15 text-slate-400')}>
                        {req.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', statusBadge[req.status] || 'bg-slate-500/15 text-slate-400')}>
                        {req.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden border border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">New Request</h3>
              <button
                onClick={() => { setShowNewRequest(false); setSubmitError('') }}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {submitError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Brief title for your request"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
                >
                  {categoryOptions.filter(c => c !== 'all').map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-900/50">
              <button
                onClick={() => { setShowNewRequest(false); setSubmitError('') }}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newTitle.trim() || submitting}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  newTitle.trim() && !submitting
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                )}
              >
                {submitting ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="h-4 w-4" /> Submit</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

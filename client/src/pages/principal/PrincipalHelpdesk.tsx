import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  LifeBuoy,
  RefreshCw,
  Search,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  CircleDashed,
  UserPlus,
} from 'lucide-react'

const statusOptions = ['all', 'open', 'in_progress', 'resolved', 'closed'] as const
const categoryOptions = ['all', 'academic', 'finance', 'hostel', 'transport', 'library', 'general'] as const

const priorityBadge: Record<string, string> = {
  low: 'bg-emerald-500/15 text-emerald-400',
  medium: 'bg-yellow-500/15 text-yellow-400',
  high: 'bg-orange-500/15 text-orange-400',
  urgent: 'bg-red-500/15 text-red-400',
}

const statusBadge: Record<string, string> = {
  open: 'bg-blue-500/15 text-blue-400',
  in_progress: 'bg-indigo-500/15 text-indigo-400',
  resolved: 'bg-emerald-500/15 text-emerald-400',
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

export function PrincipalHelpdesk() {
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [actionComments, setActionComments] = useState<Record<string, string>>({})
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null)

  const { data, loading, error, refetch } = useApi(
    `/principal/helpdesk?status=${status === 'all' ? '' : status}&category=${category === 'all' ? '' : category}&page=${page}&limit=20`
  )

  const tickets = data?.tickets || []
  const summary = data?.summary || { open: 0, inProgress: 0, resolved: 0, closed: 0 }
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 20)

  const filtered = tickets.filter((t: any) =>
    (t.title || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleAction = async (id: string, action: string) => {
    const label = action === 'resolve' ? 'resolve' : action === 'close' ? 'close' : action
    if (!window.confirm(`Are you sure you want to ${label} this ticket?`)) return
    try {
      await api.post(`/principal/helpdesk/${id}/action`, { action, comments: actionComments[id] || '' })
      setActionComments((prev) => { const n = { ...prev }; delete n[id]; return n })
      setShowCommentsFor(null)
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
            <h1 className="text-2xl font-bold text-white">Helpdesk</h1>
            <p className="text-slate-400 text-sm">Manage support tickets</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-lg bg-red-500/15 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-white font-medium mb-1">Failed to load helpdesk tickets</p>
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
          <h1 className="text-2xl font-bold text-white">Helpdesk</h1>
          <p className="text-slate-400 text-sm">Manage support tickets</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: total, icon: LifeBuoy, color: 'bg-slate-500/15 text-slate-400' },
          { label: 'Open', value: summary.open, icon: CircleDashed, color: 'bg-blue-500/15 text-blue-400' },
          { label: 'In Progress', value: summary.inProgress, icon: Clock, color: 'bg-indigo-500/15 text-indigo-400' },
          { label: 'Resolved', value: summary.resolved, icon: CheckCircle, color: 'bg-emerald-500/15 text-emerald-400' },
          { label: 'Closed', value: summary.closed, icon: XCircle, color: 'bg-slate-500/15 text-slate-500' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', s.color)}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{s.label}</p>
                <p className="text-lg font-bold text-white">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace('_', ' ')}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <LifeBuoy className="w-12 h-12 mb-3 text-slate-600" />
            <p>No tickets found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Title</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Creator</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Assignee</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Priority</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Created</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filtered.map((ticket: any) => (
                    <tr key={ticket.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-white max-w-[200px] truncate">{ticket.title}</td>
                      <td className="px-4 py-3 text-slate-400">{ticket.creator?.fullName || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{ticket.assignee?.fullName || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', categoryBadge[ticket.category] || 'bg-slate-700 text-slate-400')}>
                          {ticket.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', priorityBadge[ticket.priority] || 'bg-slate-700 text-slate-400')}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', statusBadge[ticket.status] || 'bg-slate-700 text-slate-400')}>
                          {ticket.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                              <>
                                {!ticket.assignee && (
                                  <button
                                    onClick={() => handleAction(ticket.id, 'assign')}
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-500/15 text-indigo-400 rounded-lg hover:bg-indigo-500/25 transition-colors"
                                  >
                                    <UserPlus className="w-3 h-3" />
                                    Assign
                                  </button>
                                )}
                                <button
                                  onClick={() => setShowCommentsFor(showCommentsFor === ticket.id ? null : ticket.id)}
                                  className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-500/15 text-emerald-400 rounded-lg hover:bg-emerald-500/25 transition-colors"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Resolve
                                </button>
                              </>
                            )}
                            {ticket.status === 'resolved' && (
                              <button
                                onClick={() => setShowCommentsFor(showCommentsFor === ticket.id ? null : ticket.id)}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-600 text-slate-300 rounded-lg hover:bg-slate-500 transition-colors"
                              >
                                <XCircle className="w-3 h-3" />
                                Close
                              </button>
                            )}
                          </div>
                          {showCommentsFor === ticket.id && (
                            <div className="w-64 bg-slate-900 border border-slate-600 rounded-lg p-3 space-y-2">
                              <textarea
                                placeholder="Add comments (optional)"
                                value={actionComments[ticket.id] || ''}
                                onChange={(e) => setActionComments((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                rows={3}
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => { setShowCommentsFor(null); setActionComments((prev) => { const n = { ...prev }; delete n[ticket.id]; return n }) }}
                                  className="px-2 py-1 text-xs text-slate-400 hover:text-white transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleAction(ticket.id, ticket.status === 'resolved' ? 'close' : 'resolve')}
                                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                  Confirm
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-700 px-4 py-3">
                <p className="text-xs text-slate-500">
                  Page {page} of {totalPages} ({total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-xs border border-slate-700 rounded-lg text-white disabled:opacity-50 hover:bg-slate-700 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-xs border border-slate-700 rounded-lg text-white disabled:opacity-50 hover:bg-slate-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

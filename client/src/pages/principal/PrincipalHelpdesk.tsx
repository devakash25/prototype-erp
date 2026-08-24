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
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

const statusBadge: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
}

const categoryBadge: Record<string, string> = {
  academic: 'bg-purple-100 text-purple-700',
  finance: 'bg-emerald-100 text-emerald-700',
  hostel: 'bg-orange-100 text-orange-700',
  transport: 'bg-blue-100 text-blue-700',
  library: 'bg-teal-100 text-teal-700',
  general: 'bg-gray-100 text-gray-700',
}

export function PrincipalHelpdesk() {
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, loading, refetch } = useApi(
    `/principal/helpdesk?status=${status === 'all' ? '' : status}&category=${category === 'all' ? '' : category}&page=${page}&limit=20`
  )

  const tickets = data?.tickets || []
  const summary = data?.summary || { open: 0, inProgress: 0, resolved: 0, closed: 0 }
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 20)

  const filtered = tickets.filter((t: any) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleAction = async (id: string, action: string) => {
    try {
      await api.post(`/principal/helpdesk/${id}/action`, { action, comments: '' })
      refetch()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Helpdesk</h1>
          <p className="text-gray-500 text-sm">Manage support tickets</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: total, icon: LifeBuoy, color: 'bg-gray-100 text-gray-700' },
          { label: 'Open', value: summary.open, icon: CircleDashed, color: 'bg-blue-100 text-blue-700' },
          { label: 'In Progress', value: summary.inProgress, icon: Clock, color: 'bg-indigo-100 text-indigo-700' },
          { label: 'Resolved', value: summary.resolved, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
          { label: 'Closed', value: summary.closed, icon: XCircle, color: 'bg-gray-100 text-gray-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', s.color)}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace('_', ' ')}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <LifeBuoy className="w-12 h-12 mb-3 text-gray-300" />
            <p>No tickets found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Creator</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Assignee</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Priority</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((ticket: any) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{ticket.title}</td>
                      <td className="px-4 py-3 text-gray-600">{ticket.creator?.fullName || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{ticket.assignee?.fullName || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', categoryBadge[ticket.category] || 'bg-gray-100 text-gray-600')}>
                          {ticket.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', priorityBadge[ticket.priority] || 'bg-gray-100 text-gray-600')}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', statusBadge[ticket.status] || 'bg-gray-100 text-gray-600')}>
                          {ticket.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                            <>
                              {!ticket.assignee && (
                                <button
                                  onClick={() => handleAction(ticket.id, 'assign')}
                                  className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
                                >
                                  <UserPlus className="w-3 h-3" />
                                  Assign
                                </button>
                              )}
                              <button
                                onClick={() => handleAction(ticket.id, 'resolve')}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Resolve
                              </button>
                            </>
                          )}
                          {ticket.status === 'resolved' && (
                            <button
                              onClick={() => handleAction(ticket.id, 'close')}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                            >
                              <XCircle className="w-3 h-3" />
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-500">
                  Page {page} of {totalPages} ({total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
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

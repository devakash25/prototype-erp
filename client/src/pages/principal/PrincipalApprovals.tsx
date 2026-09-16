import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  ClipboardCheck,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'

const statusOptions = ['all', 'pending', 'approved', 'rejected'] as const
const typeOptions = ['all', 'admission', 'leave', 'fee_waiver', 'certificate', 'transfer', 'noc', 'other'] as const

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  rejected: 'bg-red-500/15 text-red-400',
}

const typeBadge: Record<string, string> = {
  admission: 'bg-blue-500/15 text-blue-400',
  leave: 'bg-orange-500/15 text-orange-400',
  fee_waiver: 'bg-emerald-500/15 text-emerald-400',
  certificate: 'bg-purple-500/15 text-purple-400',
  transfer: 'bg-indigo-500/15 text-indigo-400',
  noc: 'bg-teal-500/15 text-teal-400',
  other: 'bg-slate-500/15 text-slate-400',
}

const priorityBadge: Record<string, string> = {
  low: 'bg-emerald-500/15 text-emerald-400',
  medium: 'bg-yellow-500/15 text-yellow-400',
  high: 'bg-orange-500/15 text-orange-400',
  urgent: 'bg-red-500/15 text-red-400',
}

export function PrincipalApprovals() {
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, loading, error, refetch } = useApi(
    `/principal/workflows?status=${status === 'all' ? '' : status}&type=${type === 'all' ? '' : type}&page=${page}&limit=20`
  )

  const workflows = data?.workflows || []
  const summary = data?.summary || { pending: 0, approved: 0, rejected: 0 }
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 20)

  const filtered = workflows.filter((w: any) =>
    (w.title || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleAction = async (id: string, action: string) => {
    const label = action === 'approve' ? 'approve' : 'reject'
    if (!window.confirm(`Are you sure you want to ${label} this workflow?`)) return
    try {
      await api.post(`/principal/workflows/${id}/action`, { action })
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
            <h1 className="text-2xl font-bold text-white">Approvals</h1>
            <p className="text-slate-400 text-sm">Review and approve pending workflows</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-lg bg-red-500/15 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-white font-medium mb-1">Failed to load workflows</p>
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
          <h1 className="text-2xl font-bold text-white">Approvals</h1>
          <p className="text-slate-400 text-sm">Review and approve pending workflows</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: summary.pending, icon: Clock, color: 'bg-yellow-500/15 text-yellow-400' },
          { label: 'Approved', value: summary.approved, icon: CheckCircle, color: 'bg-emerald-500/15 text-emerald-400' },
          { label: 'Rejected', value: summary.rejected, icon: XCircle, color: 'bg-red-500/15 text-red-400' },
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
              <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {typeOptions.map((t) => (
              <option key={t} value={t}>{t === 'all' ? 'All Types' : t.replace('_', ' ')}</option>
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
            <ClipboardCheck className="w-12 h-12 mb-3 text-slate-600" />
            <p>No workflows found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Title</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Creator</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Priority</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Created</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filtered.map((wf: any) => (
                    <tr key={wf.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-white max-w-[200px] truncate">{wf.title || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', typeBadge[wf.type] || 'bg-slate-700 text-slate-400')}>
                          {wf.type?.replace('_', ' ') || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{wf.creator?.fullName || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', priorityBadge[wf.priority] || 'bg-slate-700 text-slate-400')}>
                          {wf.priority || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', statusBadge[wf.status] || 'bg-slate-700 text-slate-400')}>
                          {wf.status || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {wf.createdAt ? new Date(wf.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {wf.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(wf.id, 'approve')}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-500/15 text-emerald-400 rounded-lg hover:bg-emerald-500/25 transition-colors"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(wf.id, 'reject')}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/25 transition-colors"
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </button>
                            </>
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

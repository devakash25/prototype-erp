import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  CalendarDays,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'

const statusOptions = ['all', 'pending', 'approved', 'rejected'] as const

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  rejected: 'bg-red-500/15 text-red-400',
}

export function PrincipalLeave() {
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, loading, error, refetch } = useApi(
    `/principal/leave?status=${status === 'all' ? '' : status}&page=${page}&limit=20`
  )

  const leaves = data?.leaves || []
  const summary = data?.summary || { pending: 0, approved: 0, rejected: 0 }
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 20)

  const filtered = leaves.filter((l: any) =>
    l.employee?.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  )

  const handleAction = async (id: string, action: string) => {
    const label = action === 'approve' ? 'approve' : 'reject'
    if (!window.confirm(`Are you sure you want to ${label} this leave request?`)) return
    try {
      await api.post(`/principal/leave/${id}/action`, { action })
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
            <h1 className="text-2xl font-bold text-white">Leave Management</h1>
            <p className="text-slate-400 text-sm">Review and manage employee leave requests</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-lg bg-red-500/15 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-white font-medium mb-1">Failed to load leave requests</p>
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
          <h1 className="text-2xl font-bold text-white">Leave Management</h1>
          <p className="text-slate-400 text-sm">Review and manage employee leave requests</p>
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
              placeholder="Search by employee name..."
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
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <CalendarDays className="w-12 h-12 mb-3 text-slate-600" />
            <p>No leave requests found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Employee</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Department</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Designation</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Start</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">End</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Days</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Reason</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filtered.map((leave: any) => (
                    <tr key={leave.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">
                        {leave.employee?.user?.fullName || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{leave.employee?.department || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{leave.employee?.designation || '—'}</td>
                      <td className="px-4 py-3 text-slate-400 capitalize">{leave.type}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {new Date(leave.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-white">{leave.totalDays}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-[150px] truncate">{leave.reason || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', statusBadge[leave.status] || 'bg-slate-700 text-slate-400')}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {leave.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(leave.id, 'approve')}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-500/15 text-emerald-400 rounded-lg hover:bg-emerald-500/25 transition-colors"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(leave.id, 'reject')}
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

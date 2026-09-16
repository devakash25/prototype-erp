import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import {
  RefreshCw,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function getStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case 'completed': return 'bg-green-500/15 text-green-400'
    case 'scheduled': return 'bg-blue-500/15 text-blue-400'
    case 'in_progress': return 'bg-yellow-500/15 text-yellow-400'
    case 'pending': return 'bg-orange-500/15 text-orange-400'
    case 'failed': return 'bg-red-500/15 text-red-400'
    default: return 'bg-slate-500/15 text-slate-400'
  }
}

export function VicePrincipalInspections() {
  const [searchParams] = useSearchParams()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vice-principal-inspections'],
    queryFn: async () => {
      const res = await api.get('/vice-principal/inspections')
      return res.data?.data ?? res.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-400">Failed to load inspection records</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const d = data || {}
  const inspections = d.inspections || d || []
  const summary = d.summary || {}

  const completedCount = summary.completed ?? inspections.filter((i: any) => i.status?.toLowerCase() === 'completed').length
  const scheduledCount = summary.scheduled ?? inspections.filter((i: any) => i.status?.toLowerCase() === 'scheduled').length
  const avgScore = summary.averageScore ?? (
    inspections.length > 0
      ? Math.round(inspections.reduce((s: number, i: any) => s + (i.score ?? 0), 0) / inspections.length)
      : 0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Classroom Inspections</h1>
          <p className="text-slate-400 text-sm">Track classroom inspection records and scores</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{completedCount}</p>
              <p className="text-xs text-slate-400">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{scheduledCount}</p>
              <p className="text-xs text-slate-400">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-900/30 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{avgScore}%</p>
              <p className="text-xs text-slate-400">Avg Score</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{inspections.length}</p>
              <p className="text-xs text-slate-400">Total Inspections</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-purple-400" /> Inspection Records
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 font-medium text-slate-400">Classroom</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Inspector</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Status</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Score</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Notes</th>
              </tr>
            </thead>
            <tbody>
              {inspections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No inspection records found
                  </td>
                </tr>
              ) : (
                inspections.map((insp: any, idx: number) => (
                  <tr key={insp.id || idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 font-medium text-white">
                      {insp.classroom || insp.room || insp.className || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {insp.date ? new Date(insp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {insp.inspector || insp.inspectedBy || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', getStatusBadge(insp.status))}>
                        {insp.status?.replace('_', ' ') || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {insp.score != null ? (
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                          insp.score >= 85 ? 'bg-green-500/15 text-green-400' :
                          insp.score >= 70 ? 'bg-yellow-500/15 text-yellow-400' :
                          'bg-red-500/15 text-red-400'
                        )}>
                          <Star className="w-3 h-3" />
                          {insp.score}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-[250px] truncate">
                      {insp.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

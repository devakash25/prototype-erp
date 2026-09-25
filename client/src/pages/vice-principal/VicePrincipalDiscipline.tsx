import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import {
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function getSeverityBadge(severity: string) {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return 'bg-red-500/15 text-red-400'
    case 'HIGH': return 'bg-orange-500/15 text-orange-400'
    case 'MEDIUM': return 'bg-yellow-500/15 text-yellow-400'
    case 'LOW': return 'bg-green-500/15 text-green-400'
    default: return 'bg-slate-500/15 text-slate-400'
  }
}

function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case 'OPEN': return 'bg-blue-500/15 text-blue-400'
    case 'IN_PROGRESS': return 'bg-yellow-500/15 text-yellow-400'
    case 'RESOLVED': return 'bg-green-500/15 text-green-400'
    case 'CLOSED': return 'bg-slate-500/15 text-slate-400'
    case 'ESCALATED': return 'bg-red-500/15 text-red-400'
    default: return 'bg-slate-500/15 text-slate-400'
  }
}

export function VicePrincipalDiscipline() {
  const [searchParams] = useSearchParams()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vice-principal-discipline'],
    queryFn: async () => {
      const res = await api.get('/vice-principal/discipline')
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
        <p className="text-lg text-slate-400">Failed to load discipline records</p>
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
  const records = d.records || d.discipline || d || []
  const summary = d.summary || {}

  const openCount = summary.open ?? records.filter((r: any) => r.status?.toUpperCase() === 'OPEN').length
  const resolvedCount = summary.resolved ?? records.filter((r: any) => r.status?.toUpperCase() === 'RESOLVED').length
  const escalatedCount = summary.escalated ?? records.filter((r: any) => r.status?.toUpperCase() === 'ESCALATED').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Discipline Records</h1>
          <p className="text-slate-400 text-sm">Student behavior tracking and incident management</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{openCount}</p>
              <p className="text-xs text-slate-400">Open</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{resolvedCount}</p>
              <p className="text-xs text-slate-400">Resolved</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{escalatedCount}</p>
              <p className="text-xs text-slate-400">Escalated</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-400" /> All Records
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 font-medium text-slate-400">Student</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Incident Type</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Date</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Severity</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Action Taken</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No discipline records found
                  </td>
                </tr>
              ) : (
                records.map((record: any, idx: number) => (
                  <tr key={record.id || idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 font-medium text-white">
                      {record.studentName || record.student?.user?.fullName || record.student?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{record.incidentType || record.type || '—'}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {record.date ? new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getSeverityBadge(record.severity))}>
                        {record.severity || 'LOW'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusBadge(record.status))}>
                        {record.status?.replace('_', ' ') || 'OPEN'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-[200px] truncate">
                      {record.actionTaken || record.action || '—'}
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

export default VicePrincipalDiscipline

import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import {
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function getStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case 'submitted': return 'bg-blue-500/15 text-blue-400'
    case 'reviewed': return 'bg-purple-500/15 text-purple-400'
    case 'approved': return 'bg-green-500/15 text-green-400'
    case 'flagged': return 'bg-red-500/15 text-red-400'
    case 'pending': return 'bg-yellow-500/15 text-yellow-400'
    default: return 'bg-slate-500/15 text-slate-400'
  }
}

function getStatusLabel(status: string) {
  switch (status?.toLowerCase()) {
    case 'submitted': return 'Submitted'
    case 'reviewed': return 'Reviewed'
    case 'approved': return 'Approved'
    case 'flagged': return 'Flagged'
    case 'pending': return 'Pending'
    default: return status || 'Unknown'
  }
}

export function VicePrincipalDailyReports() {
  const [searchParams] = useSearchParams()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vice-principal-daily-reports'],
    queryFn: async () => {
      const res = await api.get('/vice-principal/daily-reports')
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
        <p className="text-lg text-slate-400">Failed to load daily reports</p>
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
  const reports = d.reports || d || []
  const summary = d.summary || {}

  const submittedCount = summary.submitted ?? reports.filter((r: any) => r.status?.toLowerCase() === 'submitted').length
  const reviewedCount = summary.reviewed ?? reports.filter((r: any) => r.status?.toLowerCase() === 'reviewed' || r.status?.toLowerCase() === 'approved').length
  const flaggedCount = summary.flagged ?? reports.filter((r: any) => r.status?.toLowerCase() === 'flagged').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Reports</h1>
          <p className="text-slate-400 text-sm">View and manage daily class teacher reports</p>
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
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{submittedCount}</p>
              <p className="text-xs text-slate-400">Submitted</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{reviewedCount}</p>
              <p className="text-xs text-slate-400">Reviewed</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{flaggedCount}</p>
              <p className="text-xs text-slate-400">Flagged</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No daily reports found</p>
          </div>
        ) : (
          reports.map((report: any, idx: number) => (
            <div key={report.id || idx} className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="p-2.5 rounded-lg bg-slate-700/50 shrink-0">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-white">
                        Daily Report — {report.date ? new Date(report.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Unknown Date'}
                      </h3>
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getStatusBadge(report.status))}>
                        {getStatusLabel(report.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {report.submittedBy || report.teacher?.user?.fullName || report.teacherName || '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {report.createdAt ? new Date(report.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    {report.summary && (
                      <p className="text-sm text-slate-300 mt-2 line-clamp-2">{report.summary}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default VicePrincipalDailyReports

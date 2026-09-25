import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  Users,
  GraduationCap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeftRight,
  ClipboardList,
  Shield,
  Loader2,
  AlertCircle,
} from 'lucide-react'

export function VicePrincipalDashboard() {
  const [searchParams] = useSearchParams()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vice-principal-dashboard'],
    queryFn: async () => {
      const res = await api.get('/vice-principal/dashboard')
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
        <p className="text-lg text-slate-400">Failed to load dashboard data</p>
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
  const summary = d.summary || d

  const kpis = [
    { label: 'Total Students', value: summary.totalStudents ?? 0, icon: GraduationCap, color: 'text-blue-400 bg-blue-900/30' },
    { label: 'Total Teachers', value: summary.totalTeachers ?? 0, icon: Users, color: 'text-purple-400 bg-purple-900/30' },
    { label: "Today's Attendance %", value: `${summary.todayAttendancePct ?? summary.todayAttendance ?? 0}%`, icon: CheckCircle2, color: 'text-green-400 bg-green-900/30' },
    { label: 'Pending Approvals', value: summary.pendingApprovals ?? 0, icon: ClipboardList, color: 'text-orange-400 bg-orange-900/30' },
    { label: 'Discipline Issues', value: summary.disciplineIssues ?? 0, icon: Shield, color: 'text-red-400 bg-red-900/30' },
    { label: 'Active Substitutions', value: summary.activeSubstitutions ?? 0, icon: ArrowLeftRight, color: 'text-cyan-400 bg-cyan-900/30' },
  ]

  const recentDiscipline = d.recentDiscipline || []
  const pendingApprovals = d.pendingApprovalsList || []
  const activeSubstitutions = d.activeSubstitutionsList || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vice Principal Dashboard</h1>
          <p className="text-slate-400 text-sm">School oversight and administration overview</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((card) => (
          <div key={card.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className={cn('p-3 rounded-lg', card.color)}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
          <div className="p-5 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-400" /> Recent Discipline Issues
            </h2>
          </div>
          <div className="p-5">
            {recentDiscipline.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No recent discipline issues</p>
            ) : (
              <div className="space-y-3">
                {recentDiscipline.slice(0, 5).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 border border-slate-700">
                    <div className="w-2 h-2 rounded-full shrink-0 bg-red-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.studentName || item.student?.name}</p>
                      <p className="text-xs text-slate-400">{item.incidentType || item.type} &bull; {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</p>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      item.severity === 'HIGH' || item.severity === 'CRITICAL' ? 'bg-red-500/15 text-red-400' :
                      item.severity === 'MEDIUM' ? 'bg-yellow-500/15 text-yellow-400' :
                      'bg-green-500/15 text-green-400'
                    )}>
                      {item.severity || 'LOW'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
          <div className="p-5 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-cyan-400" /> Active Substitutions
            </h2>
          </div>
          <div className="p-5">
            {activeSubstitutions.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No active substitutions</p>
            ) : (
              <div className="space-y-3">
                {activeSubstitutions.slice(0, 5).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 border border-slate-700">
                    <div className="p-2 rounded-lg bg-slate-700/50">
                      <ArrowLeftRight className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.absentTeacher} → {item.substituteTeacher}
                      </p>
                      <p className="text-xs text-slate-400">{item.subject} &bull; {item.className} &bull; Period {item.period}</p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {pendingApprovals.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
          <div className="p-5 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-orange-400" /> Pending Approvals
            </h2>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {pendingApprovals.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 border border-slate-700">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Clock className="h-4 w-4 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title || item.type}</p>
                    <p className="text-xs text-slate-400">{item.submittedBy || item.requester} &bull; {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VicePrincipalDashboard

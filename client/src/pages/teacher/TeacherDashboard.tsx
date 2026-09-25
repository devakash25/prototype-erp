import { Link } from 'react-router-dom'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { GreetingBanner } from '@/components/GreetingBanner'
import {
  BookOpen,
  Clock,
  ClipboardList,
  FileCheck,
  MessageSquare,
  Users,
  AlertCircle,
  RefreshCw,
  Eye,
} from 'lucide-react'

function getAssignmentBadge(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-500/20 text-yellow-400'
    case 'review': return 'bg-purple-500/20 text-purple-400'
    case 'graded': return 'bg-green-500/20 text-green-400'
    default: return 'bg-slate-700/50 text-slate-400'
  }
}

function getAssignmentLabel(status: string) {
  switch (status) {
    case 'review': return 'Under Review'
    default: return status
  }
}

export function TeacherDashboard() {
  const { data: kpis, loading: kpisLoading, error: kpisError, refetch: refetchKpis } = useApi('/teacher/kpis')
  const { data: schedule, loading: scheduleLoading, error: scheduleError, refetch: refetchSchedule } = useApi('/teacher/schedule')
  const { data: activity, loading: activityLoading, error: activityError } = useApi('/teacher/activity?limit=10')
  const { data: assignments, error: assignmentsError, refetch: refetchAssignments } = useApi('/teacher/assignments')

  if (kpisError || scheduleError || activityError || assignmentsError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-300">Failed to load dashboard data</p>
        <button
          onClick={() => { refetchKpis(); refetchSchedule(); refetchAssignments() }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const kpiCards = [
    { label: "Today's Classes", value: kpis?.todayClasses ?? 0, icon: Clock, color: 'text-blue-600', border: 'border-blue-500/30', gradient: 'from-blue-500/10 to-blue-500/10' },
    { label: 'Assigned Subjects', value: kpis?.assignedSubjects ?? 0, icon: BookOpen, color: 'text-purple-600', border: 'border-purple-500/30', gradient: 'from-purple-500/10 to-purple-500/10' },
    { label: 'Pending Assignments', value: kpis?.pendingAssignments ?? 0, icon: ClipboardList, color: 'text-orange-600', border: 'border-orange-500/30', gradient: 'from-orange-500/10 to-orange-500/10' },
    { label: 'Pending Evaluations', value: kpis?.pendingEvaluations ?? 0, icon: FileCheck, color: 'text-yellow-600', border: 'border-yellow-500/30', gradient: 'from-yellow-500/10 to-yellow-500/10' },
    { label: 'Student Messages', value: kpis?.studentMessages ?? 0, icon: MessageSquare, color: 'text-green-600', border: 'border-green-500/30', gradient: 'from-green-500/10 to-green-500/10' },
    { label: 'Total Students', value: kpis?.totalStudents ?? 0, icon: Users, color: 'text-indigo-600', border: 'border-indigo-500/30', gradient: 'from-indigo-500/10 to-indigo-500/10' },
  ]

  return (
    <div className="space-y-6">
      <GreetingBanner />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card, idx) => (
          <div
            key={card.label}
            className={cn('bg-gradient-to-br rounded-2xl border p-5 shadow-sm card-hover animate-fade-in-up opacity-0', card.gradient, card.border)}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm font-medium', card.color)}>{card.label}</p>
                {kpisLoading ? (
                  <div className="h-8 w-16 bg-slate-700/50 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-slate-100 mt-1">{card.value}</p>
                )}
              </div>
              <div className={cn('p-3 rounded-xl shadow-sm bg-slate-700/80', card.color)}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm">
          <div className="p-5 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Today's Schedule</h2>
          </div>
          <div className="p-5">
            {scheduleLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-700/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !schedule?.length ? (
              <p className="text-slate-400 text-center py-8">No classes scheduled for today</p>
            ) : (
              <div className="space-y-3">
                {schedule.map((cls: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-700/50 border border-slate-700">
                    <div className="text-center min-w-[60px]">
                      <p className="text-sm font-medium text-white">{cls.time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{cls.subject}</p>
                      <p className="text-sm text-slate-300">{cls.course} • {cls.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm">
          <div className="p-5 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="p-5">
            {activityLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-700/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !activity?.length ? (
              <p className="text-slate-400 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {activity.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm text-white">{item.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignments Overview */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm">
        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Assignments</h2>
          <Link to="/teacher/assignments" className="text-sm text-indigo-500 hover:text-indigo-400 font-semibold hover:underline">
            View all
          </Link>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">{(assignments ?? []).filter((a: any) => a.status === 'pending').length}</p>
              <p className="text-xs text-slate-400">Pending</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{(assignments ?? []).filter((a: any) => a.status === 'review').length}</p>
              <p className="text-xs text-slate-400">To Review</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{(assignments ?? []).filter((a: any) => a.status === 'graded').length}</p>
              <p className="text-xs text-slate-400">Graded</p>
            </div>
          </div>

          <div className="space-y-3">
            {(assignments ?? []).map((a: any) => (
              <div key={a.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-700/50 border border-slate-700">
                <div className="p-2 rounded-lg bg-slate-700/50">
                  {a.status === 'graded' ? (
                    <FileCheck className="h-5 w-5 text-green-400" />
                  ) : a.status === 'review' ? (
                    <Eye className="h-5 w-5 text-purple-400" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{a.title}</p>
                  <p className="text-xs text-slate-300">{a.subject} &bull; Due {new Date(a.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-medium text-slate-300">{a.submissions}/{a.totalStudents}</span>
                  <p className="text-xs text-slate-400">submitted</p>
                </div>
                <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full capitalize', getAssignmentBadge(a.status))}>
                  {getAssignmentLabel(a.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
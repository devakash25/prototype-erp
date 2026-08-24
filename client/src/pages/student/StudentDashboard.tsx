import { Link } from 'react-router-dom'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { GreetingBanner } from '@/components/GreetingBanner'
import {
  Clock,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  FileText,
  Bell,
  BookOpen,
  CalendarDays,
  Upload,
  CreditCard,
  BarChart3,
  RefreshCw,
  AlertCircle,
  FileCheck,
  Eye,
} from 'lucide-react'

const DASHBOARD_ASSIGNMENTS = [
  { id: 1, title: 'Algebra Worksheet', subject: 'Mathematics', teacher: 'Mr. Sharma', dueDate: '2026-08-20', status: 'pending', maxMarks: 20 },
  { id: 2, title: "Ohm's Law Lab Report", subject: 'Physics', teacher: 'Ms. Patel', dueDate: '2026-08-18', status: 'graded', maxMarks: 15, marksObtained: 13 },
  { id: 3, title: 'Climate Change Essay', subject: 'English', teacher: 'Mrs. Gupta', dueDate: '2026-08-22', status: 'review', maxMarks: 25, fileName: 'climate_change_essay.docx' },
  { id: 4, title: 'Periodic Table Quiz', subject: 'Chemistry', teacher: 'Mr. Kumar', dueDate: '2026-08-25', status: 'pending', maxMarks: 10 },
  { id: 5, title: 'Python Assignment', subject: 'Computer Science', teacher: 'Mr. Reddy', dueDate: '2026-08-19', status: 'graded', maxMarks: 30, marksObtained: 27 },
]

function getAssignmentBadge(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-500/15 text-yellow-400'
    case 'review': return 'bg-purple-500/15 text-purple-400'
    case 'graded': return 'bg-green-500/15 text-green-400'
    default: return 'bg-slate-500/15 text-slate-400'
  }
}

function getAssignmentLabel(status: string) {
  switch (status) {
    case 'review': return 'Under Review'
    default: return status
  }
}

export function StudentDashboard() {
  const { data: kpis, loading: kpisLoading, error: kpisError, refetch: refetchKpis } = useApi('/student/kpis')
  const { data: schedule, loading: scheduleLoading, refetch: refetchSchedule } = useApi('/student/schedule')
  const { data: activity, loading: activityLoading } = useApi('/student/activity')

  if (kpisError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-300">Failed to load dashboard data</p>
        <button
          onClick={() => { refetchKpis(); refetchSchedule(); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const kpiCards = [
    { label: "Today's Classes", value: kpis?.todayClasses ?? 0, icon: Clock, color: 'text-blue-600 bg-gradient-to-br from-blue-500/10 to-blue-500/10 border border-blue-500/30' },
    { label: 'Attendance %', value: `${kpis?.attendanceRate ?? 0}%`, icon: CheckCircle2, color: 'text-green-600 bg-gradient-to-br from-green-500/10 to-green-500/10 border border-green-500/30' },
    { label: 'Pending Assignments', value: kpis?.pendingAssignments ?? 0, icon: ClipboardList, color: 'text-orange-600 bg-gradient-to-br from-orange-500/10 to-orange-500/10 border border-orange-500/30' },
    { label: 'Pending Fees', value: kpis?.pendingFees ?? 0, icon: IndianRupee, color: 'text-red-600 bg-gradient-to-br from-red-500/10 to-red-500/10 border border-red-500/30' },
    { label: 'Upcoming Exams', value: kpis?.upcomingExams ?? 0, icon: FileText, color: 'text-purple-600 bg-gradient-to-br from-purple-500/10 to-purple-500/10 border border-purple-500/30' },
    { label: 'New Notices', value: kpis?.newNotices ?? 0, icon: Bell, color: 'text-yellow-600 bg-gradient-to-br from-yellow-500/10 to-yellow-500/10 border border-yellow-500/30' },
    { label: 'Library Issues', value: kpis?.libraryIssues ?? 0, icon: BookOpen, color: 'text-indigo-600 bg-gradient-to-br from-indigo-500/10 to-indigo-500/10 border border-indigo-500/30' },
  ]

  const quickActions = [
    { label: 'View Timetable', icon: CalendarDays, href: '/student/schedule', color: 'bg-slate-700/50 text-blue-400 hover:bg-slate-700/80' },
    { label: 'Submit Assignment', icon: Upload, href: '/student/assignments', color: 'bg-slate-700/50 text-orange-400 hover:bg-slate-700/80' },
    { label: 'Pay Fees', icon: CreditCard, href: '/student/fees', color: 'bg-slate-700/50 text-green-400 hover:bg-slate-700/80' },
    { label: 'View Results', icon: BarChart3, href: '/student/results', color: 'bg-slate-700/50 text-purple-400 hover:bg-slate-700/80' },
  ]

  return (
    <div className="space-y-6">
      <GreetingBanner />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm card-hover animate-fade-in-up opacity-0"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                {kpisLoading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                )}
              </div>
              <div className={cn('p-3 rounded-xl shadow-sm', card.color)}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, idx) => (
            <Link
              key={action.label}
              to={action.href}
              className={cn(
                'flex flex-col items-center gap-2 p-5 rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-md animate-fade-in-up opacity-0',
                action.color
              )}
              style={{ animationDelay: `${300 + idx * 60}ms` }}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm font-semibold">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
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
                      <p className="text-sm text-slate-300">{cls.teacher} &bull; {cls.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
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
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Assignments</h2>
          <Link to="/student/assignments" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
            View all
          </Link>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">{DASHBOARD_ASSIGNMENTS.filter((a) => a.status === 'pending').length}</p>
              <p className="text-xs text-yellow-400">Pending</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{DASHBOARD_ASSIGNMENTS.filter((a) => a.status === 'review').length}</p>
              <p className="text-xs text-purple-400">Under Review</p>
            </div>
            <div className="bg-green-500/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{DASHBOARD_ASSIGNMENTS.filter((a) => a.status === 'graded').length}</p>
              <p className="text-xs text-green-400">Graded</p>
            </div>
          </div>

          <div className="space-y-3">
            {DASHBOARD_ASSIGNMENTS.map((a) => (
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
                  <p className="text-xs text-slate-400">{a.subject} &bull; {a.teacher}</p>
                </div>
                <div className="text-right shrink-0">
                  {a.status === 'graded' && a.marksObtained != null ? (
                    <span className="text-sm font-bold text-green-400">{a.marksObtained}/{a.maxMarks}</span>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Due {new Date(a.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
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

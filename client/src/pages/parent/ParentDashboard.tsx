import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { GreetingBanner } from '@/components/GreetingBanner'
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardList,
  FileText,
  IndianRupee,
  GraduationCap,
  Bell,
  MessageSquare,
  AlertTriangle,
  CreditCard,
  CalendarDays,
  CalendarPlus,
  Plane,
  Phone,
  AlertCircle,
  ChevronRight,
  Loader2,
  Eye,
  FileCheck,
} from 'lucide-react'

function getAssignmentBadge(status: string) {
  switch (status?.toLowerCase()) {
    case 'pending': return 'bg-yellow-500/15 text-yellow-400'
    case 'review': case 'submitted': return 'bg-purple-500/15 text-purple-400'
    case 'graded': return 'bg-green-500/15 text-green-400'
    default: return 'bg-slate-500/15 text-slate-400'
  }
}

function getAssignmentLabel(status: string) {
  switch (status?.toLowerCase()) {
    case 'review': return 'Under Review'
    case 'submitted': return 'Submitted'
    case 'pending': return 'Pending'
    case 'graded': return 'Graded'
    default: return status
  }
}

export function ParentDashboard() {
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const childId = searchParams.get('childId') || ''

  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: async () => {
      const res = await api.get('/parent/children')
      return res.data?.data ?? res.data
    },
  })

  const children = childrenData?.children || childrenData || []

  useEffect(() => {
    if (!childId && children.length > 0) {
      setSearchParams({ childId: children[0].id })
    }
  }, [childId, children, setSearchParams])

  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-dashboard', childId],
    queryFn: async () => {
      const res = await api.get(`/parent/dashboard?childId=${childId}`)
      return res.data?.data ?? res.data
    },
    enabled: !!childId,
  })

  const { data: assignmentsData } = useQuery({
    queryKey: ['parent-assignments', childId],
    queryFn: async () => {
      const res = await api.get(`/parent/assignments?childId=${childId}`)
      return res.data?.data ?? res.data
    },
    enabled: !!childId,
  })

  const d = dashboardData || {}
  const summary = d.summary || {}
  const assignments = assignmentsData?.assignments || assignmentsData || []

  const todayAttendance = summary.todayAttendance
  const todayPresent = todayAttendance?.present ?? 0
  const todayTotal = todayAttendance?.total ?? 0
  const todayLabel = todayTotal > 0 ? `${todayPresent}/${todayTotal}` : '—'

  const kpis = [
    { label: "Today's Attendance", value: todayLabel, icon: CheckCircle2, color: 'text-green-400 bg-green-900/30' },
    { label: 'Overall Attendance', value: `${summary.overallAttendance ?? 0}%`, icon: Clock, color: 'text-blue-400 bg-blue-900/30' },
    { label: 'Pending Assignments', value: summary.pendingAssignments ?? 0, icon: ClipboardList, color: 'text-orange-400 bg-orange-900/30' },
    { label: 'Upcoming Exams', value: summary.upcomingExams ?? 0, icon: FileText, color: 'text-purple-400 bg-purple-900/30' },
    { label: 'Fee Due', value: `₹${(summary.feeDue ?? 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-red-400 bg-red-900/30' },
    { label: 'CGPA', value: summary.cgpa ?? '—', icon: GraduationCap, color: 'text-yellow-400 bg-yellow-900/30' },
    { label: 'New Notices', value: summary.newNotices ?? 0, icon: Bell, color: 'text-cyan-400 bg-cyan-900/30' },
    { label: 'Teacher Messages', value: summary.teacherMessages ?? 0, icon: MessageSquare, color: 'text-pink-400 bg-pink-900/30' },
  ]

  const quickActions = [
    { label: 'Pay Fees', icon: CreditCard, href: `/parent/fees?childId=${childId}`, color: 'bg-green-600 hover:bg-green-700 text-white' },
    { label: 'View Attendance', icon: CalendarDays, href: `/parent/attendance?childId=${childId}`, color: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { label: 'Request PTM', icon: CalendarPlus, href: `/parent/ptm?childId=${childId}`, color: 'bg-purple-600 hover:bg-purple-700 text-white' },
    { label: 'Apply Leave', icon: Plane, href: `/parent/leave?childId=${childId}`, color: 'bg-amber-600 hover:bg-amber-700 text-white' },
    { label: 'Contact Teacher', icon: Phone, href: `/parent/messages?childId=${childId}`, color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
    { label: 'Raise Complaint', icon: AlertCircle, href: `/parent/complaints?childId=${childId}`, color: 'bg-red-600 hover:bg-red-700 text-white' },
  ]

  if (childrenLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!childId && children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg">No children linked to your account</p>
      </div>
    )
  }

  if (error && childId) {
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

  const schedule = d.todaySchedule || []
  const notices = d.recentNotices || []
  const alerts = d.alerts || []

  return (
    <div className="space-y-6">
      <GreetingBanner />

      <div className="flex items-center justify-end gap-3">
        <select
          value={childId}
          onChange={(e) => setSearchParams({ childId: e.target.value })}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {children.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.fullName || c.name} — {c.class?.name || ''}
            </option>
          ))}
        </select>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700/50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((card) => (
          <div key={card.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{card.label}</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" /> Smart Alerts
          </h2>
          <div className="space-y-2">
            {alerts.map((alert: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg border bg-yellow-500/10 border-yellow-500/30"
              >
                <div className="w-2 h-2 rounded-full shrink-0 bg-yellow-500" />
                <span className="text-sm text-yellow-300">{alert}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
          <div className="p-5 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Today's Schedule</h2>
          </div>
          <div className="p-5">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-700/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : schedule.length === 0 ? (
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
                      <p className="text-sm text-slate-400">{cls.teacher} &bull; {cls.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
          <div className="p-5 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Recent Notices</h2>
          </div>
          <div className="p-5">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-700/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : notices.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No new notices</p>
            ) : (
              <div className="space-y-3">
                {notices.map((notice: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/50 border border-slate-700">
                    <Bell className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{notice.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {notice.date ? new Date(notice.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Assignments</h2>
          <Link
            to={`/parent/assignments?childId=${childId}`}
            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
          >
            View all
          </Link>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">{assignments.filter((a: any) => a.status === 'pending' || a.status === 'PENDING').length}</p>
              <p className="text-xs text-yellow-400">Pending</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{assignments.filter((a: any) => a.status === 'review' || a.status === 'SUBMITTED').length}</p>
              <p className="text-xs text-purple-400">Under Review</p>
            </div>
            <div className="bg-green-500/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{assignments.filter((a: any) => a.status === 'graded' || a.status === 'GRADED').length}</p>
              <p className="text-xs text-green-400">Graded</p>
            </div>
          </div>

          {assignments.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No assignments found</p>
          ) : (
            <div className="space-y-3">
              {assignments.slice(0, 5).map((a: any) => (
                <div key={a.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-700/50 border border-slate-700">
                  <div className="p-2 rounded-lg bg-slate-700/50">
                    {(a.status === 'graded' || a.status === 'GRADED') ? (
                      <FileCheck className="h-5 w-5 text-green-400" />
                    ) : (a.status === 'review' || a.status === 'SUBMITTED') ? (
                      <Eye className="h-5 w-5 text-purple-400" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{a.title}</p>
                    <p className="text-xs text-slate-400">{a.subject?.name || a.subject} &bull; {a.teacher?.user?.fullName || a.teacher}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {(a.status === 'graded' || a.status === 'GRADED') && a.marksObtained != null ? (
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
          )}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${action.color}`}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

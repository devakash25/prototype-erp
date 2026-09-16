import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '@/hooks/useApi'
import { cn, formatCurrency } from '@/lib/utils'
import { GreetingBanner } from '@/components/GreetingBanner'
import {
  Clock, CheckCircle2, ClipboardList, IndianRupee, FileText, Bell,
  BookOpen, CalendarDays, Upload, CreditCard, BarChart3, RefreshCw,
  AlertCircle, FileCheck, Eye,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export function StudentDashboard() {
  const { data: kpis, loading: kpisLoading, error: kpisError, refetch: refetchKpis } = useApi('/student/kpis')
  const { data: schedule, loading: scheduleLoading, refetch: refetchSchedule } = useApi('/student/schedule')
  const { data: activity, loading: activityLoading } = useApi('/student/activity')
  const { data: assignments, loading: assignmentsLoading, refetch: refetchAssignments } = useApi<any[]>('/student/assignments')
  const { data: fees } = useApi<any>('/student/fees')

  if (kpisError) {
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
    { label: "Today's Classes", value: kpis?.todayClasses ?? 0, icon: Clock, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { label: 'Attendance %', value: `${kpis?.attendanceRate ?? 0}%`, icon: CheckCircle2, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
    { label: 'Pending Assignments', value: kpis?.pendingAssignments ?? 0, icon: ClipboardList, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { label: 'Pending Fees', value: kpis?.pendingFees ?? 0, icon: IndianRupee, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    { label: 'Upcoming Exams', value: kpis?.upcomingExams ?? 0, icon: FileText, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { label: 'New Notices', value: kpis?.newNotices ?? 0, icon: Bell, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Library Issues', value: kpis?.libraryIssues ?? 0, icon: BookOpen, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  ]

  const quickActions = [
    { label: 'View Timetable', icon: CalendarDays, href: '/student/schedule', color: 'bg-slate-700/50 text-blue-400 hover:bg-slate-700/80' },
    { label: 'Submit Assignment', icon: Upload, href: '/student/assignments', color: 'bg-slate-700/50 text-orange-400 hover:bg-slate-700/80' },
    { label: 'Pay Fees', icon: CreditCard, href: '/student/fees', color: 'bg-slate-700/50 text-green-400 hover:bg-slate-700/80' },
    { label: 'View Results', icon: BarChart3, href: '/student/results', color: 'bg-slate-700/50 text-purple-400 hover:bg-slate-700/80' },
  ]

  const assignmentList = assignments || []
  const pendingCount = assignmentList.filter((a: any) => a.status?.toLowerCase() === 'pending').length
  const reviewCount = assignmentList.filter((a: any) => a.status?.toLowerCase() === 'submitted' || a.status?.toLowerCase() === 'review').length
  const gradedCount = assignmentList.filter((a: any) => a.status?.toLowerCase() === 'graded').length

  const assignmentPieData = [
    { name: 'Pending', value: pendingCount },
    { name: 'Under Review', value: reviewCount },
    { name: 'Graded', value: gradedCount },
  ].filter(d => d.value > 0)

  const feeData = fees ? [
    { name: 'Paid', value: fees.totalPaid || 0 },
    { name: 'Due', value: fees.totalDue || 0 },
  ].filter(d => d.value > 0) : []

  return (
    <div className="space-y-6">
      <GreetingBanner />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {kpiCards.map((card, idx) => (
          <div
            key={card.label}
            className={cn('rounded-xl border p-4 transition-all', card.color)}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <card.icon className="h-5 w-5 opacity-70" />
            </div>
            {kpisLoading ? (
              <div className="h-7 w-12 bg-slate-700 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            )}
            <p className="text-xs text-slate-600 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className={cn(
                'flex flex-col items-center gap-2 p-5 rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-md',
                action.color
              )}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm font-semibold">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Status Pie Chart */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Assignment Status</h2>
          {assignmentPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={assignmentPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  <Cell fill="#f59e0b" />
                  <Cell fill="#8b5cf6" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">No assignments yet</div>
          )}
        </div>

        {/* Fee Breakdown */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Fee Overview</h2>
          {feeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={feeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">No fee data</div>
          )}
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
                      <p className="text-sm font-medium text-white">{cls.startTime}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{cls.subject?.name || cls.subject}</p>
                      <p className="text-sm text-slate-400">{cls.employee?.user?.fullName || cls.teacher} &bull; {cls.room || cls.course?.name || ''}</p>
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
                      <p className="text-sm text-white">{item.message || item.action}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.time || item.createdAt}</p>
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
          <h2 className="text-lg font-semibold text-white">Recent Assignments</h2>
          <Link to="/student/assignments" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
            View all
          </Link>
        </div>
        <div className="p-5">
          {assignmentsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-700/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !assignmentList.length ? (
            <p className="text-slate-400 text-center py-8">No assignments</p>
          ) : (
            <div className="space-y-3">
              {assignmentList.slice(0, 5).map((a: any) => {
                const status = a.status?.toLowerCase() === 'submitted' ? 'review' : a.status?.toLowerCase() || 'pending'
                return (
                  <div key={a.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-700/50 border border-slate-700">
                    <div className="p-2 rounded-lg bg-slate-700/50">
                      {status === 'graded' ? (
                        <FileCheck className="h-5 w-5 text-green-400" />
                      ) : status === 'review' ? (
                        <Eye className="h-5 w-5 text-purple-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{a.title}</p>
                      <p className="text-xs text-slate-400">{a.subject}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {status === 'graded' && a.marksObtained != null ? (
                        <span className="text-sm font-bold text-green-400">{a.marksObtained}/{a.maxMarks}</span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Due {new Date(a.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                      status === 'graded' ? 'bg-green-500/15 text-green-400' :
                      status === 'review' ? 'bg-purple-500/15 text-purple-400' :
                      'bg-yellow-500/15 text-yellow-400'
                    )}>
                      {status === 'review' ? 'Under Review' : status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

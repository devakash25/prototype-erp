import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { GreetingBanner } from '@/components/GreetingBanner'
import {
  Users, GraduationCap, Calendar, Clock, TrendingUp,
  AlertTriangle, RefreshCw, CheckCircle, Star, FileText, Zap,
} from 'lucide-react'

export function HodDashboard() {
  const { data: kpis, loading: kpisLoading, refetch: refetchKpis } = useApi<any>('/hod/kpis')
  const { data: facultyList, loading: facultyLoading } = useApi<any[]>('/hod/faculty')
  const { data: timetableData, loading: timetableLoading } = useApi<any>('/hod/timetable')
  const { data: activity, loading: activityLoading } = useApi<any[]>('/hod/activity?limit=10')

  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchKpis()])
    setRefreshing(false)
  }

  const loading = kpisLoading || facultyLoading || timetableLoading || activityLoading

  if (loading && !kpis) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  const kpiCards = [
    { label: 'Department Students', value: kpis?.totalStudents || 0, icon: Users, color: 'blue' },
    { label: 'Faculty Members', value: kpis?.totalFaculty || 0, icon: GraduationCap, color: 'green' },
    { label: "Today's Classes", value: kpis?.todayClasses || 0, icon: Calendar, color: 'purple' },
    { label: 'Faculty Attendance', value: `${kpis?.facultyAttendanceRate || 0}%`, icon: CheckCircle, color: 'emerald' },
    { label: 'Student Attendance', value: `${kpis?.studentAttendanceRate || 0}%`, icon: TrendingUp, color: 'teal' },
    { label: 'Pending Evaluations', value: kpis?.pendingEvaluations || 0, icon: FileText, color: 'orange' },
    { label: 'Dept Performance', value: `${kpis?.departmentScore || 0}%`, icon: Star, color: 'amber' },
  ]

  const colorMap: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-50 border-blue-100', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50 border-green-100', icon: 'text-green-600' },
    purple: { bg: 'bg-purple-50 border-purple-100', icon: 'text-purple-600' },
    emerald: { bg: 'bg-emerald-50 border-emerald-100', icon: 'text-emerald-600' },
    teal: { bg: 'bg-teal-50 border-teal-100', icon: 'text-teal-600' },
    orange: { bg: 'bg-orange-50 border-orange-100', icon: 'text-orange-600' },
    amber: { bg: 'bg-amber-50 border-amber-100', icon: 'text-amber-600' },
  }

  const faculty = facultyList || []
  const topPerformers = [...faculty].sort((a: any, b: any) => (b.performanceScore || 0) - (a.performanceScore || 0)).slice(0, 3)
  const needsAttention = [...faculty].sort((a: any, b: any) => (a.performanceScore || 0) - (b.performanceScore || 0)).slice(0, 3)
  const timetableEntries = timetableData?.entries || []

  return (
    <div className="space-y-6">
      <GreetingBanner />
      <div className="flex items-center justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const colors = colorMap[card.color] || colorMap.blue
          return (
            <div key={card.label} className={cn('rounded-xl border p-5', colors.bg)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={cn('w-10 h-10 rounded-lg bg-white flex items-center justify-center', colors.icon)}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Faculty Status & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty Status */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Faculty Status</h2>
          </div>
          <div className="space-y-4">
            {topPerformers.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-400 uppercase tracking-wide mb-2">Top Performers</p>
                <div className="space-y-2">
                  {topPerformers.map((f: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-medium text-green-400">
                        {f.name?.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{f.name}</p>
                        <p className="text-xs text-slate-400">{f.designation}</p>
                      </div>
                      <span className="text-sm font-medium text-green-400">{f.performanceScore || 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {needsAttention.length > 0 && (
              <div>
                <p className="text-xs font-medium text-yellow-400 uppercase tracking-wide mb-2">Needs Attention</p>
                <div className="space-y-2">
                  {needsAttention.map((f: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs font-medium text-yellow-400">
                        {f.name?.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{f.name}</p>
                        <p className="text-xs text-slate-400">{f.designation}</p>
                      </div>
                      <span className="text-sm font-medium text-yellow-400">{f.performanceScore || 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {faculty.length === 0 && <p className="text-sm text-slate-400">No faculty data</p>}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Today's Schedule</h2>
            <span className="text-sm text-slate-400">{timetableEntries.length} classes</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {timetableEntries.length === 0 && (
              <p className="text-sm text-slate-400">No classes scheduled today</p>
            )}
            {timetableEntries.slice(0, 8).map((entry: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700">
                <div className="w-16 text-center shrink-0">
                  <p className="text-xs font-medium text-slate-300">{new Date(entry.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="w-px h-8 bg-indigo-500/50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{entry.subject?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-400">{entry.employee?.user?.fullName} &middot; {entry.room || 'TBD'}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{entry.course?.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Analytics Quick View & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Student Analytics</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Total Students</span>
              <span className="font-medium text-white">{kpis?.totalStudents || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Attendance Rate</span>
              <span className="font-medium text-white">{kpis?.studentAttendanceRate || 0}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Dept Performance</span>
              <span className="font-medium text-white">{kpis?.departmentScore || 0}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Pending Evaluations</span>
              <span className="font-medium text-orange-400">{kpis?.pendingEvaluations || 0}</span>
            </div>
            {(kpis?.studentAttendanceRate || 0) >= 75 && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-400 font-medium">Attendance target on track</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Pending Actions</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm font-medium text-white">Today's Classes</span>
              </div>
              <span className="text-lg font-bold text-orange-400">{kpis?.todayClasses || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm font-medium text-white">Evaluations Pending</span>
              </div>
              <span className="text-lg font-bold text-blue-400">{kpis?.pendingEvaluations || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smart Alerts */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Smart Alerts
          </h2>
          <div className="space-y-3">
            {(kpis?.facultyAttendanceRate || 0) < 80 && (kpis?.facultyAttendanceRate || 0) > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-300">Low Faculty Attendance</p>
                  <p className="text-xs text-red-400">Faculty attendance is below 80% today</p>
                </div>
              </div>
            )}
            {(kpis?.pendingEvaluations || 0) > 10 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-300">Pending Evaluations</p>
                  <p className="text-xs text-orange-400">{kpis.pendingEvaluations} evaluations need to be graded</p>
                </div>
              </div>
            )}
            {(kpis?.studentAttendanceRate || 0) < 75 && (kpis?.studentAttendanceRate || 0) > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-300">Low Student Attendance</p>
                  <p className="text-xs text-yellow-400">Student attendance is below 75% target</p>
                </div>
              </div>
            )}
            {((kpis?.facultyAttendanceRate || 0) >= 80 && (kpis?.pendingEvaluations || 0) <= 10 && (kpis?.studentAttendanceRate || 0) >= 75) && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-300">All Clear</p>
                  <p className="text-xs text-green-400">No alerts for your department</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {(!activity || activity.length === 0) && (
              <p className="text-sm text-slate-400">No recent activity</p>
            )}
            {activity?.map((item: any) => (
              <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-700/50">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-300 truncate">{item.action}</p>
                  <p className="text-xs text-slate-400">
                    {item.user?.fullName} &middot; {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

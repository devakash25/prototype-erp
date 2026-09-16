import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, GraduationCap, DollarSign, TrendingUp, Clock, CheckCircle,
  AlertTriangle, RefreshCw, Target, BookOpen, School, Building2,
  ClipboardList, UserCheck, Award, BookOpenCheck, Home, Bus, Library,
  HelpCircle, Bell, Calendar,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { cn, formatCurrency, formatNumber } from '@/lib/utils'
import { StatCard } from '@/components/StatCard'
import { GreetingBanner } from '@/components/GreetingBanner'
import api from '@/services/api'

export function PrincipalDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [campus, setCampus] = useState<any>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [faculty, setFaculty] = useState<any>(null)
  const [attendanceTrend, setAttendanceTrend] = useState<any[]>([])
  const [exams, setExams] = useState<any>(null)
  const [admissions, setAdmissions] = useState<any>(null)
  const [finance, setFinance] = useState<any>(null)
  const [discipline, setDiscipline] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)
  const [lms, setLms] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    setLoading(true)
    setError(false)
    try {
      const results = await Promise.allSettled([
        api.get('/principal/kpis'),
        api.get('/principal/campus-status'),
        api.get('/principal/departments'),
        api.get('/principal/faculty'),
        api.get('/principal/attendance-trend?days=7'),
        api.get('/principal/examinations'),
        api.get('/principal/admissions'),
        api.get('/principal/finance'),
        api.get('/principal/discipline'),
        api.get('/principal/workflow'),
        api.get('/principal/lms'),
        api.get('/principal/activity?limit=10'),
      ])
      const get = (i: number) => results[i].status === 'fulfilled' ? (results[i] as PromiseFulfilledResult<any>).value.data.data : null
      setKpis(get(0)); setCampus(get(1)); setDepartments(get(2) || [])
      setFaculty(get(3)); setAttendanceTrend(get(4) || [])
      setExams(get(5)); setAdmissions(get(6)); setFinance(get(7))
      setDiscipline(get(8)); setWorkflow(get(9)); setLms(get(10))
      setActivity(get(11) || [])
    } catch (err) {
      console.error(err)
      setError(true)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-400">Failed to load dashboard</p>
        <button onClick={loadDashboard} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const chartData = attendanceTrend.map((d: any) => ({ name: d.day, attendance: d.rate }))

  return (
    <div className="space-y-6">
      <GreetingBanner />
      <div className="flex items-center justify-end">
        <button onClick={loadDashboard} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard title="Attendance" value={`${kpis?.studentAttendanceRate || 0}%`} icon={CheckCircle} color="emerald" />
        <StatCard title="Teachers Present" value={`${kpis?.teachersPresent || 0}/${kpis?.teachersTotal || 0}`} icon={Users} color="blue" />
        <StatCard title="Students" value={formatNumber(kpis?.studentsPresent || 0)} icon={GraduationCap} color="purple" />
        <StatCard title="Today's Classes" value={kpis?.todayClasses || 0} icon={Clock} color="indigo" />
        <StatCard title="Pending Admissions" value={kpis?.pendingAdmissions || 0} icon={School} color="amber" />
        <StatCard title="Pending Approvals" value={kpis?.pendingWorkflows || 0} icon={ClipboardList} color="orange" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Leave Requests" value={kpis?.pendingLeaves || 0} icon={ClipboardList} color="yellow" />
        <StatCard title="Open Complaints" value={kpis?.openComplaints || 0} icon={HelpCircle} color="red" />
        <StatCard title="Upcoming Exams" value={kpis?.upcomingExams || 0} icon={Award} color="teal" />
        <StatCard title="Teacher Absent" value={campus?.absentTeachers || 0} icon={AlertTriangle} color="red" />
      </div>

      {/* Live Campus Status */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Live Campus Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Classes Running', value: campus?.classesRunning || 0, icon: BookOpen, color: 'text-blue-400 bg-blue-500/15' },
            { label: 'Teachers Teaching', value: campus?.teachersTeaching || 0, icon: Users, color: 'text-green-400 bg-green-500/15' },
            { label: 'Free Rooms', value: campus?.freeRooms || 0, icon: Home, color: 'text-slate-400 bg-slate-500/15' },
            { label: 'Teacher Absent', value: campus?.absentTeachers || 0, icon: AlertTriangle, color: 'text-red-400 bg-red-500/15' },
            { label: 'Active Complaints', value: campus?.activeComplaints || 0, icon: HelpCircle, color: 'text-orange-400 bg-orange-500/15' },
          ].map((item, i) => (
            <div key={i} className="text-center p-3 rounded-lg bg-slate-700/50 border border-slate-700">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2', item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="text-xs text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Trend Chart */}
      {chartData.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Attendance Trend (7 Days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
              <Bar dataKey="attendance" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {chartData.map((_: any, i: number) => (
                  <Cell key={i} fill={chartData[i].attendance >= 75 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Department Overview & Faculty */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Departments</h2>
            <Link to="/principal/departments" className="text-sm text-indigo-400 hover:text-indigo-300">View All</Link>
          </div>
          <div className="space-y-3">
            {departments.slice(0, 5).map((dept: any) => (
              <div key={dept.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-700">
                <div>
                  <p className="text-sm font-medium text-white">{dept.name}</p>
                  <p className="text-xs text-slate-400">{dept.students} students &middot; {dept.faculty} faculty</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', dept.attendanceRate >= 75 ? 'bg-green-500' : 'bg-red-500')} style={{ width: `${dept.attendanceRate}%` }} />
                  </div>
                  <span className={cn('text-xs font-medium', dept.attendanceRate >= 75 ? 'text-green-400' : 'text-red-400')}>{dept.attendanceRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Faculty Status</h2>
            <Link to="/principal/faculty" className="text-sm text-indigo-400 hover:text-indigo-300">Details</Link>
          </div>
          {faculty && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xl font-bold text-green-400">{faculty.present}</p>
                  <p className="text-xs text-green-400">Present</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xl font-bold text-red-400">{faculty.absent}</p>
                  <p className="text-xs text-red-400">Absent</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xl font-bold text-yellow-400">{faculty.onLeave}</p>
                  <p className="text-xs text-yellow-400">On Leave</p>
                </div>
              </div>
              {faculty.faculty?.slice(0, 4).map((f: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-medium text-indigo-400">
                      {f.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{f.name}</p>
                      <p className="text-xs text-slate-400">{f.classesToday} classes today</p>
                    </div>
                  </div>
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full',
                    f.todayStatus === 'PRESENT' ? 'bg-green-500/15 text-green-400' :
                    f.todayStatus === 'ABSENT' ? 'bg-red-500/15 text-red-400' : 'bg-yellow-500/15 text-yellow-400')}>
                    {f.todayStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exams, Admissions, Finance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Examinations</h2>
            <Link to="/principal/examinations" className="text-sm text-indigo-400 hover:text-indigo-300">Details</Link>
          </div>
          {exams && (
            <div className="space-y-3">
              {[
                { label: 'Active', value: exams.active, color: 'text-blue-400' },
                { label: 'Upcoming', value: exams.upcoming, color: 'text-purple-400' },
                { label: 'Pass Rate', value: `${exams.passRate}%`, color: 'text-green-400' },
                { label: 'Pending Results', value: exams.pendingResults, color: 'text-orange-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50">
                  <span className="text-sm text-slate-400">{item.label}</span>
                  <span className={cn('text-sm font-semibold', item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Admissions</h2>
            <Link to="/principal/admissions" className="text-sm text-indigo-400 hover:text-indigo-300">Details</Link>
          </div>
          {admissions && (
            <div className="space-y-3">
              {[
                { label: 'Applied', value: admissions.applied, color: 'text-blue-400' },
                { label: 'Under Review', value: admissions.underReview, color: 'text-yellow-400' },
                { label: 'Enrolled', value: admissions.enrolled, color: 'text-green-400' },
                { label: 'Total', value: admissions.total, color: 'text-white' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50">
                  <span className="text-sm text-slate-400">{item.label}</span>
                  <span className={cn('text-sm font-semibold', item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Finance</h2>
            <Link to="/principal/finance" className="text-sm text-indigo-400 hover:text-indigo-300">Details</Link>
          </div>
          {finance && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-xs text-green-400 mb-1">Month Collection</p>
                <p className="text-lg font-bold text-green-400">{formatCurrency(finance.monthRevenue)}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400 mb-1">Outstanding</p>
                <p className="text-lg font-bold text-red-400">{formatCurrency(finance.outstandingDues)}</p>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50">
                <span className="text-sm text-slate-400">Collection Rate</span>
                <span className="text-sm font-semibold text-white">{finance.feeCollectionRate}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LMS, Discipline, Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">LMS Overview</h2>
          {lms && (
            <div className="space-y-3">
              {[
                { label: 'Assignments', value: lms.assignments, color: 'text-blue-400' },
                { label: 'Submissions', value: lms.submissions, color: 'text-green-400' },
                { label: 'Study Materials', value: lms.materials, color: 'text-purple-400' },
                { label: 'Pending Evaluation', value: lms.pendingEvaluation, color: 'text-orange-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50">
                  <span className="text-sm text-slate-400">{item.label}</span>
                  <span className={cn('text-sm font-semibold', item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Discipline</h2>
          {discipline && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400 mb-1">Open Complaints</p>
                <p className="text-lg font-bold text-red-400">{discipline.openComplaints}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-xs text-green-400 mb-1">Resolved (Month)</p>
                <p className="text-lg font-bold text-green-400">{discipline.resolvedThisMonth}</p>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50">
                <span className="text-sm text-slate-400">Escalations</span>
                <span className="text-sm font-semibold text-orange-400">{discipline.escalations}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Approvals</h2>
            <Link to="/principal/approvals" className="text-sm text-indigo-400 hover:text-indigo-300">View All</Link>
          </div>
          {workflow && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-xs text-orange-400 mb-1">Pending</p>
                <p className="text-lg font-bold text-orange-400">{workflow.pending}</p>
              </div>
              {(workflow.byType || []).slice(0, 3).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50">
                  <span className="text-xs text-slate-400">{item.type?.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-medium text-orange-400">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {activity.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>}
          {activity.map((item: any) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/50 border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{item.action}</p>
                <p className="text-xs text-slate-400">{item.user?.fullName} &middot; {new Date(item.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

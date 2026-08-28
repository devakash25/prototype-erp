import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, GraduationCap, DollarSign, TrendingUp, Clock, CheckCircle,
  AlertTriangle, RefreshCw, Target, BookOpen, School, Building2,
  ClipboardList, UserCheck, Award, BookOpenCheck, Home, Bus, Library,
  HelpCircle, Bell, Calendar,
} from 'lucide-react'
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

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    setLoading(true)
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
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  }

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
            { label: 'Classes Running', value: campus?.classesRunning || 0, icon: BookOpen, color: 'blue' },
            { label: 'Teachers Teaching', value: campus?.teachersTeaching || 0, icon: Users, color: 'green' },
            { label: 'Free Rooms', value: campus?.freeRooms || 0, icon: Home, color: 'gray' },
            { label: 'Teacher Absent', value: campus?.absentTeachers || 0, icon: AlertTriangle, color: 'red' },
            { label: 'Active Complaints', value: campus?.activeComplaints || 0, icon: HelpCircle, color: 'orange' },
          ].map((item, i) => (
            <div key={i} className="text-center p-3 rounded-lg bg-slate-700/50 border border-slate-700">
              <item.icon className={`w-6 h-6 mx-auto mb-1 text-${item.color}-500`} />
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="text-xs text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Trend */}
      {attendanceTrend.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Attendance Trend (7 Days)</h2>
          <div className="flex items-end gap-3 h-40">
            {attendanceTrend.map((day: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-slate-300">{day.rate}%</span>
                <div className="w-full bg-slate-600 rounded-t-lg relative" style={{ height: '100px' }}>
                  <div className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-blue-400"
                    style={{ height: `${day.rate}%` }} />
                </div>
                <span className="text-xs text-slate-400">{day.day}</span>
              </div>
            ))}
          </div>
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
              <div key={dept.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50">
                <div>
                  <p className="text-sm font-medium text-white">{dept.name}</p>
                  <p className="text-xs text-slate-400">{dept.students} students &middot; {dept.faculty} faculty</p>
                </div>
                <span className={cn('text-sm font-medium px-2 py-0.5 rounded-full',
                  dept.attendanceRate >= 75 ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400')}>
                  {dept.attendanceRate}%
                </span>
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
                <div className="text-center p-2 rounded-lg bg-green-500/15 border border-green-500/30">
                  <p className="text-xl font-bold text-green-400">{faculty.present}</p>
                  <p className="text-xs text-green-400">Present</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-red-500/15 border border-red-500/30">
                  <p className="text-xl font-bold text-red-400">{faculty.absent}</p>
                  <p className="text-xs text-red-400">Absent</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-yellow-500/15 border border-yellow-500/30">
                  <p className="text-xl font-bold text-yellow-400">{faculty.onLeave}</p>
                  <p className="text-xs text-yellow-400">On Leave</p>
                </div>
              </div>
              {faculty.faculty?.slice(0, 4).map((f: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-medium text-indigo-400">
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Examinations</h2>
            <Link to="/principal/examinations" className="text-sm text-indigo-600 hover:text-indigo-700">Details</Link>
          </div>
          {exams && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Active</span><span className="font-medium">{exams.active}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Upcoming</span><span className="font-medium">{exams.upcoming}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Pass Rate</span><span className="font-medium text-green-600">{exams.passRate}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Pending Results</span><span className="font-medium text-orange-600">{exams.pendingResults}</span></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Admissions</h2>
            <Link to="/principal/admissions" className="text-sm text-indigo-600 hover:text-indigo-700">Details</Link>
          </div>
          {admissions && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Applied</span><span className="font-medium">{admissions.applied}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Under Review</span><span className="font-medium">{admissions.underReview}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Enrolled</span><span className="font-medium text-green-600">{admissions.enrolled}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Total</span><span className="font-medium">{admissions.total}</span></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Finance</h2>
            <Link to="/principal/finance" className="text-sm text-indigo-600 hover:text-indigo-700">Details</Link>
          </div>
          {finance && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Month Collection</span><span className="font-medium">{formatCurrency(finance.monthRevenue)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Outstanding</span><span className="font-medium text-red-600">{formatCurrency(finance.outstandingDues)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Collection Rate</span><span className="font-medium">{finance.feeCollectionRate}%</span></div>
            </div>
          )}
        </div>
      </div>

      {/* LMS, Discipline, Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">LMS Overview</h2>
          {lms && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Assignments</span><span className="font-medium">{lms.assignments}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Submissions</span><span className="font-medium">{lms.submissions}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Study Materials</span><span className="font-medium">{lms.materials}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Pending Evaluation</span><span className="font-medium text-orange-600">{lms.pendingEvaluation}</span></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Discipline</h2>
          {discipline && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Open Complaints</span><span className="font-medium text-red-600">{discipline.openComplaints}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Resolved (Month)</span><span className="font-medium text-green-600">{discipline.resolvedThisMonth}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Escalations</span><span className="font-medium text-orange-600">{discipline.escalations}</span></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Approvals</h2>
            <Link to="/principal/approvals" className="text-sm text-indigo-600 hover:text-indigo-700">View All</Link>
          </div>
          {workflow && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Pending</span><span className="font-medium text-orange-600">{workflow.pending}</span></div>
              {(workflow.byType || []).slice(0, 3).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <span className="text-xs text-gray-700">{item.type?.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-medium text-orange-600">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {activity.length === 0 && <p className="text-sm text-gray-500">No recent activity</p>}
          {activity.map((item: any) => (
            <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-gray-700 truncate">{item.action}</p>
                <p className="text-xs text-gray-500">{item.user?.fullName} &middot; {new Date(item.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, GraduationCap, DollarSign, TrendingUp, Clock, CheckCircle,
  AlertTriangle, RefreshCw, Target, BookOpen, School, Building2,
} from 'lucide-react'
import { cn, formatCurrency, formatNumber } from '@/lib/utils'
import { StatCard } from '@/components/StatCard'
import { GreetingBanner } from '@/components/GreetingBanner'
import api from '@/services/api'

export function DirectorDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [faculty, setFaculty] = useState<any>(null)
  const [admissions, setAdmissions] = useState<any>(null)
  const [exams, setExams] = useState<any>(null)
  const [finance, setFinance] = useState<any>(null)
  const [hr, setHr] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        api.get('/director/kpis'),
        api.get('/director/departments'),
        api.get('/director/faculty'),
        api.get('/director/admissions'),
        api.get('/director/examinations'),
        api.get('/director/finance'),
        api.get('/director/hr'),
        api.get('/director/workflow'),
        api.get('/director/activity?limit=10'),
      ])
      const get = (i: number) => results[i].status === 'fulfilled' ? (results[i] as PromiseFulfilledResult<any>).value.data.data : null
      setKpis(get(0))
      setDepartments(get(1) || [])
      setFaculty(get(2))
      setAdmissions(get(3))
      setExams(get(4))
      setFinance(get(5))
      setHr(get(6))
      setWorkflow(get(7))
      setActivity(get(8) || [])
    } catch (err) {
      console.error('Dashboard load error:', err)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <GreetingBanner />
      <div className="flex items-center justify-end">
        <button onClick={loadDashboard} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={formatNumber(kpis?.totalStudents || 0)} icon={Users} trend={kpis?.studentGrowth > 0 ? `+${kpis.studentGrowth}%` : undefined} color="blue" />
        <StatCard title="Faculty" value={formatNumber(kpis?.totalFaculty || 0)} icon={GraduationCap} color="green" />
        <StatCard title="Departments" value={kpis?.totalDepartments || 0} icon={Building2} color="purple" />
        <StatCard title="Health Score" value={`${kpis?.academicHealthScore || 0}`} icon={Target} color="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today Attendance" value={`${kpis?.todayAttendance || 0}%`} icon={CheckCircle} color="emerald" />
        <StatCard title="Pending Approvals" value={kpis?.pendingApprovals || 0} icon={Clock} color="orange" />
        <StatCard title="Admissions" value={kpis?.totalAdmissions || 0} icon={School} color="indigo" />
        <StatCard title="Pass Rate" value={`${kpis?.passRate || 0}%`} icon={TrendingUp} color="teal" />
      </div>

      {/* Department Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Department Performance</h2>
          <Link to="/director/departments" className="text-sm text-indigo-600 hover:text-indigo-700">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Department</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Students</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Faculty</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Attendance</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Avg Marks</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Performance</th>
              </tr>
            </thead>
            <tbody>
              {departments.slice(0, 6).map((dept: any) => (
                <tr key={dept.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{dept.name}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{dept.students}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{dept.faculty}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{dept.attendanceRate}%</td>
                  <td className="py-3 px-4 text-center text-gray-700">{dept.avgMarks}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      dept.performance >= 75 ? 'bg-green-100 text-green-800' :
                      dept.performance >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {dept.performance}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column: Faculty & Finance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Faculty Overview</h2>
            <Link to="/director/faculty" className="text-sm text-indigo-600 hover:text-indigo-700">Details</Link>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Academic Faculty</span>
              <span className="font-medium text-gray-900">{faculty?.totalFaculty || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending Leave Requests</span>
              <span className="font-medium text-orange-600">{faculty?.pendingLeaves || 0}</span>
            </div>
            {faculty?.topPerformers?.slice(0, 3).map((f: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700">
                  {f.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                  <p className="text-xs text-gray-500">{f.designation}</p>
                </div>
                <span className="text-sm font-medium text-green-600">{f.performanceScore}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Finance Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Finance Summary</h2>
            <Link to="/director/finance" className="text-sm text-indigo-600 hover:text-indigo-700">Details</Link>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <p className="text-xs text-green-600 font-medium">Month Revenue</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(finance?.monthRevenue || 0)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Today</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(finance?.todayRevenue || 0)}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs text-red-600 font-medium">Outstanding</p>
                <p className="text-lg font-bold text-red-700">{formatCurrency(finance?.outstanding || 0)}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Collection Rate</span>
              <span className="font-medium text-gray-900">{finance?.feeCollectionRate || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column: Admissions & Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admissions Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Admissions</h2>
            <Link to="/director/admissions" className="text-sm text-indigo-600 hover:text-indigo-700">Details</Link>
          </div>
          {admissions && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Applications</span>
                <span className="font-semibold text-gray-900">{admissions.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="font-semibold text-indigo-600">{admissions.conversionRate || 0}%</span>
              </div>
              {Object.entries(admissions.pipeline || {}).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 flex-1">{status}</span>
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${Math.min(((count as number) / Math.max(admissions.total || 1, 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{count as number}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exam Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Examinations</h2>
            <Link to="/director/examinations" className="text-sm text-indigo-600 hover:text-indigo-700">Details</Link>
          </div>
          {exams && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="text-2xl font-bold text-blue-700">{exams.total || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">Total</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-50 border border-green-100">
                  <p className="text-2xl font-bold text-green-700">{exams.completed || 0}</p>
                  <p className="text-xs text-green-600 mt-1">Completed</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                  <p className="text-2xl font-bold text-yellow-700">{exams.pending || 0}</p>
                  <p className="text-xs text-yellow-600 mt-1">Pending</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium text-gray-900">{exams.completionRate || 0}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pass Rate</span>
                  <span className="font-medium text-green-600">{exams.passRate || 0}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average Marks</span>
                  <span className="font-medium text-gray-900">{exams.avgMarks || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workflow & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Pending */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
            <Link to="/director/approvals" className="text-sm text-indigo-600 hover:text-indigo-700">View All</Link>
          </div>
          {workflow && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 rounded-lg bg-yellow-50 border border-yellow-100">
                  <p className="text-xl font-bold text-yellow-700">{workflow.pending || 0}</p>
                  <p className="text-xs text-yellow-600">Pending</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-green-50 border border-green-100">
                  <p className="text-xl font-bold text-green-700">{workflow.approved || 0}</p>
                  <p className="text-xs text-green-600">Approved</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-xl font-bold text-red-700">{workflow.rejected || 0}</p>
                  <p className="text-xs text-red-600">Rejected</p>
                </div>
              </div>
              {(workflow.byType || []).slice(0, 4).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-700">{item.type?.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-medium text-orange-600">{item.count} pending</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {activity.length === 0 && (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
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

      {/* HR Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">HR Overview</h2>
          <Link to="/director/hr" className="text-sm text-indigo-600 hover:text-indigo-700">Details</Link>
        </div>
        {hr && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-3xl font-bold text-blue-700">{hr.teaching || 0}</p>
              <p className="text-sm text-blue-600 mt-1">Teaching Staff</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-100">
              <p className="text-3xl font-bold text-purple-700">{hr.nonTeaching || 0}</p>
              <p className="text-sm text-purple-600 mt-1">Non-Teaching Staff</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-100">
              <p className="text-3xl font-bold text-orange-700">{hr.pendingLeaves || 0}</p>
              <p className="text-sm text-orange-600 mt-1">Pending Leaves</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100">
              <p className="text-3xl font-bold text-green-700">{hr.activeEmployees || 0}</p>
              <p className="text-sm text-green-600 mt-1">Total Active</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

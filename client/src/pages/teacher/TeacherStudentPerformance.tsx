import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { AlertCircle, RefreshCw, Users, TrendingDown, BarChart3, Award } from 'lucide-react'

export function TeacherStudentPerformance() {
  const { data, loading, error, refetch } = useApi('/teacher/students/performance')

  const students = data?.students ?? data ?? []
  const summary = data?.summary ?? {}

  const totalStudents = summary.totalStudents ?? students.length
  const atRisk = summary.atRisk ?? students.filter((s: any) => s.status === 'at-risk').length
  const avgAttendance = summary.avgAttendance ?? 0
  const avgMarks = summary.avgMarks ?? 0

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600">Failed to load performance data</p>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Student Performance</h1>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Users className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg"><TrendingDown className="h-5 w-5 text-red-600" /></div>
            <div>
              <p className="text-sm text-gray-500">At-Risk</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : atRisk}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><BarChart3 className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : `${avgAttendance}%`}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><Award className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Avg Marks</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : avgMarks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !students.length ? (
          <div className="text-center py-16 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No performance data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Attendance %</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Marks</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Pass Rate</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Assignments</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 text-center">{student.attendance ?? '—'}%</td>
                    <td className="px-5 py-4 text-sm text-gray-600 text-center">{student.avgMarks ?? '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 text-center">{student.passRate ?? '—'}%</td>
                    <td className="px-5 py-4 text-sm text-gray-600 text-center">{student.assignments ?? '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full',
                        student.status === 'at-risk'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      )}>
                        {student.status === 'at-risk' ? 'At-Risk' : 'OK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherStudentPerformance

import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, Users, AlertTriangle, Award } from 'lucide-react'

export function HodStudentPerformance() {
  const { data, loading, error, refetch } = useApi<any>('/hod/students/performance')

  const students = data?.students || []
  const totalStudents = data?.totalStudents || students.length
  const atRisk = students.filter((s: any) => s.attendance < 75)
  const topPerformers = [...students]
    .sort((a: any, b: any) => (b.avgMarks || 0) - (a.avgMarks || 0))
    .slice(0, 10)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Performance</h1>
          <p className="text-gray-500 text-sm">Performance analytics & at-risk monitoring</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{totalStudents}</p>
              <p className="text-xs text-gray-500">Total Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{atRisk.length}</p>
              <p className="text-xs text-gray-500">At-Risk Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{topPerformers.length}</p>
              <p className="text-xs text-gray-500">Top Performers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">At-Risk Students (Attendance &lt; 75%)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Attendance %</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Pass Rate</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Avg Marks</th>
              </tr>
            </thead>
            <tbody>
              {atRisk.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No at-risk students
                  </td>
                </tr>
              )}
              {atRisk.map((s: any, i: number) => (
                <tr key={s.id || i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{s.name || s.user?.fullName}</p>
                    {s.admissionNumber && (
                      <p className="text-xs text-gray-500">{s.admissionNumber}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {s.attendance}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">{s.passRate || '—'}%</td>
                  <td className="py-3 px-4 text-center text-gray-700">{s.avgMarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Attendance %</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Pass Rate</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Avg Marks</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No student data available
                  </td>
                </tr>
              )}
              {topPerformers.map((s: any, i: number) => (
                <tr key={s.id || i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400 w-6 text-center">{i + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900">{s.name || s.user?.fullName}</p>
                        {s.admissionNumber && (
                          <p className="text-xs text-gray-500">{s.admissionNumber}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      s.attendance >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}>
                      {s.attendance}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">{s.passRate || '—'}%</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-indigo-700">{s.avgMarks || '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function VicePrincipalAttendance() {
  const [searchParams] = useSearchParams()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vice-principal-attendance-overview'],
    queryFn: async () => {
      const res = await api.get('/vice-principal/attendance-overview')
      return res.data?.data ?? res.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-400">Failed to load attendance data</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const d = data || {}
  const departments = d.departments || d || []
  const overall = d.overall || {}

  const avgRate = overall.averagePercentage ?? (
    departments.length > 0
      ? Math.round(departments.reduce((s: number, dept: any) => s + (dept.percentage ?? 0), 0) / departments.length)
      : 0
  )

  const lowCount = departments.filter((dept: any) => (dept.percentage ?? 0) < 75).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance Overview</h1>
          <p className="text-slate-400 text-sm">Department-wise attendance breakdown</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{avgRate}%</p>
              <p className="text-xs text-slate-400">Overall Average</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{departments.length}</p>
              <p className="text-xs text-slate-400">Departments</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{lowCount}</p>
              <p className="text-xs text-slate-400">Below 75%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Department Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 font-medium text-slate-400">Department</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Total Students</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Present Today</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Absent Today</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No attendance data available
                  </td>
                </tr>
              ) : (
                departments.map((dept: any, idx: number) => (
                  <tr key={dept.id || idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 font-medium text-white">{dept.department || dept.name}</td>
                    <td className="py-3 px-4 text-center text-slate-300">{dept.totalStudents ?? 0}</td>
                    <td className="py-3 px-4 text-center text-slate-300">{dept.presentToday ?? dept.present ?? 0}</td>
                    <td className="py-3 px-4 text-center text-slate-300">
                      {(dept.totalStudents ?? 0) - (dept.presentToday ?? dept.present ?? 0)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        'px-2.5 py-0.5 rounded-full text-xs font-medium',
                        (dept.percentage ?? 0) >= 85 ? 'bg-green-500/15 text-green-400' :
                        (dept.percentage ?? 0) >= 75 ? 'bg-yellow-500/15 text-yellow-400' :
                        'bg-red-500/15 text-red-400'
                      )}>
                        {dept.percentage ?? 0}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default VicePrincipalAttendance

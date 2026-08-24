import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  CalendarDays,
} from 'lucide-react'

function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case 'PRESENT':
      return 'bg-green-100 text-green-700'
    case 'ABSENT':
      return 'bg-red-100 text-red-700'
    case 'LATE':
      return 'bg-yellow-100 text-yellow-700'
    case 'EXCUSED':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export function StudentAttendance() {
  const [days, setDays] = useState(30)
  const { data, loading, error, refetch } = useApi(`/student/attendance?days=${days}`, [days])

  const summary = data?.summary ?? {}
  const subjectWise = data?.subjectWise ?? []
  const records = data?.records ?? []

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600">Failed to load attendance data</p>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 text-sm">Track your attendance across all subjects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            {[7, 14, 30, 60].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium transition-colors',
                  days === d ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                {d}d
              </button>
            ))}
          </div>
          <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Days', value: summary.totalDays ?? 0, icon: CalendarDays, color: 'text-blue-600 bg-blue-50' },
          { label: 'Present', value: summary.present ?? 0, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
          { label: 'Absent', value: summary.absent ?? 0, icon: XCircle, color: 'text-red-600 bg-red-50' },
          { label: 'Late', value: summary.late ?? 0, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Rate', value: `${summary.rate ?? 0}%`, icon: BarChart3, color: 'text-indigo-600 bg-indigo-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                {loading ? (
                  <div className="h-7 w-12 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subject-wise Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Subject-wise Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Present</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Absent</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-5 py-4"><div className="h-5 bg-gray-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : !subjectWise.length ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-500">No attendance data available</td>
                </tr>
              ) : (
                subjectWise.map((sub: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{sub.subject}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 text-center">{sub.total}</td>
                    <td className="px-5 py-4 text-sm text-green-600 font-medium text-center">{sub.present}</td>
                    <td className="px-5 py-4 text-sm text-red-600 font-medium text-center">{sub.absent}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full',
                        sub.rate >= 75 ? 'bg-green-100 text-green-700' : sub.rate >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      )}>
                        {sub.rate}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Attendance Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Time</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-5 py-4"><div className="h-5 bg-gray-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : !records.length ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-gray-500">No records found</td>
                </tr>
              ) : (
                records.map((rec: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{rec.subject}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{rec.time || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', getStatusBadge(rec.status))}>
                        {rec.status}
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

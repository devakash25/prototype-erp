import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  CalendarDays,
  Loader2,
  AlertCircle,
} from 'lucide-react'

function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case 'PRESENT':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'ABSENT':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'LATE':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'EXCUSED':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

function getPercentColor(pct: number) {
  if (pct >= 85) return 'text-green-600 dark:text-green-400'
  if (pct >= 75) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function getPercentBg(pct: number) {
  if (pct >= 85) return 'bg-green-500'
  if (pct >= 75) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function ParentAttendance() {
  const [searchParams] = useSearchParams()
  const childId = searchParams.get('childId') || ''
  const [days, setDays] = useState(30)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-attendance', childId, days],
    queryFn: async () => {
      const res = await api.get(`/parent/attendance?childId=${childId}&days=${days}`)
      return res.data
    },
    enabled: !!childId,
  })

  const summary = data?.summary || {}
  const subjectWise = data?.subjectWise || []
  const records = data?.records || []
  const calendar = data?.calendar || []

  if (!childId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-gray-400">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg">Select a child to view attendance</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-400">Failed to load attendance data</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Attendance</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Monitor your child's attendance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            {[7, 14, 30, 60].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  days === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Today's Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Today's Status</h2>
        {isLoading ? (
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ) : (
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadge(summary.todayStatus || 'N/A')}`}>
            {summary.todayStatus === 'PRESENT' && <CheckCircle2 className="h-4 w-4" />}
            {summary.todayStatus === 'ABSENT' && <XCircle className="h-4 w-4" />}
            {summary.todayStatus === 'LATE' && <Clock className="h-4 w-4" />}
            {summary.todayStatus || 'No data'}
          </span>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Days', value: summary.totalDays ?? 0, color: 'text-blue-500 bg-blue-900/30' },
          { label: 'Present', value: summary.present ?? 0, color: 'text-green-500 bg-green-900/30' },
          { label: 'Absent', value: summary.absent ?? 0, color: 'text-red-500 bg-red-900/30' },
          { label: 'Attendance %', value: `${summary.rate ?? 0}%`, color: 'text-purple-500 bg-purple-900/30' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Monthly Stats Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Monthly Overview</h2>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        ) : !summary.monthlyStats?.length ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No monthly data available</p>
        ) : (
          <div className="space-y-3">
            {summary.monthlyStats.map((m: any, idx: number) => {
              const total = (m.present || 0) + (m.absent || 0) + (m.late || 0)
              return (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-16 shrink-0">{m.month}</span>
                  <div className="flex-1 flex gap-1 h-6 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {total > 0 && (
                      <>
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: `${((m.present || 0) / total) * 100}%` }}
                        />
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: `${((m.absent || 0) / total) * 100}%` }}
                        />
                        <div
                          className="bg-yellow-500 h-full"
                          style={{ width: `${((m.late || 0) / total) * 100}%` }}
                        />
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="text-green-600 dark:text-green-400">{m.present || 0}</span>
                    <span className="text-red-600 dark:text-red-400">{m.absent || 0}</span>
                    <span className="text-yellow-600 dark:text-yellow-400">{m.late || 0}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-wise Attendance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Subject-wise Attendance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Subject</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={2} className="px-5 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : subjectWise.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">No data available</td>
                  </tr>
                ) : (
                  subjectWise.map((sub: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{sub.subject}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${getPercentBg(sub.rate || 0)}`} style={{ width: `${sub.rate || 0}%` }} />
                          </div>
                          <span className={`text-sm font-semibold ${getPercentColor(sub.rate || 0)}`}>
                            {sub.rate ?? 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-gray-400" /> Last 30 Days
            </h2>
          </div>
          <div className="p-5">
            {isLoading ? (
              <div className="grid grid-cols-7 gap-2">
                {[...Array(35)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            ) : calendar.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No calendar data</p>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {calendar.map((day: any, idx: number) => {
                  let dotColor = 'bg-gray-300 dark:bg-gray-600'
                  if (day.status === 'PRESENT') dotColor = 'bg-green-500'
                  else if (day.status === 'ABSENT') dotColor = 'bg-red-500'
                  else if (day.status === 'LATE') dotColor = 'bg-yellow-500'
                  else if (day.status === 'EXCUSED') dotColor = 'bg-blue-500'
                  else if (day.status === 'HOLIDAY') dotColor = 'bg-gray-400 dark:bg-gray-500'
                  else if (day.status === 'WEEKEND') dotColor = 'bg-gray-200 dark:bg-gray-600'

                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      title={`${day.date}: ${day.status}`}
                    >
                      <span className="text-xs text-gray-500 dark:text-gray-400">{day.dayNum || new Date(day.date).getDate()}</span>
                      <div className={`w-3 h-3 rounded-full ${dotColor}`} />
                    </div>
                  )
                })}
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              {[
                { label: 'Present', color: 'bg-green-500' },
                { label: 'Absent', color: 'bg-red-500' },
                { label: 'Late', color: 'bg-yellow-500' },
                { label: 'Holiday', color: 'bg-gray-400 dark:bg-gray-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Records */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Attendance Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Subject</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-5 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">No records found</td>
                </tr>
              ) : (
                records.map((rec: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {rec.date ? new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{rec.subject || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(rec.status)}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{rec.remarks || '—'}</td>
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

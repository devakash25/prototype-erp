import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, AlertCircle, CheckCircle2, XCircle, Clock, BarChart3, CalendarDays } from 'lucide-react'

export function StudentAttendance() {
  const [days, setDays] = useState(30)
  const { data, loading, error, refetch } = useApi(`/student/attendance?days=${days}`, [days])

  const overall = data?.overall ?? {}
  const subjectWise = data?.subjectWise ?? []

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-400">Failed to load attendance data</p>
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
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-slate-400 text-sm">Track your attendance across all subjects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden">
            {[7, 14, 30, 60].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium transition-colors',
                  days === d ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                )}
              >
                {d}d
              </button>
            ))}
          </div>
          <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Classes', value: overall.totalClasses ?? 0, icon: CalendarDays, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Present', value: overall.present ?? 0, icon: CheckCircle2, color: 'text-green-400 bg-green-500/10' },
          { label: 'Absent', value: overall.absent ?? 0, icon: XCircle, color: 'text-red-400 bg-red-500/10' },
          { label: 'Late', value: overall.late ?? 0, icon: Clock, color: 'text-yellow-400 bg-yellow-500/10' },
          { label: 'Rate', value: `${overall.rate ?? 0}%`, icon: BarChart3, color: 'text-indigo-400 bg-indigo-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                {loading ? (
                  <div className="h-7 w-12 bg-slate-700 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subject-wise Breakdown */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Subject-wise Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Subject</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Total</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Present</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Absent</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-5 bg-slate-700 rounded animate-pulse" /></td></tr>
                ))
              ) : !subjectWise.length ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">No attendance data available</td></tr>
              ) : (
                subjectWise.map((sub: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-white">{sub.subject || sub.name}</td>
                    <td className="px-5 py-4 text-sm text-slate-400 text-center">{sub.totalClasses ?? sub.total}</td>
                    <td className="px-5 py-4 text-sm text-green-400 font-medium text-center">{sub.present}</td>
                    <td className="px-5 py-4 text-sm text-red-400 font-medium text-center">{sub.absent}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full',
                        (sub.rate ?? 0) >= 75 ? 'bg-green-500/10 text-green-400' : (sub.rate ?? 0) >= 60 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                      )}>
                        {sub.rate ?? 0}%
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

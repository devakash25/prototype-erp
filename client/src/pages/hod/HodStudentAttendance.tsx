import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react'

export function HodStudentAttendance() {
  const [days, setDays] = useState(7)
  const { data, loading, error, refetch } = useApi<any>(
    `/hod/students/attendance?days=${days}`,
    [days]
  )

  const trend = data?.trend || []
  const avgRate = trend.length > 0
    ? Math.round(trend.reduce((s: number, d: any) => s + d.rate, 0) / trend.length)
    : 0
  const bestDay = trend.length > 0
    ? trend.reduce((best: any, d: any) => (d.rate > (best?.rate || 0) ? d : best), trend[0])
    : null
  const worstDay = trend.length > 0
    ? trend.reduce((worst: any, d: any) => (d.rate < (worst?.rate || 100) ? d : worst), trend[0])
    : null

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
          <h1 className="text-2xl font-bold text-gray-900">Student Attendance</h1>
          <p className="text-gray-500 text-sm">Attendance trends across your department</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            {[7, 14].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  days === d
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {d}-Day
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{avgRate}%</p>
              <p className="text-xs text-gray-500">Average Rate ({days} days)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{bestDay?.rate || 0}%</p>
              <p className="text-xs text-gray-500">Best Day ({bestDay?.day || '—'})</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{worstDay?.rate || 0}%</p>
              <p className="text-xs text-gray-500">Worst Day ({worstDay?.day || '—'})</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend</h2>
        {trend.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
            No attendance data available
          </div>
        ) : (
          <div className="flex items-end gap-2 h-48">
            {trend.map((day: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-700">{day.rate}%</span>
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '120px' }}>
                  <div
                    className={cn(
                      'absolute bottom-0 w-full rounded-t-lg transition-all',
                      day.rate >= 75
                        ? 'bg-gradient-to-t from-green-500 to-emerald-400'
                        : 'bg-gradient-to-t from-red-500 to-orange-400'
                    )}
                    style={{ height: `${day.rate}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

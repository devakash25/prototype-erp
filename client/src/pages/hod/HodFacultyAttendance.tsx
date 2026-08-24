import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'

export function HodFacultyAttendance() {
  const [days, setDays] = useState(7)
  const { data: attendanceData, loading, error, refetch } = useApi<any>(`/hod/faculty/attendance?days=${days}`, [days])

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
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  const trend = attendanceData?.trend || []
  const avgRate = attendanceData?.averageRate || 0
  const bestDay = attendanceData?.bestDay || '-'
  const worstDay = attendanceData?.worstDay || '-'

  const maxRate = Math.max(...trend.map((d: any) => d.rate || 0), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Attendance Trend</h1>
          <p className="text-gray-500 text-sm mt-1">Daily attendance tracking for department faculty</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
          </select>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgRate}%</p>
              <p className="text-xs text-gray-500">Average Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{bestDay}</p>
              <p className="text-xs text-gray-500">Best Day</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{worstDay}</p>
              <p className="text-xs text-gray-500">Worst Day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Attendance Trend</h2>
        {trend.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No attendance data available</p>
        ) : (
          <div className="flex items-end gap-2 h-64">
            {trend.map((day: any, i: number) => {
              const barHeight = maxRate > 0 ? ((day.rate || 0) / maxRate) * 100 : 0
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-xs font-medium text-gray-700">{day.rate || 0}%</span>
                  <div
                    className={cn(
                      'w-full rounded-t-md transition-all duration-300',
                      (day.rate || 0) >= 80 ? 'bg-green-500' :
                      (day.rate || 0) >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    )}
                    style={{ height: `${barHeight}%`, minHeight: day.rate ? '4px' : '0' }}
                  />
                  <span className="text-xs text-gray-500 mt-1 text-center leading-tight">
                    {day.date ? new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

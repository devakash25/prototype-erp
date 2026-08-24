import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, Clock, CalendarDays } from 'lucide-react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function HodTimetable() {
  const { data, loading, error, refetch } = useApi<any>('/hod/timetable')

  const entries = data?.entries || []
  const totalClasses = entries.length
  const today = DAYS[new Date().getDay()]

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
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-500 text-sm">Today's class schedule across your department</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-indigo-700">{today}</p>
              <p className="text-xs text-gray-500">Current Day</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{totalClasses}</p>
              <p className="text-xs text-gray-500">Total Classes Today</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Teacher</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Course</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Room</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Type</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No classes scheduled for today
                  </td>
                </tr>
              )}
              {entries.map((entry: any, i: number) => (
                <tr key={entry.id || i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{entry.startTime} - {entry.endTime}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {entry.subject?.name || entry.subjectName || '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {entry.teacher?.name || entry.employee?.user?.fullName || entry.teacherName || '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {entry.course?.name || entry.className || entry.courseName || '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{entry.room || '—'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      (entry.type === 'Lecture' || entry.type === 'lecture') && 'bg-blue-100 text-blue-700',
                      (entry.type === 'Lab' || entry.type === 'lab') && 'bg-green-100 text-green-700',
                      (entry.type === 'Tutorial' || entry.type === 'tutorial') && 'bg-purple-100 text-purple-700',
                      !['Lecture', 'lecture', 'Lab', 'lab', 'Tutorial', 'tutorial'].includes(entry.type) && 'bg-gray-100 text-gray-700'
                    )}>
                      {entry.type || '—'}
                    </span>
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

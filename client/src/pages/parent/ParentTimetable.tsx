import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import { RefreshCw, Clock, User, MapPin, Loader2, AlertCircle } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_ABBREV: Record<string, string> = {
  MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday',
  THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday',
}

const SUBJECT_COLORS = [
  'bg-blue-900/40 border-blue-700/50 text-blue-300',
  'bg-green-900/40 border-green-700/50 text-green-300',
  'bg-purple-900/40 border-purple-700/50 text-purple-300',
  'bg-amber-900/40 border-amber-700/50 text-amber-300',
  'bg-pink-900/40 border-pink-700/50 text-pink-300',
  'bg-cyan-900/40 border-cyan-700/50 text-cyan-300',
  'bg-red-900/40 border-red-700/50 text-red-300',
  'bg-indigo-900/40 border-indigo-700/50 text-indigo-300',
]

function getSubjectColor(subjectName: string) {
  let hash = 0
  for (let i = 0; i < (subjectName || '').length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash)
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length]
}

export function ParentTimetable() {
  const [searchParams] = useSearchParams()
  const childId = searchParams.get('childId') || ''

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-timetable', childId],
    queryFn: async () => {
      const res = await api.get(`/parent/timetable?childId=${childId}`)
      return res.data
    },
    enabled: !!childId,
  })

  const timetable = data?.timetable || data || []
  const timeSlots = data?.timeSlots || []

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  if (!childId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-gray-400">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg">Select a child to view timetable</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-400">Failed to load timetable</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const grid: Record<string, Record<string, any>> = {}
  timetable.forEach((entry: any) => {
    const day = DAY_ABBREV[entry.day?.toUpperCase()] || entry.day
    if (!grid[day]) grid[day] = {}
    grid[day][entry.timeSlot || entry.startTime] = entry
  })

  const slots = timeSlots.length > 0
    ? timeSlots
    : Array.from(new Set(
        timetable.map((e: any) => e.timeSlot || e.startTime)
      )).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Timetable</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Weekly class schedule</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : timetable.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-lg text-gray-500 dark:text-gray-400">No timetable data available</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-750 w-24">Day</th>
                {slots.map((slot: string, idx: number) => (
                  <th key={idx} className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-750">
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {DAYS.map((day) => {
                const isToday = day === today
                return (
                  <tr key={day} className={isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}>
                    <td className={`px-4 py-3 text-sm font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      <div className="flex items-center gap-2">
                        {isToday && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        {day.slice(0, 3)}
                      </div>
                    </td>
                    {slots.map((slot: string, sIdx: number) => {
                      const entry = grid[day]?.[slot]
                      return (
                        <td key={sIdx} className="px-2 py-2">
                          {entry ? (
                            <div className={`rounded-lg border p-2.5 ${getSubjectColor(entry.subject?.name || entry.subject || '')}`}>
                              <p className="text-sm font-semibold truncate">{entry.subject?.name || entry.subject || '—'}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <User className="h-3 w-3 opacity-60" />
                                <span className="text-xs opacity-80 truncate">{entry.teacher?.name || entry.teacher || ''}</span>
                              </div>
                              {entry.room && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3 opacity-60" />
                                  <span className="text-xs opacity-80">{entry.room}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-16 rounded-lg bg-gray-50 dark:bg-gray-750 border border-dashed border-gray-200 dark:border-gray-600" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

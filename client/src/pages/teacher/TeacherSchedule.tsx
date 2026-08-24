import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { AlertCircle, RefreshCw, Clock, MapPin, BookOpen } from 'lucide-react'

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'ongoing':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'upcoming':
      return 'bg-gray-100 text-gray-600 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

function getDotColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-500'
    case 'ongoing':
      return 'bg-blue-500 animate-pulse'
    case 'upcoming':
      return 'bg-gray-400'
    default:
      return 'bg-gray-400'
  }
}

export function TeacherSchedule() {
  const { data: schedule, loading, error, refetch } = useApi('/teacher/schedule')

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600">Failed to load schedule</p>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Today's Schedule</h1>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !schedule?.length ? (
        <div className="text-center py-16 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg">No classes scheduled for today</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-6">
            {schedule.map((cls: any, idx: number) => (
              <div key={idx} className="relative flex gap-6">
                <div className="relative z-10 flex flex-col items-center">
                  <div className={cn('h-3 w-3 rounded-full border-2 border-white shadow', getDotColor(cls.status))} />
                </div>
                <div className="flex-1 bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{cls.subject}</h3>
                        <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full border', getStatusColor(cls.status))}>
                          {cls.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {cls.time}</span>
                        <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {cls.course}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {cls.room}</span>
                      </div>
                      {cls.type && <p className="text-xs text-gray-400 capitalize">{cls.type}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherSchedule

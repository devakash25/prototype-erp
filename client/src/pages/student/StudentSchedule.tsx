import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, Clock, MapPin, User, BookOpen, Sun, Sunset, Moon } from 'lucide-react'

function getTimePeriod(timeStr: string) {
  const hour = parseInt(timeStr.split(':')[0], 10)
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

const periodConfig: Record<string, { color: string; border: string; icon: any; label: string }> = {
  morning: { color: 'text-blue-400 bg-blue-500/10', border: 'border-l-blue-500', icon: Sun, label: 'Morning' },
  afternoon: { color: 'text-amber-400 bg-amber-500/10', border: 'border-l-amber-500', icon: Sunset, label: 'Afternoon' },
  evening: { color: 'text-purple-400 bg-purple-500/10', border: 'border-l-purple-500', icon: Moon, label: 'Evening' },
}

export function StudentSchedule() {
  const { data: schedule, loading, error, refetch } = useApi<any[]>('/student/schedule')

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
        <p className="text-red-500">{error}</p>
        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    )
  }

  const entries = schedule || []
  const grouped = entries.reduce((acc: Record<string, any[]>, entry: any) => {
    const period = getTimePeriod(entry.startTime || '')
    if (!acc[period]) acc[period] = []
    acc[period].push(entry)
    return acc
  }, {} as Record<string, any[]>)
  const periodOrder = ['morning', 'afternoon', 'evening']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Class Schedule</h1>
          <p className="text-slate-400 text-sm">Your weekly timetable</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <Clock className="h-12 w-12 mx-auto mb-3 text-slate-600" />
          <p className="text-lg text-slate-400">No classes scheduled</p>
        </div>
      ) : (
        <div className="space-y-6">
          {periodOrder.map((period) => {
            const classes = grouped[period]
            if (!classes?.length) return null
            const cfg = periodConfig[period]
            const Icon = cfg.icon
            return (
              <div key={period}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn('p-1.5 rounded-lg', cfg.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">{cfg.label}</h2>
                  <span className="text-xs text-slate-500">({classes.length} classes)</span>
                </div>
                <div className="grid gap-3">
                  {classes.map((cls: any, idx: number) => (
                    <div key={idx} className={cn('bg-slate-800 rounded-xl border border-slate-700 p-5 border-l-4 hover:border-slate-600 transition-colors', cfg.border)}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-white">{cls.subject?.name || '—'}</h3>
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-700 text-slate-400">{cls.subject?.code || ''}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{cls.startTime} – {cls.endTime}</span>
                            <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{cls.employee?.user?.fullName || '—'}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{cls.room || '—'}</span>
                            {cls.course?.name && <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{cls.course.name}</span>}
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">{cls.startTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

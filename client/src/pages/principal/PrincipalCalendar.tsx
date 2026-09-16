import { useState, useMemo } from 'react'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  FileText,
  Briefcase,
  GraduationCap,
  AlertCircle,
} from 'lucide-react'

const eventTypeConfig: Record<string, { color: string; bg: string; icon: typeof CalendarIcon }> = {
  exam: { color: 'bg-blue-500', bg: 'bg-blue-900/40 text-blue-300', icon: GraduationCap },
  leave: { color: 'bg-yellow-500', bg: 'bg-yellow-900/40 text-yellow-300', icon: Clock },
  workflow: { color: 'bg-purple-500', bg: 'bg-purple-900/40 text-purple-300', icon: Briefcase },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function PrincipalCalendar() {
  const now = new Date()
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string>(formatDateKey(now.getFullYear(), now.getMonth(), now.getDate()))

  const { data, loading, error, refetch } = useApi('/principal/calendar')

  const events = data?.events || []

  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {}
    events.forEach((event: any) => {
      const dateKey = event.date?.slice(0, 10)
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(event)
    })
    return map
  }, [events])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const calendarDays = useMemo(() => {
    const days: { day: number; key: string; currentMonth: boolean }[] = []
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1)
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i
      const m = currentMonth === 0 ? 11 : currentMonth - 1
      const y = currentMonth === 0 ? currentYear - 1 : currentYear
      days.push({ day: d, key: formatDateKey(y, m, d), currentMonth: false })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, key: formatDateKey(currentYear, currentMonth, d), currentMonth: true })
    }
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1
      const y = currentMonth === 11 ? currentYear + 1 : currentYear
      days.push({ day: d, key: formatDateKey(y, m, d), currentMonth: false })
    }
    return days
  }, [currentYear, currentMonth, firstDay, daysInMonth])

  const todayKey = formatDateKey(now.getFullYear(), now.getMonth(), now.getDate())

  const selectedEvents = eventsByDate[selectedDate] || []

  const goToToday = () => {
    const n = new Date()
    setCurrentYear(n.getFullYear())
    setCurrentMonth(n.getMonth())
    setSelectedDate(formatDateKey(n.getFullYear(), n.getMonth(), n.getDate()))
  }

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Calendar</h1>
            <p className="text-slate-400 text-sm">View scheduled events</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">Failed to load calendar data</p>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            <RefreshCw className="w-4 h-4" />Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-slate-400 text-sm">View scheduled events</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-white">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs bg-indigo-900/50 text-indigo-300 rounded-lg hover:bg-indigo-900/70 font-medium"
            >
              Today
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-700 rounded-lg overflow-hidden">
            {DAYS.map((day) => (
              <div key={day} className="bg-slate-700/50 px-2 py-2 text-center text-xs font-medium text-slate-400">
                {day}
              </div>
            ))}

            {calendarDays.map((cell) => {
              const dayEvents = eventsByDate[cell.key] || []
              const isSelected = cell.key === selectedDate
              const isToday = cell.key === todayKey

              return (
                <button
                  key={cell.key}
                  onClick={() => setSelectedDate(cell.key)}
                  className={cn(
                    'relative bg-slate-800 p-2 min-h-[72px] text-left hover:bg-slate-700 transition-colors',
                    !cell.currentMonth && 'bg-slate-800/50 text-slate-600',
                    isSelected && 'bg-indigo-900/30 ring-2 ring-inset ring-indigo-500',
                    isToday && 'font-bold'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-6 h-6 text-xs rounded-full',
                      isToday && !isSelected && 'bg-indigo-600 text-white',
                      isSelected && 'bg-indigo-600 text-white'
                    )}
                  >
                    {cell.day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-indigo-900/50 text-indigo-300 text-[10px] font-medium rounded-full">
                        {dayEvents.length}
                      </span>
                      <div className="flex gap-0.5">
                        {[...new Set(dayEvents.map((e: any) => e.type))].slice(0, 3).map((type) => (
                          <span
                            key={type as string}
                            className={cn('w-1.5 h-1.5 rounded-full', eventTypeConfig[type as string]?.color || 'bg-slate-400')}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            Events for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>

          {selectedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-500">
              <CalendarIcon className="w-8 h-8 mb-2 text-slate-600" />
              <p className="text-sm">No events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((event: any) => {
                const config = eventTypeConfig[event.type] || { color: 'bg-slate-500', bg: 'bg-slate-700/50 text-slate-300', icon: FileText }
                const Icon = config.icon
                return (
                  <div key={event.id} className={cn('p-3 rounded-lg border border-slate-600/50', config.bg)}>
                    <div className="flex items-start gap-2">
                      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs opacity-70 capitalize">{event.type}</p>
                        {event.details?.name && (
                          <p className="text-xs opacity-70 mt-1">{event.details.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-700">
            <p className="text-xs font-medium text-slate-400 mb-3">Legend</p>
            <div className="space-y-2">
              {Object.entries(eventTypeConfig).map(([type, config]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className={cn('w-2.5 h-2.5 rounded-full', config.color)} />
                  <span className="text-xs text-slate-400 capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
} from 'lucide-react'

const eventTypeConfig: Record<string, { color: string; bg: string; icon: typeof CalendarIcon }> = {
  exam: { color: 'bg-blue-500', bg: 'bg-blue-100 text-blue-700', icon: GraduationCap },
  leave: { color: 'bg-yellow-500', bg: 'bg-yellow-100 text-yellow-700', icon: Clock },
  workflow: { color: 'bg-purple-500', bg: 'bg-purple-100 text-purple-700', icon: Briefcase },
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

  const { data, loading } = useApi('/principal/calendar')

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 text-sm">View scheduled events</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium"
            >
              Today
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {DAYS.map((day) => (
              <div key={day} className="bg-gray-50 px-2 py-2 text-center text-xs font-medium text-gray-500">
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
                    'relative bg-white p-2 min-h-[72px] text-left hover:bg-gray-50 transition-colors',
                    !cell.currentMonth && 'bg-gray-50/50 text-gray-300',
                    isSelected && 'bg-indigo-50 ring-2 ring-inset ring-indigo-500',
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
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-indigo-100 text-indigo-700 text-[10px] font-medium rounded-full">
                        {dayEvents.length}
                      </span>
                      <div className="flex gap-0.5">
                        {[...new Set(dayEvents.map((e: any) => e.type))].slice(0, 3).map((type) => (
                          <span
                            key={type as string}
                            className={cn('w-1.5 h-1.5 rounded-full', eventTypeConfig[type as string]?.color || 'bg-gray-400')}
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

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Events for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
          ) : selectedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <CalendarIcon className="w-8 h-8 mb-2 text-gray-300" />
              <p className="text-sm">No events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((event: any) => {
                const config = eventTypeConfig[event.type] || { color: 'bg-gray-500', bg: 'bg-gray-100 text-gray-700', icon: FileText }
                const Icon = config.icon
                return (
                  <div key={event.id} className={cn('p-3 rounded-lg border', config.bg)}>
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

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-3">Legend</p>
            <div className="space-y-2">
              {Object.entries(eventTypeConfig).map(([type, config]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className={cn('w-2.5 h-2.5 rounded-full', config.color)} />
                  <span className="text-xs text-gray-600 capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

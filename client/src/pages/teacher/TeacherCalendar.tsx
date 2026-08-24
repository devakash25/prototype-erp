import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { RefreshCw, ChevronLeft, ChevronRight, Award, ClipboardList, FileCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TeacherCalendar() {
  const { data, loading, error, refetch } = useApi<any>('/teacher/calendar')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const year = currentDate.getFullYear(), month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay(), daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const events = (data?.events || []).map((e: any) => ({ ...e, dateObj: new Date(e.date) }))
  const getEventsForDay = (day: number) => events.filter((e: any) => e.dateObj.getFullYear() === year && e.dateObj.getMonth() === month && e.dateObj.getDate() === day)
  const selectedEvents = selectedDate ? events.filter((e: any) => e.dateObj.toDateString() === selectedDate.toDateString()) : []
  const prevMonth = () => setCurrentDate(new Date(year, month - 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1))
  const goToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()) }

  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-4"><p className="text-red-500">{error}</p><button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button></div>

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const iconMap: Record<string, any> = { exam: Award, leave: ClipboardList, assignment: FileCheck }
  const colorMap: Record<string, string> = { exam: 'bg-blue-100 text-blue-700', leave: 'bg-amber-100 text-amber-700', assignment: 'bg-purple-100 text-purple-700' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Calendar</h1><p className="text-gray-500 text-sm">Your schedule and deadlines</p></div>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="text-lg font-semibold text-gray-900">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <div className="flex gap-2"><button onClick={goToday} className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100">Today</button><button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button></div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {weekDays.map(d => <div key={d} className="bg-gray-50 px-2 py-2 text-center text-xs font-medium text-gray-500">{d}</div>)}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="bg-white p-2 min-h-[70px]" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1, dayEvents = getEventsForDay(day)
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
              const isSelected = selectedDate?.getFullYear() === year && selectedDate?.getMonth() === month && selectedDate?.getDate() === day
              return (
                <div key={day} onClick={() => setSelectedDate(new Date(year, month, day))} className={cn('bg-white p-2 min-h-[70px] cursor-pointer hover:bg-gray-50', isSelected && 'bg-indigo-50', isToday && 'ring-2 ring-indigo-500')}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn('text-sm', isToday ? 'font-bold text-indigo-600' : 'text-gray-700')}>{day}</span>
                    {dayEvents.length > 0 && <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{dayEvents.length}</span>}
                  </div>
                  <div className="space-y-0.5">{dayEvents.slice(0, 2).map((e: any, j: number) => <div key={j} className={cn('text-[10px] px-1 py-0.5 rounded truncate', colorMap[e.type] || 'bg-gray-100 text-gray-700')}>{e.title}</div>)}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="w-80 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a day'}</h3>
          {selectedEvents.length === 0 ? <p className="text-sm text-gray-500">No events</p> : <div className="space-y-3">{selectedEvents.map((e: any, i: number) => { const Icon = iconMap[e.type] || ClipboardList; return <div key={i} className="p-3 rounded-lg border border-gray-100"><div className="flex items-center gap-2 mb-1"><Icon className="w-4 h-4 text-gray-500" /><span className="text-sm font-medium text-gray-900">{e.title}</span></div><p className="text-xs text-gray-500 capitalize">{e.type}</p></div> })}</div>}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Legend</h4>
            <div className="space-y-1"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500" /><span className="text-xs text-gray-600">Exam</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500" /><span className="text-xs text-gray-600">Leave</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-500" /><span className="text-xs text-gray-600">Assignment</span></div></div>
          </div>
        </div>
      </div>
    </div>
  )
}

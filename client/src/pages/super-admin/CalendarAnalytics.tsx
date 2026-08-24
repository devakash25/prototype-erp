import { useState } from 'react'
import { Calendar, Clock, AlertTriangle, CheckCircle, CalendarDays, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useApi } from '@/hooks/useApi'
import { exportToCSV } from '@/lib/utils'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { StatsSkeleton } from '@/components/LoadingSkeleton'

export function CalendarAnalytics() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const dateParams = new URLSearchParams()
  if (fromDate) dateParams.append('from', fromDate)
  if (toDate) dateParams.append('to', toDate)
  const queryString = dateParams.toString()

  const { data: stats, loading: statsLoading } = useApi(`/analytics/calendar/stats${queryString ? `?${queryString}` : ''}`)
  const { data: upcoming } = useApi('/analytics/calendar/upcoming')
  const { data: eventTypes } = useApi('/analytics/calendar/event-types')
  const { data: monthly } = useApi('/analytics/calendar/monthly')
  const s = stats || { totalEvents: 0, upcoming: 0, thisWeek: 0 }

  const handleExportUpcoming = () => {
    if (!upcoming || upcoming.length === 0) return
    const data = upcoming.map((event: any) => ({
      Title: event.title,
      Type: event.type,
      Date: event.date,
      'All Day': event.allDay ? 'Yes' : 'No'
    }))
    exportToCSV(data, 'upcoming-events')
  }

  if (statsLoading) {
    return <StatsSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Calendar Analytics</h1><p className="text-sm text-gray-500">Events, holidays, exams, and schedules</p></div>
        <div className="flex items-center gap-3">
          <DateRangeFilter fromDate={fromDate} toDate={toDate} onFromDateChange={setFromDate} onToDateChange={setToDate} />
          <button onClick={handleExportUpcoming} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"><Download className="w-4 h-4" />Export CSV</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Calendar className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-gray-900">{s.totalEvents}</p><p className="text-xs text-gray-500">Total Events</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><CalendarDays className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold text-green-600">{s.upcoming}</p><p className="text-xs text-gray-500">Upcoming</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><Clock className="w-5 h-5 text-purple-600" /></div><div><p className="text-2xl font-bold text-purple-600">{s.thisWeek}</p><p className="text-xs text-gray-500">This Week</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-orange-600" /></div><div><p className="text-2xl font-bold text-orange-600">{eventTypes?.length || 0}</p><p className="text-xs text-gray-500">Event Types</p></div></div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Monthly Events</h3><ResponsiveContainer width="100%" height={300}><BarChart data={monthly || []}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="exams" fill="#6366f1" name="Exams" radius={[4, 4, 0, 0]} /><Bar dataKey="holidays" fill="#10b981" name="Holidays" radius={[4, 4, 0, 0]} /><Bar dataKey="events" fill="#f59e0b" name="Events" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Events by Type</h3><div className="space-y-3">{(eventTypes || []).map((et: any) => <div key={et.type} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: et.color }} /><span className="text-sm font-medium text-gray-900 flex-1">{et.type}</span><span className="text-sm text-gray-600">{et.count} events</span></div>)}</div></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Upcoming Events</h3></div>
        <div className="divide-y divide-gray-100">
          {(upcoming || []).map((event: any) => (
            <div key={event.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0"><span className="text-sm font-bold text-indigo-600">{event.date?.slice(-2)}</span></div>
              <div className="flex-1"><p className="text-sm font-medium text-gray-900">{event.title}</p><p className="text-xs text-gray-500">{event.type} • {event.date}</p></div>
              {event.allDay && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">All Day</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

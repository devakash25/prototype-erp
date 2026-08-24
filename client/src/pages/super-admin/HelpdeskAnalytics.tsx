import { useState } from 'react'
import { HelpCircle, Clock, CheckCircle, AlertTriangle, Download } from 'lucide-react'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn, exportToCSV } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { StatsSkeleton } from '@/components/LoadingSkeleton'

const statusColors: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700', IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700', CLOSED: 'bg-gray-100 text-gray-700',
}

export function HelpdeskAnalytics() {
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  const dateParams = new URLSearchParams()
  if (fromDate) dateParams.append('from', fromDate)
  if (toDate) dateParams.append('to', toDate)
  const queryString = dateParams.toString()
  const apiUrl = (endpoint: string) => `${endpoint}${queryString ? `?${queryString}` : ''}`

  const { data: stats, loading: statsLoading } = useApi(apiUrl('/analytics/helpdesk/stats'))
  const { data: categories } = useApi(apiUrl('/analytics/helpdesk/categories'))
  const { data: resolutionTrend } = useApi(apiUrl('/analytics/helpdesk/resolution-trend'))
  const { data: priority } = useApi(apiUrl('/analytics/helpdesk/priority'))
  const { data: recent } = useApi(apiUrl('/analytics/helpdesk/recent'))
  const s = stats || { total: 0, open: 0, resolved: 0, avgResolutionTime: 0 }

  const exportRecentTickets = () => {
    if (!recent || recent.length === 0) return
    const data = recent.map((t: any) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      category: t.category,
    }))
    exportToCSV(data, 'helpdesk-recent-tickets')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Helpdesk Analytics</h1><p className="text-sm text-gray-500">Tickets, complaints, and resolution metrics</p></div>
        <div className="flex items-center gap-3">
          <DateRangeFilter fromDate={fromDate} toDate={toDate} onFromDateChange={setFromDate} onToDateChange={setToDate} />
          <button onClick={exportRecentTickets} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"><Download className="w-4 h-4" />Export CSV</button>
        </div>
      </div>
      {statsLoading ? <StatsSkeleton /> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><HelpCircle className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-gray-900">{s.total}</p><p className="text-xs text-gray-500">Total Tickets</p></div></div></div>
            <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div><div><p className="text-2xl font-bold text-red-600">{s.open}</p><p className="text-xs text-gray-500">Open</p></div></div></div>
            <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold text-green-600">{s.resolved}</p><p className="text-xs text-gray-500">Resolved</p></div></div></div>
            <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><Clock className="w-5 h-5 text-purple-600" /></div><div><p className="text-2xl font-bold text-purple-600">{s.avgResolutionTime}h</p><p className="text-xs text-gray-500">Avg Resolution</p></div></div></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Tickets by Category</h3><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={categories || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count">{(categories || []).map((_: any, i: number) => <Cell key={i} fill={['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#a855f7'][i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
            <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Weekly Resolution Trend</h3><ResponsiveContainer width="100%" height={280}><LineChart data={resolutionTrend || []}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="week" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Line type="monotone" dataKey="opened" stroke="#ef4444" strokeWidth={2} name="Opened" /><Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" /></LineChart></ResponsiveContainer></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Open by Priority</h3><div className="space-y-3">{(priority || []).map((p: any) => <div key={p.priority} className="flex items-center gap-3"><span className="text-sm text-gray-600 w-16">{p.priority}</span><div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(p.count / Math.max(...(priority || []).map((x: any) => x.count || 1))) * 100}%`, backgroundColor: p.color }} /></div><span className="text-sm font-medium text-gray-900 w-8 text-right">{p.count}</span></div>)}</div></div>
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Recent Tickets</h3></div>
              <div className="divide-y divide-gray-100">
                {(recent || []).map((ticket: any) => (
                  <div key={ticket.id} className="px-5 py-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">{ticket.id}</span><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColors[ticket.status])}>{ticket.status?.replace('_', ' ')}</span></div>
                    <p className="text-sm font-medium text-gray-900">{ticket.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500"><span>{ticket.category}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

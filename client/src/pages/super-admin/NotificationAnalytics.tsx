import { useState } from 'react'
import { Bell, Users, Eye, CheckCircle, AlertTriangle, Download } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { exportToCSV } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { StatsSkeleton } from '@/components/LoadingSkeleton'

export function NotificationAnalytics() {
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  const dateParams = new URLSearchParams()
  if (fromDate) dateParams.append('from', fromDate)
  if (toDate) dateParams.append('to', toDate)
  const queryString = dateParams.toString()

  const { data: stats, loading: statsLoading } = useApi(`/analytics/notifications/stats${queryString ? `?${queryString}` : ''}`)
  const { data: categories } = useApi(`/analytics/notifications/categories${queryString ? `?${queryString}` : ''}`)
  const { data: deliveryTrend } = useApi(`/analytics/notifications/delivery-trend${queryString ? `?${queryString}` : ''}`)
  const { data: recent } = useApi(`/analytics/notifications/recent${queryString ? `?${queryString}` : ''}`)
  const s = stats || { total: 0, sent: 0, scheduled: 0, readRate: 0 }

  const handleExportRecent = () => {
    const rows = (recent || []).map((n: any) => ({
      title: n.title,
      message: n.message,
      type: n.type,
      target: n.target,
    }))
    exportToCSV(rows, 'notification-analytics-recent')
  }

  if (statsLoading) {
    return <StatsSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Notification Analytics</h1><p className="text-sm text-gray-500">Notifications delivery, read rates, and engagement</p></div>
        <div className="flex items-center gap-3">
          <DateRangeFilter fromDate={fromDate} toDate={toDate} onFromDateChange={setFromDate} onToDateChange={setToDate} />
          <button onClick={handleExportRecent} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"><Download className="w-4 h-4" />Export CSV</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Bell className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-gray-900">{s.total}</p><p className="text-xs text-gray-500">Total</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold text-green-600">{s.sent}</p><p className="text-xs text-gray-500">Sent</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-orange-600" /></div><div><p className="text-2xl font-bold text-orange-600">{s.scheduled}</p><p className="text-xs text-gray-500">Scheduled</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><Eye className="w-5 h-5 text-purple-600" /></div><div><p className="text-2xl font-bold text-purple-600">{s.readRate}%</p><p className="text-xs text-gray-500">Read Rate</p></div></div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Notifications by Type</h3><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={categories || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count">{(categories || []).map((_: any, i: number) => <Cell key={i} fill={['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'][i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Monthly Delivery Trend</h3><ResponsiveContainer width="100%" height={280}><BarChart data={deliveryTrend || []}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="sent" fill="#6366f1" name="Sent" radius={[4, 4, 0, 0]} /><Bar dataKey="read" fill="#10b981" name="Read" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Recent Notifications</h3></div>
        <div className="divide-y divide-gray-100">
          {(recent || []).map((n: any) => (
            <div key={n.id} className="px-5 py-3 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-gray-900">{n.title}</span><span className="text-xs text-gray-500">{n.target}</span></div>
              <p className="text-sm text-gray-600 truncate">{n.message}</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500"><span>{n.type}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Bus, Users, MapPin, Wrench, Route, DollarSign, Download } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn, formatCurrency, formatNumber, exportToCSV } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { StatsSkeleton } from '@/components/LoadingSkeleton'

export function TransportAnalytics() {
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  const dateParams = new URLSearchParams()
  if (fromDate) dateParams.append('from', fromDate)
  if (toDate) dateParams.append('to', toDate)
  const queryString = dateParams.toString()

  const { data: stats, loading: statsLoading } = useApi(`/analytics/transport/stats${queryString ? `?${queryString}` : ''}`)
  const { data: routes } = useApi(`/analytics/transport/routes${queryString ? `?${queryString}` : ''}`)
  const { data: vehicleTypes } = useApi(`/analytics/transport/vehicles${queryString ? `?${queryString}` : ''}`)
  const { data: fuelExpenses } = useApi(`/analytics/transport/fuel${queryString ? `?${queryString}` : ''}`)
  const s = stats || { totalVehicles: 0, totalRoutes: 0, totalStudents: 0 }

  const handleExportRoutes = () => {
    const rows = (routes || []).map((route: any) => ({
      name: route.name,
      students: route.students,
      stops: route.stops,
      occupancy: route.occupancy,
    }))
    exportToCSV(rows, 'transport-routes')
  }

  if (statsLoading) {
    return <StatsSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Transport Analytics</h1><p className="text-sm text-gray-500">Vehicles, routes, and student transport</p></div>
        <div className="flex items-center gap-3">
          <DateRangeFilter fromDate={fromDate} toDate={toDate} onFromDateChange={setFromDate} onToDateChange={setToDate} />
          <button onClick={handleExportRoutes} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"><Download className="w-4 h-4" />Export CSV</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Bus className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-gray-900">{s.totalVehicles}</p><p className="text-xs text-gray-500">Total Vehicles</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Route className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold text-gray-900">{s.totalRoutes}</p><p className="text-xs text-gray-500">Active Routes</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><Users className="w-5 h-5 text-purple-600" /></div><div><p className="text-2xl font-bold text-gray-900">{formatNumber(s.totalStudents)}</p><p className="text-xs text-gray-500">Students Using</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><Wrench className="w-5 h-5 text-orange-600" /></div><div><p className="text-2xl font-bold text-orange-600">0</p><p className="text-xs text-gray-500">Maintenance Due</p></div></div></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Route Occupancy</h3>
        <div className="space-y-3">
          {(routes || []).map((route: any) => (
            <div key={route.name} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center"><MapPin className="w-4 h-4 text-indigo-600" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-gray-900">{route.name}</span><span className="text-sm text-gray-600">{route.students} students | {route.stops} stops</span></div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className={cn('h-full rounded-full', route.occupancy > 90 ? 'bg-red-500' : route.occupancy > 75 ? 'bg-yellow-500' : 'bg-green-500')} style={{ width: `${route.occupancy}%` }} /></div>
              </div>
              <span className="text-sm font-medium text-gray-600 w-12 text-right">{route.occupancy}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Vehicle Distribution</h3><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={vehicleTypes || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count">{(vehicleTypes || []).map((_: any, i: number) => <Cell key={i} fill={['#6366f1', '#8b5cf6', '#a855f7'][i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Fuel Expenses</h3><ResponsiveContainer width="100%" height={250}><BarChart data={fuelExpenses || []}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Building, Users, Wrench, DollarSign, BedDouble, Download } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn, formatCurrency, formatNumber, exportToCSV } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { StatsSkeleton } from '@/components/LoadingSkeleton'

export function HostelAnalytics() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const { data: stats, loading } = useApi('/analytics/hostel/stats', [fromDate, toDate])
  const { data: hostelWise } = useApi('/analytics/hostel/hostel-wise')
  const { data: roomTypes } = useApi('/analytics/hostel/room-types')
  const { data: maintenanceTrend } = useApi('/analytics/hostel/maintenance-trend')
  const s = stats || { totalCapacity: 0, occupied: 0, vacant: 0, occupancyRate: 0, maintenanceRequests: 0, feeCollected: 0 }

  if (loading) {
    return <StatsSkeleton count={4} />
  }

  const handleExportCSV = () => {
    if (hostelWise && hostelWise.length > 0) {
      exportToCSV(hostelWise, 'hostel-analytics')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hostel Analytics</h1>
          <p className="text-sm text-gray-500">Hostel occupancy, maintenance, and fee collection</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter fromDate={fromDate} toDate={toDate} onFromDateChange={setFromDate} onToDateChange={setToDate} />
          <button onClick={handleExportCSV} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><BedDouble className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-gray-900">{formatNumber(s.totalCapacity)}</p><p className="text-xs text-gray-500">Total Capacity</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Users className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold text-green-600">{formatNumber(s.occupied)}</p><p className="text-xs text-gray-500">Occupied</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><Wrench className="w-5 h-5 text-orange-600" /></div><div><p className="text-2xl font-bold text-orange-600">{s.maintenanceRequests}</p><p className="text-xs text-gray-500">Maintenance</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><DollarSign className="w-5 h-5 text-purple-600" /></div><div><p className="text-2xl font-bold text-purple-600">{formatCurrency(s.feeCollected)}</p><p className="text-xs text-gray-500">Fee Collected</p></div></div></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Hostel Occupancy</h3>
        <div className="space-y-4">
          {(hostelWise || []).map((hostel: any) => {
            const pct = hostel.capacity > 0 ? Math.round((hostel.occupied / hostel.capacity) * 100) : 0
            return (
              <div key={hostel.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2"><span className="text-sm font-medium text-gray-900">{hostel.name}</span><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', hostel.type === 'BOYS' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700')}>{hostel.type}</span></div>
                  <span className="text-sm text-gray-600">{hostel.occupied}/{hostel.capacity} ({pct}%)</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className={cn('h-full rounded-full', pct > 95 ? 'bg-red-500' : pct > 85 ? 'bg-yellow-500' : 'bg-green-500')} style={{ width: `${pct}%` }} /></div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Room Type Distribution</h3><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={roomTypes || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count">{(roomTypes || []).map((_: any, i: number) => <Cell key={i} fill={['#6366f1', '#8b5cf6', '#a855f7', '#d946ef'][i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Maintenance Requests Trend</h3><ResponsiveContainer width="100%" height={250}><BarChart data={maintenanceTrend || []}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="requests" fill="#f59e0b" name="Requests" radius={[4, 4, 0, 0]} /><Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </div>
    </div>
  )
}

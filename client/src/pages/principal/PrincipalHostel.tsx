import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw, Home, Users, BedDouble, Building2, User, AlertCircle,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function PrincipalHostel() {
  const { data, loading, error, refetch } = useApi<any>('/principal/hostel')

  const hostels = data?.hostels || []
  const totalCapacity = data?.totalCapacity || 0
  const totalOccupied = data?.totalOccupied || 0
  const overallOccupancyRate = data?.overallOccupancyRate || 0

  const occupancyPieData = [
    { name: 'Occupied', value: totalOccupied },
    { name: 'Vacant', value: Math.max(0, totalCapacity - totalOccupied) },
  ].filter((item) => item.value > 0)

  function getOccupancyColor(rate: number) {
    if (rate < 50) return { bar: 'bg-green-500', text: 'text-green-400', bg: 'bg-green-900/30' }
    if (rate <= 80) return { bar: 'bg-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-900/30' }
    return { bar: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-900/30' }
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
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-slate-400 text-sm">{error}</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4" />Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hostel Management</h1>
          <p className="text-slate-400 text-sm">Overview of hostels, occupancy & room details</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center">
              <BedDouble className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{totalCapacity}</p>
              <p className="text-xs text-slate-500">Total Capacity</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{totalOccupied}</p>
              <p className="text-xs text-slate-500">Occupied</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              getOccupancyColor(overallOccupancyRate).bg
            )}>
              <Home className={cn('w-5 h-5', getOccupancyColor(overallOccupancyRate).text)} />
            </div>
            <div>
              <p className={cn('text-2xl font-bold', getOccupancyColor(overallOccupancyRate).text)}>
                {overallOccupancyRate}%
              </p>
              <p className="text-xs text-slate-500">Occupancy Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-900/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-400">{hostels.length}</p>
              <p className="text-xs text-slate-500">Total Hostels</p>
            </div>
          </div>
        </div>
      </div>

      {occupancyPieData.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Overall Occupancy</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={occupancyPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {occupancyPieData.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc' }}
              />
              <Legend
                wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
                formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hostels.length === 0 && (
          <div className="col-span-full bg-slate-800 rounded-xl border border-slate-700 p-12 text-center text-slate-500">
            No hostels found
          </div>
        )}
        {hostels.map((hostel: any) => {
          const colors = getOccupancyColor(hostel.occupancyRate)
          const roomTypes = (hostel.rooms || []).reduce(
            (acc: Record<string, { total: number; occupied: number }>, room: any) => {
              const t = room.type || 'Standard'
              if (!acc[t]) acc[t] = { total: 0, occupied: 0 }
              acc[t].total += 1
              acc[t].occupied += room.occupied || 0
              return acc
            },
            {}
          )

          return (
            <div key={hostel.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{hostel.name}</h3>
                  <p className="text-xs text-slate-500">{hostel.type}</p>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  colors.bg, colors.text
                )}>
                  {hostel.occupancyRate}%
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <User className="w-4 h-4 text-slate-500" />
                <span>Warden: {hostel.warden?.user?.fullName || 'N/A'}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{hostel.occupied} / {hostel.capacity} occupied</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', colors.bar)}
                    style={{ width: `${Math.min(hostel.occupancyRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="border-t border-slate-700 pt-3 space-y-2">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Room Breakdown</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(roomTypes).map(([type, info]) => (
                    <div key={type} className="bg-slate-700/50 rounded-lg p-2">
                      <p className="text-xs font-medium text-slate-300">{type}</p>
                      <p className="text-xs text-slate-500">
                        {(info as any).total} rooms, {(info as any).occupied} occupied
                      </p>
                    </div>
                  ))}
                  {Object.keys(roomTypes).length === 0 && (
                    <p className="text-xs text-slate-500 col-span-2">No room data</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

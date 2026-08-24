import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw, Home, Users, BedDouble, Building2, User
} from 'lucide-react'

export function PrincipalHostel() {
  const { data, loading, error, refetch } = useApi<any>('/principal/hostel')

  const hostels = data?.hostels || []
  const totalCapacity = data?.totalCapacity || 0
  const totalOccupied = data?.totalOccupied || 0
  const overallOccupancyRate = data?.overallOccupancyRate || 0

  function getOccupancyColor(rate: number) {
    if (rate < 50) return { bar: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' }
    if (rate <= 80) return { bar: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50' }
    return { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hostel Management</h1>
          <p className="text-gray-500 text-sm">Overview of hostels, occupancy & room details</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          Failed to load hostel data. Please try again.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BedDouble className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{totalCapacity}</p>
              <p className="text-xs text-gray-500">Total Capacity</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{totalOccupied}</p>
              <p className="text-xs text-gray-500">Occupied</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
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
              <p className="text-xs text-gray-500">Occupancy Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-700">{hostels.length}</p>
              <p className="text-xs text-gray-500">Total Hostels</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hostels.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
            No hostels found
          </div>
        )}
        {hostels.map((hostel: any) => {
          const colors = getOccupancyColor(hostel.occupancyRate)
          const roomTypes = (hostel.rooms || []).reduce((acc: Record<string, { total: number; occupied: number }>, room: any) => {
            const t = room.type || 'Standard'
            if (!acc[t]) acc[t] = { total: 0, occupied: 0 }
            acc[t].total += 1
            acc[t].occupied += room.occupied || 0
            return acc
          }, {})

          return (
            <div key={hostel.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{hostel.name}</h3>
                  <p className="text-xs text-gray-500">{hostel.type}</p>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  colors.bg, colors.text
                )}>
                  {hostel.occupancyRate}%
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                <span>Warden: {hostel.warden?.user?.fullName || 'N/A'}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{hostel.occupied} / {hostel.capacity} occupied</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', colors.bar)}
                    style={{ width: `${Math.min(hostel.occupancyRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Room Breakdown</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(roomTypes).map(([type, info]) => (
                    <div key={type} className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs font-medium text-gray-700">{type}</p>
                      <p className="text-xs text-gray-500">
                        {(info as any).total} rooms, {(info as any).occupied} occupied
                      </p>
                    </div>
                  ))}
                  {Object.keys(roomTypes).length === 0 && (
                    <p className="text-xs text-gray-400 col-span-2">No room data</p>
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

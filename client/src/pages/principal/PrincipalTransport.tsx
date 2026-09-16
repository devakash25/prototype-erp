import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw, Bus, Route, Users, MapPin, Car, User, AlertCircle,
} from 'lucide-react'

export function PrincipalTransport() {
  const { data, loading, error, refetch } = useApi<any>('/principal/transport')

  const totalVehicles = data?.totalVehicles || 0
  const activeVehicles = data?.activeVehicles || 0
  const totalRoutes = data?.totalRoutes || 0
  const activeRoutes = data?.activeRoutes || 0
  const studentCoverage = data?.studentCoverage || 0
  const vehicles = data?.vehicles || []
  const routes = data?.routes || []

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
            <h1 className="text-2xl font-bold text-white">Transport Management</h1>
            <p className="text-slate-400 text-sm">Vehicles, routes & student coverage</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">Failed to load transport data</p>
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
          <h1 className="text-2xl font-bold text-white">Transport Management</h1>
          <p className="text-slate-400 text-sm">Vehicles, routes & student coverage</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900/50 flex items-center justify-center">
              <Bus className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{totalVehicles}</p>
              <p className="text-xs text-slate-400">Total Vehicles</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-900/50 flex items-center justify-center">
              <Car className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{activeVehicles}</p>
              <p className="text-xs text-slate-400">Active Vehicles</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-900/50 flex items-center justify-center">
              <Route className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{totalRoutes}</p>
              <p className="text-xs text-slate-400">Total Routes</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-900/50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-400">{activeRoutes}</p>
              <p className="text-xs text-slate-400">Active Routes</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-900/50 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{studentCoverage}</p>
              <p className="text-xs text-slate-400">Student Coverage</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700">
          <div className="p-5 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Vehicles</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-400">Reg. Number</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-400">Type</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-400">Capacity</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-400">Driver</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-400">Routes</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No vehicles found
                    </td>
                  </tr>
                )}
                {vehicles.map((v: any) => (
                  <tr key={v.id} className="border-b border-slate-700/50 hover:bg-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">{v.registrationNumber}</td>
                    <td className="py-3 px-4 text-slate-300">{v.type}</td>
                    <td className="py-3 px-4 text-center text-slate-300">{v.capacity}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-300">{v.driver?.user?.fullName || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(v.routes || []).map((vr: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-indigo-900/50 text-indigo-300 rounded text-xs">
                            {vr.route?.name} ({vr.shift})
                          </span>
                        ))}
                        {(!v.routes || v.routes.length === 0) && (
                          <span className="text-xs text-slate-500">Unassigned</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700">
          <div className="p-5 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Routes</h2>
          </div>
          <div className="p-4 space-y-3">
            {routes.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">No routes found</p>
            )}
            {routes.map((route: any) => (
              <div key={route.id} className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{route.name}</p>
                    <p className="text-xs text-slate-400">Code: {route.code}</p>
                    {route.description && (
                      <p className="text-xs text-slate-400 mt-1">{route.description}</p>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{route.studentCount || 0} students
                    </span>
                    <span className="flex items-center gap-1">
                      <Bus className="w-3 h-3" />{route.vehicleCount || 0} vehicles
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

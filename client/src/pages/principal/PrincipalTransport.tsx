import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw, Bus, Route, Users, MapPin, Car, User
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transport Management</h1>
          <p className="text-gray-500 text-sm">Vehicles, routes & student coverage</p>
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
          Failed to load transport data. Please try again.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Bus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{totalVehicles}</p>
              <p className="text-xs text-gray-500">Total Vehicles</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Car className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{activeVehicles}</p>
              <p className="text-xs text-gray-500">Active Vehicles</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Route className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{totalRoutes}</p>
              <p className="text-xs text-gray-500">Total Routes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-700">{activeRoutes}</p>
              <p className="text-xs text-gray-500">Active Routes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{studentCoverage}</p>
              <p className="text-xs text-gray-500">Student Coverage</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Vehicles</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Reg. Number</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Capacity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Driver</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Routes</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      No vehicles found
                    </td>
                  </tr>
                )}
                {vehicles.map((v: any) => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{v.registrationNumber}</td>
                    <td className="py-3 px-4 text-gray-700">{v.type}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{v.capacity}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{v.driver?.user?.fullName || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(v.routes || []).map((vr: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                            {vr.route?.name} ({vr.shift})
                          </span>
                        ))}
                        {(!v.routes || v.routes.length === 0) && (
                          <span className="text-xs text-gray-400">Unassigned</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Routes</h2>
          </div>
          <div className="p-4 space-y-3">
            {routes.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No routes found</p>
            )}
            {routes.map((route: any) => (
              <div key={route.id} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{route.name}</p>
                    <p className="text-xs text-gray-500">Code: {route.code}</p>
                    {route.description && (
                      <p className="text-xs text-gray-500 mt-1">{route.description}</p>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500">
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

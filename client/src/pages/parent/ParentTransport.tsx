import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import {
  RefreshCw,
  Bus,
  Route,
  MapPin,
  User,
  Phone,
  CreditCard,
  AlertCircle,
  Loader2,
  Truck,
  Users,
  CheckCircle2,
} from 'lucide-react'

export function ParentTransport() {
  const [searchParams] = useSearchParams()
  const childId = searchParams.get('childId') || ''

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-transport', childId],
    queryFn: async () => {
      const res = await api.get(`/parent/transport?childId=${childId}`)
      return res.data?.data ?? res.data
    },
    enabled: !!childId,
  })

  const route = data?.route || {}
  const vehicle = data?.vehicle || {}
  const driver = data?.driver || {}
  const stops = data?.stops || []
  const fee = data?.fee || {}

  if (!childId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-gray-400">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg">Select a child to view transport details</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-400">Failed to load transport data</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!data?.assigned && !route.name) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transport Details</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Child's transport route information</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Bus className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-lg text-gray-500 dark:text-gray-400">Transport not assigned</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Contact administration for transport registration</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transport Details</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Child's transport route information</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Route Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-900/30 rounded-lg">
            <Route className="h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Route Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Route className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Route Name</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{route.name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Route Code</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{route.code || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <Truck className="h-5 w-5 text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Vehicle Information</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 py-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Bus className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle Number</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{vehicle.number || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Truck className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Model</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{vehicle.model || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Capacity</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{vehicle.capacity || '—'} seats</p>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-900/30 rounded-lg">
              <User className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Driver Information</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 py-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Driver Name</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{driver.name || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Contact Number</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{driver.phone || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pickup/Drop Stops */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-900/30 rounded-lg">
            <MapPin className="h-5 w-5 text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Stops</h2>
        </div>
        {stops.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No stop information available</p>
        ) : (
          <div className="space-y-3">
            {stops.map((stop: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 text-sm font-bold shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{stop.name}</p>
                  {stop.time && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Time: {stop.time}</p>
                  )}
                </div>
                {stop.type && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    stop.type === 'PICKUP' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {stop.type}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transport Fee Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyan-900/30 rounded-lg">
            <CreditCard className="h-5 w-5 text-cyan-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transport Fee Status</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Fee</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{(fee.total ?? 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{(fee.paid ?? 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pending</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{(fee.pending ?? 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
        {fee.status && (
          <div className="mt-4 flex items-center gap-2 justify-center">
            <CheckCircle2 className={`h-4 w-4 ${fee.status === 'PAID' ? 'text-green-500' : 'text-yellow-500'}`} />
            <span className={`text-sm font-medium ${fee.status === 'PAID' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
              Status: {fee.status}
            </span>
          </div>
        )}
      </div>

      {/* Route Map Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-900/30 rounded-lg">
            <MapPin className="h-5 w-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Route Map</h2>
        </div>
        <div className="h-64 rounded-lg bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center border border-dashed border-gray-300 dark:border-gray-600">
          <MapPin className="h-10 w-10 text-gray-300 dark:text-gray-500 mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Route map coming soon</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Track your child's bus in real-time</p>
        </div>
      </div>
    </div>
  )
}

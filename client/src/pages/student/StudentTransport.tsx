import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, Bus, Route, MapPin, User } from 'lucide-react'

export function StudentTransport() {
  const { data: profile, loading, error, refetch } = useApi<any>('/student/profile')

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
        <p className="text-red-500">{error}</p>
        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
          Retry
        </button>
      </div>
    )
  }

  const p = profile || {}
  const usesTransport = p.academic?.usesTransport
  const transport = p.transport || {}

  if (!usesTransport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transport Details</h1>
            <p className="text-gray-500 text-sm">Your transport route information</p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Bus className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg text-gray-500">You do not use transport</p>
          <p className="text-sm text-gray-400 mt-1">Contact administration for transport registration</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transport Details</h1>
          <p className="text-gray-500 text-sm">Your transport route information</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Transport Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Bus className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Transport Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Route className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Route Name</p>
              <p className="text-sm font-medium text-gray-900">{transport.name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Route Code</p>
              <p className="text-sm font-medium text-gray-900">{transport.code || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 rounded-lg">
            <User className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Passenger Details</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Student Name</p>
              <p className="text-sm font-medium text-gray-900">{p.personal?.fullName || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Transport Status</p>
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

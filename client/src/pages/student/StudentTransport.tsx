import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, Bus, Route, MapPin, User, AlertCircle } from 'lucide-react'

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
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-400">{error}</p>
        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button>
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
            <h1 className="text-2xl font-bold text-white">Transport Details</h1>
            <p className="text-slate-400 text-sm">Your transport route information</p>
          </div>
          <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </button>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <Bus className="h-12 w-12 mx-auto mb-3 text-slate-600" />
          <p className="text-lg text-slate-400">You do not use transport</p>
          <p className="text-sm text-slate-500 mt-1">Contact administration for transport registration</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transport Details</h1>
          <p className="text-slate-400 text-sm">Your transport route information</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Bus className="h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Transport Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-slate-700 rounded-lg">
              <Route className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Route Name</p>
              <p className="text-sm font-medium text-white">{transport.name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-slate-700 rounded-lg">
              <MapPin className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Route Code</p>
              <p className="text-sm font-medium text-white">{transport.code || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <User className="h-5 w-5 text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Passenger Details</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-slate-700 rounded-lg">
              <User className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Student Name</p>
              <p className="text-sm font-medium text-white">{p.personal?.name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-slate-700 rounded-lg">
              <MapPin className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Transport Status</p>
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

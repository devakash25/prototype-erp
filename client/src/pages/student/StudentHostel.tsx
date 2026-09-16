import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, Home, User, Hash, Building2, BedDouble, AlertCircle } from 'lucide-react'

export function StudentHostel() {
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
  const isHostelStudent = p.academic?.isHostelStudent
  const hostel = p.hostel || {}

  if (!isHostelStudent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Hostel Details</h1>
            <p className="text-slate-400 text-sm">Your hostel accommodation information</p>
          </div>
          <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </button>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <Home className="h-12 w-12 mx-auto mb-3 text-slate-600" />
          <p className="text-lg text-slate-400">You are not a hostel resident</p>
          <p className="text-sm text-slate-500 mt-1">Contact administration for hostel allotment</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hostel Details</h1>
          <p className="text-slate-400 text-sm">Your hostel accommodation information</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Home className="h-5 w-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Hostel Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-slate-700 rounded-lg">
              <Building2 className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Hostel Name</p>
              <p className="text-sm font-medium text-white">{hostel.name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-slate-700 rounded-lg">
              <Hash className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Hostel Code</p>
              <p className="text-sm font-medium text-white">{hostel.code || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <BedDouble className="h-5 w-5 text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Resident Details</h2>
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
              <Hash className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Room Number</p>
              <p className="text-sm font-medium text-white">{p.hostel?.roomNumber || '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, Home, User, Hash, Building2, BedDouble } from 'lucide-react'

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
        <p className="text-red-500">{error}</p>
        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
          Retry
        </button>
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
            <h1 className="text-2xl font-bold text-gray-900">Hostel Details</h1>
            <p className="text-gray-500 text-sm">Your hostel accommodation information</p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Home className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg text-gray-500">You are not a hostel resident</p>
          <p className="text-sm text-gray-400 mt-1">Contact administration for hostel allotment</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hostel Details</h1>
          <p className="text-gray-500 text-sm">Your hostel accommodation information</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Hostel Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Home className="h-5 w-5 text-indigo-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Hostel Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Building2 className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Hostel Name</p>
              <p className="text-sm font-medium text-gray-900">{hostel.name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Hash className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Hostel Code</p>
              <p className="text-sm font-medium text-gray-900">{hostel.code || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resident Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 rounded-lg">
            <BedDouble className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Resident Details</h2>
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
              <Hash className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Room Number</p>
              <p className="text-sm font-medium text-gray-900">{p.personal?.roomNumber || '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

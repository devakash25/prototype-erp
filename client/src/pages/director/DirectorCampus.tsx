import { useState, useEffect } from 'react'
import { RefreshCw, Building2, Bus, Library } from 'lucide-react'
import api from '@/services/api'

export function DirectorCampus() {
  const [campus, setCampus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCampus() }, [])

  const loadCampus = async () => {
    setLoading(true)
    try {
      const res = await api.get('/director/campus')
      setCampus(res.data.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campus Services</h1>
          <p className="text-gray-500 text-sm mt-1">Hostel, Transport & Library overview (View Only)</p>
        </div>
        <button onClick={loadCampus} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hostel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Hostel</h2>
              <p className="text-xs text-gray-500">Accommodation services</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-100">
              <p className="text-3xl font-bold text-purple-700">{campus?.hostel?.rate || 0}%</p>
              <p className="text-sm text-purple-600 mt-1">Occupancy Rate</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Capacity</span>
                <span className="font-medium text-gray-900">{campus?.hostel?.total || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Occupied</span>
                <span className="font-medium text-gray-900">{campus?.hostel?.occupied || 0}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-purple-500" style={{ width: `${campus?.hostel?.rate || 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Transport */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Bus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Transport</h2>
              <p className="text-xs text-gray-500">Fleet management</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100">
                <p className="text-3xl font-bold text-green-700">{campus?.transport?.vehicles || 0}</p>
                <p className="text-sm text-green-600 mt-1">Vehicles</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-3xl font-bold text-blue-700">{campus?.transport?.students || 0}</p>
                <p className="text-sm text-blue-600 mt-1">Students</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600">
                {campus?.transport?.vehicles > 0
                  ? `${Math.round((campus.transport.students / campus.transport.vehicles))} students per vehicle avg`
                  : 'No vehicles configured'}
              </p>
            </div>
          </div>
        </div>

        {/* Library */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Library className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Library</h2>
              <p className="text-xs text-gray-500">Resource management</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-3xl font-bold text-blue-700">{campus?.library?.total || 0}</p>
                <p className="text-sm text-blue-600 mt-1">Total Books</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-3xl font-bold text-amber-700">{campus?.library?.issued || 0}</p>
                <p className="text-sm text-amber-600 mt-1">Issued</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600">
                {campus?.library?.total > 0
                  ? `${Math.round((campus.library.issued / campus.library.total) * 100)}% books currently on loan`
                  : 'No books in library'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Campus services are displayed in read-only mode for the Director. Configuration of hostel, transport, and library is managed by the Chief Head and respective wardens/managers.
        </p>
      </div>
    </div>
  )
}

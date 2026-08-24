import { useState, useEffect } from 'react'
import { RefreshCw, Users, Clock, Briefcase } from 'lucide-react'
import api from '@/services/api'

export function DirectorHR() {
  const [hr, setHr] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadHR() }, [])

  const loadHR = async () => {
    setLoading(true)
    try {
      const res = await api.get('/director/hr')
      setHr(res.data.data)
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
          <h1 className="text-2xl font-bold text-gray-900">HR Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Staff strength, leave management & workforce analytics</p>
        </div>
        <button onClick={loadHR} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-blue-700">{hr?.teaching || 0}</p><p className="text-xs text-gray-500">Teaching Staff</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><Briefcase className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold text-purple-700">{hr?.nonTeaching || 0}</p><p className="text-xs text-gray-500">Non-Teaching Staff</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center"><Clock className="w-5 h-5 text-orange-600" /></div>
            <div><p className="text-2xl font-bold text-orange-600">{hr?.pendingLeaves || 0}</p><p className="text-xs text-gray-500">Pending Leaves</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><Users className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-green-700">{hr?.activeEmployees || 0}</p><p className="text-xs text-gray-500">Total Active</p></div>
          </div>
        </div>
      </div>

      {/* Staff Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Distribution</h2>
        <div className="space-y-4">
          {[
            { label: 'Teaching Staff', count: hr?.teaching || 0, total: hr?.activeEmployees || 1, color: 'bg-blue-500' },
            { label: 'Non-Teaching Staff', count: hr?.nonTeaching || 0, total: hr?.activeEmployees || 1, color: 'bg-purple-500' },
          ].map((item, i) => {
            const pct = Math.round((item.count / item.total) * 100)
            return (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium">{item.count} ({pct}%)</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> HR management includes creating HODs and Teachers. Pending leave requests require Director approval. Full HR configuration is managed by the Chief Head.
        </p>
      </div>
    </div>
  )
}

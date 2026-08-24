import { useState, useEffect } from 'react'
import { RefreshCw, School, TrendingUp, Users, ArrowRight } from 'lucide-react'
import api from '@/services/api'

export function DirectorAdmissions() {
  const [admissions, setAdmissions] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAdmissions() }, [])

  const loadAdmissions = async () => {
    setLoading(true)
    try {
      const res = await api.get('/director/admissions')
      setAdmissions(res.data.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  }

  const statusColors: Record<string, string> = {
    APPLIED: 'bg-blue-100 text-blue-800',
    SHORTLISTED: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    ENROLLED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-red-100 text-red-800',
    WAITLISTED: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admissions Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Admission pipeline, conversion rates & trends</p>
        </div>
        <button onClick={loadAdmissions} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><School className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-blue-700">{admissions?.total || 0}</p><p className="text-xs text-gray-500">Total Applications</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-green-700">{admissions?.conversionRate || 0}%</p><p className="text-xs text-gray-500">Conversion Rate</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><Users className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold text-purple-700">{admissions?.pipeline?.ENROLLED || 0}</p><p className="text-xs text-gray-500">Enrolled Students</p></div>
          </div>
        </div>
      </div>

      {/* Pipeline Funnel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Admission Pipeline</h2>
        <div className="space-y-4">
          {Object.entries(admissions?.pipeline || {}).map(([status, count]: [string, any]) => {
            const max = Math.max(...Object.values(admissions?.pipeline || {}).map(Number))
            const pct = max > 0 ? (count / max) * 100 : 0
            return (
              <div key={status}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm text-gray-700 w-28">{status}</span>
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-end pr-3 transition-all"
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    >
                      <span className="text-xs font-medium text-white">{count}</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">{Math.round(pct)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Monthly Trend */}
      {admissions?.monthlyTrend?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h2>
          <div className="flex items-end gap-3 h-48">
            {admissions.monthlyTrend.map((item: any, i: number) => {
              const max = Math.max(...admissions.monthlyTrend.map((m: any) => m.count))
              const height = max > 0 ? (item.count / max) * 100 : 0
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-gray-700">{item.count}</span>
                  <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '120px' }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-blue-400"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{item.month}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

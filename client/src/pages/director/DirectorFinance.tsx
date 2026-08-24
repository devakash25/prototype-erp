import { useState, useEffect } from 'react'
import { RefreshCw, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import api from '@/services/api'

export function DirectorFinance() {
  const [finance, setFinance] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadFinance() }, [])

  const loadFinance = async () => {
    setLoading(true)
    try {
      const res = await api.get('/director/finance')
      setFinance(res.data.data)
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
          <h1 className="text-2xl font-bold text-gray-900">Finance Summary</h1>
          <p className="text-gray-500 text-sm mt-1">Fee collection overview & outstanding dues (View Only)</p>
        </div>
        <button onClick={loadFinance} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
            <div><p className="text-2xl font-bold">{formatCurrency(finance?.monthRevenue || 0)}</p><p className="text-xs text-green-100">Month Revenue</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-blue-700">{formatCurrency(finance?.todayRevenue || 0)}</p><p className="text-xs text-gray-500">Today's Collection</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-2xl font-bold text-red-600">{formatCurrency(finance?.outstanding || 0)}</p><p className="text-xs text-gray-500">Outstanding Dues</p></div>
          </div>
        </div>
      </div>

      {/* Collection Rate */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fee Collection Rate</h2>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="85" fill="none" stroke="#e5e7eb" strokeWidth="12" />
              <circle cx="100" cy="100" r="85" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray={`${(finance?.feeCollectionRate || 0) * 5.34} 534`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{finance?.feeCollectionRate || 0}%</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">Collected: {formatCurrency((finance?.monthRevenue || 0) + (finance?.todayRevenue || 0))}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">Outstanding: {formatCurrency(finance?.outstanding || 0)}</span>
            </div>
            <p className="text-xs text-gray-500">Director view only - cannot modify fee structure</p>
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a read-only financial overview. Fee structure configuration, payment gateway settings, and transaction management are accessible only to the Chief Head.
        </p>
      </div>
    </div>
  )
}

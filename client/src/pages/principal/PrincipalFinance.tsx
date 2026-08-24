import { useState, useEffect } from 'react'
import { RefreshCw, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import api from '@/services/api'

export function PrincipalFinance() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { loadData() }, [])
  const loadData = async () => { setLoading(true); try { const r = await api.get('/principal/finance'); setData(r.data.data) } catch(e) { console.error(e) } setLoading(false) }
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Finance (Operational View)</h1><p className="text-gray-500 text-sm">Fee collection status & outstanding dues (read-only)</p></div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div><div><p className="text-2xl font-bold">{formatCurrency(data?.monthRevenue || 0)}</p><p className="text-xs text-green-100">Month Collection</p></div></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><DollarSign className="w-5 h-5 text-red-600" /></div><div><p className="text-2xl font-bold text-red-600">{formatCurrency(data?.outstandingDues || 0)}</p><p className="text-xs text-gray-500">Outstanding Dues</p></div></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><DollarSign className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-blue-700">{data?.feeCollectionRate || 0}%</p><p className="text-xs text-gray-500">Collection Rate</p></div></div>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4"><p className="text-sm text-blue-800"><strong>Note:</strong> Principal has operational view only. Fee structure configuration and financial transaction management are handled by the Chief Head.</p></div>
    </div>
  )
}

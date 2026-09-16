import { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle, UserPlus, CheckCircle, Clock, XCircle } from 'lucide-react'
import api from '@/services/api'

export function PrincipalAdmissions() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { loadData() }, [])
  const loadData = async () => { setLoading(true); setError(null); try { const r = await api.get('/principal/admissions'); setData(r.data.data) } catch(e: any) { setError(e.message || 'Failed to load') } setLoading(false) }
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-4"><AlertCircle className="h-12 w-12 text-red-500" /><p className="text-lg text-slate-400">{error}</p><button onClick={loadData} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button></div>
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Admissions</h1><p className="text-slate-400 text-sm">Admission pipeline & approval status</p></div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 hover:bg-slate-700"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Applied', value: data?.applied || 0, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Under Review', value: data?.underReview || 0, color: 'text-yellow-400 bg-yellow-500/10' },
          { label: 'Approved', value: data?.approved || 0, color: 'text-green-400 bg-green-500/10' },
          { label: 'Enrolled', value: data?.enrolled || 0, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Rejected', value: data?.rejected || 0, color: 'text-red-400 bg-red-500/10' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5 text-center">
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Pipeline</h2>
        <div className="space-y-3">
          {[
            { label: 'Applied', value: data?.applied || 0, total: data?.total || 1 },
            { label: 'Under Review', value: data?.underReview || 0, total: data?.total || 1 },
            { label: 'Approved', value: data?.approved || 0, total: data?.total || 1 },
            { label: 'Enrolled', value: data?.enrolled || 0, total: data?.total || 1 },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">{item.label}</span><span className="font-medium text-white">{item.value}</span></div>
              <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.max((item.value / item.total) * 100, 5)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

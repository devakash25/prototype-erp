import { useState, useEffect } from 'react'
import { RefreshCw, UserPlus, CheckCircle, Clock, XCircle } from 'lucide-react'
import api from '@/services/api'

export function PrincipalAdmissions() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { loadData() }, [])
  const loadData = async () => { setLoading(true); try { const r = await api.get('/principal/admissions'); setData(r.data.data) } catch(e) { console.error(e) } setLoading(false) }
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Admissions</h1><p className="text-gray-500 text-sm">Admission pipeline & approval status</p></div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Applied', value: data?.applied || 0, color: 'blue' },
          { label: 'Under Review', value: data?.underReview || 0, color: 'yellow' },
          { label: 'Approved', value: data?.approved || 0, color: 'green' },
          { label: 'Enrolled', value: data?.enrolled || 0, color: 'emerald' },
          { label: 'Rejected', value: data?.rejected || 0, color: 'red' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className={`text-3xl font-bold text-${s.color}-600`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline</h2>
        <div className="space-y-3">
          {[
            { label: 'Applied', value: data?.applied || 0, total: data?.total || 1 },
            { label: 'Under Review', value: data?.underReview || 0, total: data?.total || 1 },
            { label: 'Approved', value: data?.approved || 0, total: data?.total || 1 },
            { label: 'Enrolled', value: data?.enrolled || 0, total: data?.total || 1 },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{item.label}</span><span className="font-medium">{item.value}</span></div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.max((item.value / item.total) * 100, 5)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { RefreshCw, Award, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import api from '@/services/api'

export function PrincipalExaminations() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { loadData() }, [])
  const loadData = async () => { setLoading(true); try { const r = await api.get('/principal/examinations'); setData(r.data.data) } catch(e) { console.error(e) } setLoading(false) }
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Examination Dashboard</h1><p className="text-gray-500 text-sm">Exam execution, results & evaluation progress</p></div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Award className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-blue-700">{data?.active || 0}</p><p className="text-xs text-gray-500">Active Exams</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center"><Clock className="w-5 h-5 text-yellow-600" /></div><div><p className="text-2xl font-bold text-yellow-700">{data?.upcoming || 0}</p><p className="text-xs text-gray-500">Upcoming</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold text-green-700">{data?.passRate || 0}%</p><p className="text-xs text-gray-500">Pass Rate</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-orange-600" /></div><div><p className="text-2xl font-bold text-orange-700">{data?.pendingResults || 0}</p><p className="text-xs text-gray-500">Pending Results</p></div></div></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Exam Overview</h2>
        <div className="space-y-4">
          {[
            { label: 'Active Exams', value: data?.active || 0, color: 'bg-blue-500' },
            { label: 'Completed Exams', value: data?.completed || 0, color: 'bg-green-500' },
            { label: 'Upcoming Exams', value: data?.upcoming || 0, color: 'bg-yellow-500' },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{item.label}</span><span className="font-medium">{item.value}</span></div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.min((item.value / Math.max(data?.completed || 1, 1)) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

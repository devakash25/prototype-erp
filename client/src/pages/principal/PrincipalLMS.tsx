import { useState, useEffect } from 'react'
import { RefreshCw, BookOpenCheck, FileText, CheckCircle } from 'lucide-react'
import api from '@/services/api'

export function PrincipalLMS() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { loadData() }, [])
  const loadData = async () => { setLoading(true); try { const r = await api.get('/principal/lms'); setData(r.data.data) } catch(e) { console.error(e) } setLoading(false) }
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Learning Management</h1><p className="text-gray-500 text-sm">Assignments, materials & evaluation progress</p></div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-blue-700">{data?.assignments || 0}</p><p className="text-xs text-gray-500">Assignments</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold text-green-700">{data?.submissions || 0}</p><p className="text-xs text-gray-500">Submissions</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><BookOpenCheck className="w-5 h-5 text-purple-600" /></div><div><p className="text-2xl font-bold text-purple-700">{data?.materials || 0}</p><p className="text-xs text-gray-500">Study Materials</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center"><FileText className="w-5 h-5 text-orange-600" /></div><div><p className="text-2xl font-bold text-orange-700">{data?.pendingEvaluation || 0}</p><p className="text-xs text-gray-500">Pending Evaluation</p></div></div></div>
      </div>
    </div>
  )
}

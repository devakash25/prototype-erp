import { useState, useEffect } from 'react'
import { RefreshCw, ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/services/api'

export function DirectorApprovals() {
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadWorkflow() }, [])

  const loadWorkflow = async () => {
    setLoading(true)
    try {
      const res = await api.get('/director/workflow')
      setWorkflow(res.data.data)
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
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">Review and approve pending workflows</p>
        </div>
        <button onClick={loadWorkflow} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div><p className="text-2xl font-bold text-yellow-600">{workflow?.pending || 0}</p><p className="text-xs text-gray-500">Pending</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-green-700">{workflow?.approved || 0}</p><p className="text-xs text-gray-500">Approved</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><XCircle className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-2xl font-bold text-red-600">{workflow?.rejected || 0}</p><p className="text-xs text-gray-500">Rejected</p></div>
          </div>
        </div>
      </div>

      {/* Pending by Type */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending by Type</h2>
        <div className="space-y-3">
          {(workflow?.byType || []).length === 0 && (
            <p className="text-sm text-gray-500">No pending approvals</p>
          )}
          {(workflow?.byType || []).map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.type?.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500">Requires your approval</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {item.count} pending
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

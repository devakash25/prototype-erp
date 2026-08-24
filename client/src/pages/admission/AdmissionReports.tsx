import { useState, useEffect } from 'react'
import { RefreshCw, FileText } from 'lucide-react'
import api from '@/services/api'

export function AdmissionReports() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admission/reports')
      setData(res.data.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admission Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Comprehensive admission statistics</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div>
      ) : (
        <>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <p className="text-indigo-100 text-sm">Total Applications</p>
            <p className="text-3xl font-bold mt-1">{data?.total || 0}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">By Status</h2>
              <div className="space-y-2">
                {(data?.byStatus || []).map((item: any) => (
                  <div key={item.status} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">{item.status}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{item._count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">By Source</h2>
              <div className="space-y-2">
                {(data?.bySource || []).map((item: any) => (
                  <div key={item.source} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">{item.source || 'Unknown'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{item._count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">By Category</h2>
              <div className="space-y-2">
                {(data?.byCategory || []).map((item: any) => (
                  <div key={item.category} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">{item.category || 'Unknown'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{item._count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">By Gender</h2>
              <div className="space-y-2">
                {(data?.byGender || []).map((item: any) => (
                  <div key={item.gender} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">{item.gender}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{item._count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdmissionReports

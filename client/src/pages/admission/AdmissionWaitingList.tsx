import { useState, useEffect } from 'react'
import { RefreshCw, AlertTriangle, Clock } from 'lucide-react'
import api from '@/services/api'
import { cn } from '@/lib/utils'

export function AdmissionWaitingList() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadList() }, [])

  const loadList = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admission/waiting-list')
      setList(res.data.data || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Waiting List</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">High and urgent priority applicants</p>
        </div>
        <button onClick={loadList} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div>
      ) : list.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No applicants on waiting list</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">App #</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Applied</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {list.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3 font-mono text-xs text-indigo-600">{app.applicationNumber}</td>
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{app.firstName} {app.lastName}</td>
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{app.course?.name || '-'}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium',
                      app.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700')}>
                      {app.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdmissionWaitingList

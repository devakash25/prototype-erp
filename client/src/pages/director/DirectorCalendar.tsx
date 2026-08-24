import { useState, useEffect } from 'react'
import { RefreshCw, Calendar } from 'lucide-react'
import api from '@/services/api'

export function DirectorCalendar() {
  const [calendar, setCalendar] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCalendar() }, [])

  const loadCalendar = async () => {
    setLoading(true)
    try {
      const res = await api.get('/director/activity?limit=30')
      setCalendar(res.data.data || [])
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
          <h1 className="text-2xl font-bold text-gray-900">Calendar & Activity</h1>
          <p className="text-gray-500 text-sm mt-1">Recent institutional activity timeline</p>
        </div>
        <button onClick={loadCalendar} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
        <div className="space-y-4">
          {calendar.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>No activity recorded</p>
            </div>
          )}
          {calendar.map((item: any) => (
            <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
              <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{item.action}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{item.entity}</span>
                  <span className="text-xs text-gray-400">&middot;</span>
                  <span className="text-xs text-gray-500">{item.user?.fullName}</span>
                  <span className="text-xs text-gray-400">&middot;</span>
                  <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

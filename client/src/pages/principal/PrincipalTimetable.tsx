import { useState, useEffect } from 'react'
import { RefreshCw, Clock } from 'lucide-react'
import api from '@/services/api'

export function PrincipalTimetable() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { loadData() }, [])
  const loadData = async () => { setLoading(true); try { const r = await api.get('/principal/timetable'); setData(r.data.data) } catch(e) { console.error(e) } setLoading(false) }
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Timetable</h1><p className="text-gray-500 text-sm">Today's class schedule & room utilization</p></div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule ({data?.totalEntries || 0} entries)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Class</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Subject</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Teacher</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Room</th>
            </tr></thead>
            <tbody>
              {(data?.entries || []).length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-500">No timetable entries for today</td></tr>}
              {(data?.entries || []).map((e: any, i: number) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">{e.startTime} - {e.endTime}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{e.className}</td>
                  <td className="py-3 px-4 text-gray-700">{e.subject?.name || '—'}</td>
                  <td className="py-3 px-4 text-gray-700">{e.employee?.user?.fullName || '—'}</td>
                  <td className="py-3 px-4 text-gray-700">{e.room || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/services/api'

export function PrincipalAttendance() {
  const [trend, setTrend] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { loadData() }, [])
  const loadData = async () => { setLoading(true); try { const r = await api.get('/principal/attendance-trend?days=14'); setTrend(r.data.data || []) } catch(e) { console.error(e) } setLoading(false) }
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  const avg = trend.length > 0 ? Math.round(trend.reduce((s, d) => s + d.rate, 0) / trend.length) : 0
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Attendance Dashboard</h1><p className="text-gray-500 text-sm">Student attendance monitoring & trends</p></div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-green-700">{avg}%</p><p className="text-xs text-gray-500">Average (14 days)</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-blue-700">{trend[trend.length - 1]?.rate || 0}%</p><p className="text-xs text-gray-500">Today</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-2xl font-bold text-red-700">{trend.filter(d => d.rate < 75).length}</p><p className="text-xs text-gray-500">Days Below 75%</p></div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend</h2>
        <div className="flex items-end gap-2 h-48">
          {trend.map((day: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-gray-700">{day.rate}%</span>
              <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '120px' }}>
                <div className={cn('absolute bottom-0 w-full rounded-t-lg', day.rate >= 75 ? 'bg-gradient-to-t from-green-500 to-emerald-400' : 'bg-gradient-to-t from-red-500 to-orange-400')} style={{ height: `${day.rate}%` }} />
              </div>
              <span className="text-[10px] text-gray-500">{day.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { RefreshCw, Star, TrendingUp } from 'lucide-react'
import api from '@/services/api'

export function PrincipalPerformance() {
  const [faculty, setFaculty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { loadData() }, [])
  const loadData = async () => { setLoading(true); try { const r = await api.get('/principal/faculty'); setFaculty(r.data.data) } catch(e) { console.error(e) } setLoading(false) }
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Faculty Performance</h1><p className="text-gray-500 text-sm">Performance scores & comparison across departments</p></div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Rankings</h2>
        <div className="space-y-3">
          {[...(faculty?.faculty || [])].sort((a: any, b: any) => b.performanceScore - a.performanceScore).map((f: any, i: number) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
              <span className="text-lg font-bold text-gray-400 w-6 text-center">{i + 1}</span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">{f.name.split(' ').map((n: string) => n[0]).join('')}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{f.name}</p>
                <p className="text-xs text-gray-500">{f.designation}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-indigo-600">{f.performanceScore}%</p>
                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${f.performanceScore}%` }} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

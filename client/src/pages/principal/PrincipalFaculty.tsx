import { useState, useEffect } from 'react'
import { RefreshCw, Users, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/services/api'

export function PrincipalFaculty() {
  const [faculty, setFaculty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { loadData() }, [])
  const loadData = async () => { setLoading(true); try { const r = await api.get('/principal/faculty'); setFaculty(r.data.data) } catch(e) { console.error(e) } setLoading(false) }
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Faculty Status</h1><p className="text-gray-500 text-sm">Daily faculty attendance & workload</p></div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-blue-700">{faculty?.total || 0}</p><p className="text-xs text-gray-500">Total Faculty</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold text-green-700">{faculty?.present || 0}</p><p className="text-xs text-gray-500">Present</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div><div><p className="text-2xl font-bold text-red-700">{faculty?.absent || 0}</p><p className="text-xs text-gray-500">Absent</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center"><Clock className="w-5 h-5 text-yellow-600" /></div><div><p className="text-2xl font-bold text-yellow-700">{faculty?.onLeave || 0}</p><p className="text-xs text-gray-500">On Leave</p></div></div></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Faculty</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Designation</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Today</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Classes</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Leaves</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Score</th>
            </tr></thead>
            <tbody>
              {(faculty?.faculty || []).map((f: any, i: number) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{f.name}</td>
                  <td className="py-3 px-4 text-gray-700">{f.designation}</td>
                  <td className="py-3 px-4 text-center"><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', f.todayStatus === 'PRESENT' ? 'bg-green-100 text-green-700' : f.todayStatus === 'ABSENT' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}>{f.todayStatus}</span></td>
                  <td className="py-3 px-4 text-center text-gray-700">{f.classesToday}</td>
                  <td className="py-3 px-4 text-center">{f.pendingLeaves > 0 ? <span className="text-orange-600 font-medium">{f.pendingLeaves}</span> : <span className="text-gray-400">0</span>}</td>
                  <td className="py-3 px-4 text-center font-medium text-gray-900">{f.performanceScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

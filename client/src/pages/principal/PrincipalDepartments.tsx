import { useState, useEffect } from 'react'
import { RefreshCw, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/services/api'

export function PrincipalDepartments() {
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { loadData() }, [])
  const loadData = async () => { setLoading(true); try { const r = await api.get('/principal/departments'); setDepartments(r.data.data || []) } catch(e) { console.error(e) } setLoading(false) }
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Departments</h1><p className="text-gray-500 text-sm">Department-wise attendance & faculty overview</p></div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((d: any) => (
          <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900 mb-2">{d.name}</h3>
            <p className="text-xs text-gray-500 mb-3">{d.code}</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-50"><p className="text-lg font-bold text-blue-700">{d.students}</p><p className="text-xs text-blue-600">Students</p></div>
              <div className="p-2 rounded-lg bg-green-50"><p className="text-lg font-bold text-green-700">{d.faculty}</p><p className="text-xs text-green-600">Faculty</p></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Attendance</span><span className="font-medium">{d.attendanceRate}%</span></div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full', d.attendanceRate >= 75 ? 'bg-green-500' : 'bg-red-500')} style={{ width: `${d.attendanceRate}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

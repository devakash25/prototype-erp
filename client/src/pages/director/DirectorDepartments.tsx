import { useState, useEffect } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/services/api'

export function DirectorDepartments() {
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDepartments() }, [])

  const loadDepartments = async () => {
    setLoading(true)
    try {
      const res = await api.get('/director/departments')
      setDepartments(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Performance</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor department-wise academic & operational metrics</p>
        </div>
        <button onClick={loadDepartments} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {/* Department Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept: any) => (
          <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                <p className="text-xs text-gray-500">{dept.code}</p>
              </div>
              <span className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                dept.performance >= 75 ? 'bg-green-100 text-green-800' :
                dept.performance >= 50 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              )}>
                {dept.performance >= 75 && <TrendingUp className="w-3 h-3 mr-1" />}
                {dept.performance < 50 && <TrendingDown className="w-3 h-3 mr-1" />}
                {dept.performance}%
              </span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <p className="text-lg font-bold text-blue-700">{dept.students}</p>
                  <p className="text-xs text-blue-600">Students</p>
                </div>
                <div className="p-2 rounded-lg bg-green-50">
                  <p className="text-lg font-bold text-green-700">{dept.faculty}</p>
                  <p className="text-xs text-green-600">Faculty</p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Attendance</span>
                    <span className="font-medium">{dept.attendanceRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', dept.attendanceRate >= 75 ? 'bg-green-500' : dept.attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500')} style={{ width: `${dept.attendanceRate}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Avg Marks</span>
                    <span className="font-medium">{dept.avgMarks}/100</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', dept.avgMarks >= 60 ? 'bg-blue-500' : dept.avgMarks >= 40 ? 'bg-yellow-500' : 'bg-red-500')} style={{ width: `${dept.avgMarks}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                <span>{dept.exams} Exams</span>
                <span>{dept.performance >= 75 ? 'Performing Well' : dept.performance >= 50 ? 'Average' : 'Needs Attention'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p>No departments found</p>
        </div>
      )}
    </div>
  )
}

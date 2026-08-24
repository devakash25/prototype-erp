import { useState, useEffect } from 'react'
import { RefreshCw, Users, AlertTriangle, Building2, Bus } from 'lucide-react'
import api from '@/services/api'

export function DirectorStudents() {
  const [students, setStudents] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStudents() }, [])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const res = await api.get('/director/students')
      setStudents(res.data.data)
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
          <h1 className="text-2xl font-bold text-gray-900">Student Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Student demographics, attendance & distribution</p>
        </div>
        <button onClick={loadStudents} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{students?.total || 0}</p><p className="text-xs text-gray-500">Total Students</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><Building2 className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold text-purple-700">{students?.hostelStudents || 0}</p><p className="text-xs text-gray-500">Hostel Students</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><Bus className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-green-700">{students?.transportStudents || 0}</p><p className="text-xs text-gray-500">Transport Users</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-2xl font-bold text-red-600">{students?.lowAttendance?.length || 0}</p><p className="text-xs text-gray-500">Low Attendance</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h2>
          <div className="space-y-3">
            {Object.entries(students?.gender || {}).map(([gender, count]: [string, any]) => {
              const total = students?.total || 1
              const pct = Math.round((count / total) * 100)
              return (
                <div key={gender}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">{gender?.toLowerCase()}</span>
                    <span className="font-medium">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h2>
          <div className="space-y-3">
            {(students?.byDepartment || []).map((dept: any, i: number) => {
              const max = Math.max(...(students?.byDepartment || []).map((d: any) => d.count))
              const pct = max > 0 ? Math.round((dept.count / max) * 100) : 0
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{dept.department}</span>
                    <span className="font-medium">{dept.count}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Low Attendance Alert */}
      {students?.lowAttendance?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />Low Attendance Students (Below 75%)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Admission No</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.lowAttendance.map((s: any) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-red-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{s.name}</td>
                    <td className="py-3 px-4 text-gray-700">{s.admissionNumber}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{s.rate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

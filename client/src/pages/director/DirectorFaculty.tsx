import { useState, useEffect } from 'react'
import { RefreshCw, Users, Award, AlertTriangle, Clock } from 'lucide-react'
import api from '@/services/api'

export function DirectorFaculty() {
  const [faculty, setFaculty] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadFaculty() }, [])

  const loadFaculty = async () => {
    setLoading(true)
    try {
      const res = await api.get('/director/faculty')
      setFaculty(res.data.data)
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
          <h1 className="text-2xl font-bold text-gray-900">Faculty Monitoring</h1>
          <p className="text-gray-500 text-sm mt-1">Track faculty performance, workload & leave status</p>
        </div>
        <button onClick={loadFaculty} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{faculty?.totalFaculty || 0}</p><p className="text-xs text-gray-500">Total Faculty</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center"><Clock className="w-5 h-5 text-orange-600" /></div>
            <div><p className="text-2xl font-bold text-orange-600">{faculty?.pendingLeaves || 0}</p><p className="text-xs text-gray-500">Pending Leaves</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><Award className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-green-600">{faculty?.topPerformers?.length || 0}</p><p className="text-xs text-gray-500">Top Performers</p></div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h2>
        <div className="space-y-3">
          {(faculty?.topPerformers || []).map((f: any, i: number) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                {f.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{f.name}</p>
                <p className="text-xs text-gray-500">{f.designation} &middot; {f.subjects} subjects &middot; {f.classesPerWeek} classes/week</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">{f.performanceScore}%</p>
                <p className="text-xs text-gray-500">Score</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Needs Improvement */}
      {faculty?.needsImprovement?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />Needs Improvement
          </h2>
          <div className="space-y-3">
            {faculty.needsImprovement.map((f: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-medium text-sm">
                  {f.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-500">{f.designation}</p>
                </div>
                <span className="text-sm font-medium text-amber-600">{f.performanceScore}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Faculty Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Faculty</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Designation</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Subjects</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Classes/Week</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Leaves</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Score</th>
              </tr>
            </thead>
            <tbody>
              {(faculty?.faculty || []).map((f: any, i: number) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{f.name}</td>
                  <td className="py-3 px-4 text-gray-700">{f.designation}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{f.subjects}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{f.classesPerWeek}</td>
                  <td className="py-3 px-4 text-center">
                    {f.pendingLeaves > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">{f.pendingLeaves}</span>
                    ) : <span className="text-gray-500">0</span>}
                  </td>
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

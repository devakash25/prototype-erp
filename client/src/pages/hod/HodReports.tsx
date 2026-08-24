import { useApi } from '@/hooks/useApi'
import { RefreshCw, Users, GraduationCap, Award, BookOpen, FileCheck, ClipboardCheck } from 'lucide-react'

export function HodReports() {
  const { data, loading, error, refetch } = useApi<any>('/hod/reports')
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-4"><p className="text-red-500">{error}</p><button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button></div>
  const d = data || {}
  const cards = [
    { title: 'Students', icon: GraduationCap, color: 'blue', metrics: [{ label: 'Total', value: d.students?.total || 0 }, { label: 'Active', value: d.students?.active || 0 }, { label: 'Inactive', value: d.students?.inactive || 0 }] },
    { title: 'Faculty', icon: Users, color: 'green', metrics: [{ label: 'Total', value: d.faculty?.total || 0 }, { label: 'Active', value: d.faculty?.active || 0 }] },
    { title: 'Examinations', icon: Award, color: 'purple', metrics: [{ label: 'Total Exams', value: d.exams || 0 }] },
    { title: 'Assignments', icon: FileCheck, color: 'amber', metrics: [{ label: 'Total', value: d.assignments || 0 }] },
    { title: 'Pending Evaluations', icon: ClipboardCheck, color: 'red', metrics: [{ label: 'Pending', value: d.pendingEvaluations || 0 }] },
  ]
  const colorMap: Record<string, string> = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', purple: 'bg-purple-50 text-purple-600', amber: 'bg-amber-50 text-amber-600', red: 'bg-red-50 text-red-600' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Reports</h1><p className="text-gray-500 text-sm">Department reports and analytics</p></div>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.title} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${colorMap[c.color]}`}><c.icon className="w-5 h-5" /></div>
              <h3 className="font-semibold text-gray-900">{c.title}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {c.metrics.map(m => (
                <div key={m.label}><p className="text-sm text-gray-500">{m.label}</p><p className="text-xl font-bold text-gray-900">{m.value}</p></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

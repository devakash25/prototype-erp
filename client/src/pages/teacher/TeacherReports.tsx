import { useApi } from '@/hooks/useApi'
import { RefreshCw, Users, BookOpen, FileCheck, BookOpenCheck, ClipboardCheck, Award, AlertCircle } from 'lucide-react'

export function TeacherReports() {
  const { data, loading, error, refetch } = useApi<any>('/teacher/reports')
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-4"><AlertCircle className="h-8 w-8 text-slate-400" /><p className="text-slate-400">{error}</p><button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button></div>
  const d = data || {}
  const cards = [
    { title: 'Students', icon: Users, color: 'bg-blue-50 text-blue-600', metrics: [{ label: 'Total', value: d.totalStudents || 0 }] },
    { title: 'Subjects', icon: BookOpen, color: 'bg-green-50 text-green-600', metrics: [{ label: 'Assigned', value: d.assignedSubjects || 0 }] },
    { title: 'Assignments', icon: FileCheck, color: 'bg-purple-50 text-purple-600', metrics: [{ label: 'Total', value: d.assignments || 0 }] },
    { title: 'Study Materials', icon: BookOpenCheck, color: 'bg-amber-50 text-amber-600', metrics: [{ label: 'Uploaded', value: d.studyMaterials || 0 }] },
    { title: 'Submissions', icon: ClipboardCheck, color: 'bg-teal-50 text-teal-600', metrics: [{ label: 'Total', value: d.submissions || 0 }] },
    { title: 'Pending Evaluation', icon: Award, color: 'bg-red-50 text-red-600', metrics: [{ label: 'Pending', value: d.pendingEvaluation || 0 }] },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Reports</h1><p className="text-slate-400 text-sm">Teaching reports overview</p></div>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.title} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4"><div className={`p-2 rounded-lg ${c.color}`}><c.icon className="w-5 h-5" /></div><h3 className="font-semibold text-gray-900">{c.title}</h3></div>
            <div>{c.metrics.map(m => <div key={m.label}><p className="text-sm text-gray-500">{m.label}</p><p className="text-xl font-bold text-gray-900">{m.value}</p></div>)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

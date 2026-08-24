import { useApi } from '@/hooks/useApi'
import { RefreshCw, BookOpenCheck, BookOpen, FileCheck, ClipboardCheck } from 'lucide-react'

export function TeacherLMS() {
  const { data, loading, error, refetch } = useApi<any>('/teacher/lms')
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-4"><p className="text-red-500">{error}</p><button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button></div>
  const d = data || {}
  const cards = [
    { label: 'Assignments', value: d.assignments || 0, icon: FileCheck, color: 'bg-blue-50 text-blue-600' },
    { label: 'Study Materials', value: d.studyMaterials || 0, icon: BookOpen, color: 'bg-green-50 text-green-600' },
    { label: 'Submissions', value: d.submissions || 0, icon: BookOpenCheck, color: 'bg-purple-50 text-purple-600' },
    { label: 'Pending Evaluation', value: d.pendingEvaluation || 0, icon: ClipboardCheck, color: 'bg-amber-50 text-amber-600' },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">LMS Overview</h1><p className="text-gray-500 text-sm">Learning management summary</p></div>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2"><div className={`p-2 rounded-lg ${c.color}`}><c.icon className="w-5 h-5" /></div><p className="text-sm text-gray-500">{c.label}</p></div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

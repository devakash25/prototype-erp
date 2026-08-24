import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  AlertCircle,
  BookOpen,
  FileText,
  FolderOpen,
  User,
} from 'lucide-react'

export function StudentSubjects() {
  const { data: subjects, loading, error, refetch } = useApi('/student/subjects')

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600">Failed to load subjects</p>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-gray-500 text-sm">Subjects assigned for the current semester</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : !subjects?.length ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm text-center py-16 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg">No subjects assigned</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub: any, idx: number) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{sub.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{sub.code}</p>
                </div>
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                  (sub.type === 'Theory' || sub.type === 'theory') && 'bg-blue-100 text-blue-700',
                  (sub.type === 'Practical' || sub.type === 'practical') && 'bg-green-100 text-green-700',
                  (sub.type === 'Lab' || sub.type === 'lab') && 'bg-purple-100 text-purple-700',
                  !['Theory', 'theory', 'Practical', 'practical', 'Lab', 'lab'].includes(sub.type) && 'bg-gray-100 text-gray-700'
                )}>
                  {sub.type || '—'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{sub.teacher || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span>Credits: {sub.credits ?? '—'}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{sub.assignmentsCount ?? 0} assignments</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span>{sub.materialsCount ?? 0} materials</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

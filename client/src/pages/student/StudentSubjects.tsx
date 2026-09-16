import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, AlertCircle, BookOpen, FileText, FolderOpen, User } from 'lucide-react'

export function StudentSubjects() {
  const { data: subjects, loading, error, refetch } = useApi('/student/subjects')

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-400">Failed to load subjects</p>
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
          <h1 className="text-2xl font-bold text-white">My Subjects</h1>
          <p className="text-slate-400 text-sm">Subjects assigned for the current semester</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="space-y-3">
                <div className="h-5 w-3/4 bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-700/50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : !subjects?.length ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 text-center py-16">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-600" />
          <p className="text-lg text-slate-400">No subjects assigned</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub: any, idx: number) => (
            <div key={idx} className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{sub.name}</h3>
                  <p className="text-sm text-slate-400 font-mono">{sub.code}</p>
                </div>
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                  (sub.type === 'Theory' || sub.type === 'theory') && 'bg-blue-500/10 text-blue-400',
                  (sub.type === 'Practical' || sub.type === 'practical') && 'bg-green-500/10 text-green-400',
                  (sub.type === 'Lab' || sub.type === 'lab') && 'bg-purple-500/10 text-purple-400',
                  !['Theory', 'theory', 'Practical', 'practical', 'Lab', 'lab'].includes(sub.type) && 'bg-slate-700 text-slate-400'
                )}>
                  {sub.type || '—'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="h-4 w-4 text-slate-500" />
                  <span>{sub.teacher || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  <span>Credits: {sub.credits ?? '—'}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700 flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{sub.assignmentCount ?? 0} assignments</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
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

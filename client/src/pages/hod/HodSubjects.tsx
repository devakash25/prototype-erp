import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, BookOpen, FileText, FolderOpen } from 'lucide-react'

export function HodSubjects() {
  const { data, loading, error, refetch } = useApi<any>('/hod/subjects')

  const subjects = data?.subjects || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-500 text-sm">All subjects across courses in your department</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Course</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Type</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Semester</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Credits</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Hrs/Wk</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">
                  <div className="flex items-center justify-center gap-1">
                    <FileText className="w-3.5 h-3.5" />Assignments
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">
                  <div className="flex items-center justify-center gap-1">
                    <FolderOpen className="w-3.5 h-3.5" />Materials
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    No subjects found
                  </td>
                </tr>
              )}
              {subjects.map((subject: any, i: number) => (
                <tr key={subject.id || i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium text-gray-900">{subject.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-mono text-xs">{subject.code || '—'}</td>
                  <td className="py-3 px-4 text-gray-700">{subject.course?.name || subject.courseName || '—'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      (subject.type === 'Theory' || subject.type === 'theory') && 'bg-blue-100 text-blue-700',
                      (subject.type === 'Practical' || subject.type === 'practical') && 'bg-green-100 text-green-700',
                      (subject.type === 'Lab' || subject.type === 'lab') && 'bg-purple-100 text-purple-700',
                      !['Theory', 'theory', 'Practical', 'practical', 'Lab', 'lab'].includes(subject.type) && 'bg-gray-100 text-gray-700'
                    )}>
                      {subject.type || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">{subject.semester || '—'}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{subject.credits || '—'}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{subject.hoursPerWeek || subject.hours || '—'}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{subject.assignmentsCount ?? subject.assignments ?? '—'}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{subject.materialsCount ?? subject.studyMaterials ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

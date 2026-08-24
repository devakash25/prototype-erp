import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { AlertCircle, RefreshCw, BookOpen, BookMarked } from 'lucide-react'

export function TeacherClasses() {
  const { data: classes, loading, error, refetch } = useApi('/teacher/classes')

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600">Failed to load classes</p>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Assigned Classes</h1>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !classes?.length ? (
        <div className="text-center py-16 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg">No classes assigned</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls: any, idx: number) => (
            <div key={idx} className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                  <p className="text-sm text-gray-500">{cls.code}</p>
                </div>
              </div>
              {cls.subjects?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {cls.subjects.map((subject: any, sIdx: number) => (
                      <span key={sIdx} className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">
                        <BookMarked className="h-3 w-3" />
                        {typeof subject === 'string' ? subject : subject.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TeacherClasses

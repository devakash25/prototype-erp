import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, BookOpen, Users, ChevronDown, ChevronRight } from 'lucide-react'

export function HodCourses() {
  const { data, loading, error, refetch } = useApi<any>('/hod/courses')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const courses = data?.courses || []

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 text-sm">Courses under your department</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course: any) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(course.id)}
                className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {course.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.name}</h3>
                      <p className="text-xs text-gray-500">{course.code || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.subjectsCount || course.subjects?.length || 0} subjects</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                        <Users className="w-4 h-4" />
                        <span>{course.studentsCount || course.students?.length || 0} students</span>
                      </div>
                    </div>
                    {expandedId === course.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {expandedId === course.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Subjects</h4>
                  {(!course.subjects || course.subjects.length === 0) ? (
                    <p className="text-sm text-gray-500">No subjects assigned</p>
                  ) : (
                    <div className="space-y-2">
                      {course.subjects.map((subject: any, i: number) => (
                        <div
                          key={subject.id || i}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{subject.name}</p>
                            <p className="text-xs text-gray-500">{subject.code || '—'}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                            {subject.type || 'Theory'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

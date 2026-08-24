import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw, Search, Users, BookOpen, UserCheck, X, ChevronDown,
  GraduationCap, Plus, Trash2
} from 'lucide-react'

export function PrincipalClassCoordinators() {
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [assignModal, setAssignModal] = useState<any>(null)
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: courses, loading: coursesLoading, refetch: refetchCourses } = useApi<any[]>(
    '/principal/courses-with-coordinators'
  )
  const { data: teachers, loading: teachersLoading } = useApi<any[]>('/principal/teachers')
  const { data: departments } = useApi<any>('/principal/departments')

  const filteredCourses = (courses || []).filter((c: any) => {
    if (search) {
      const q = search.toLowerCase()
      return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    }
    return true
  })

  const stats = [
    { label: 'Total Courses', value: courses?.length || 0, icon: BookOpen, color: 'blue' },
    { label: 'With Coordinator', value: courses?.filter((c: any) => c.coordinator).length || 0, icon: UserCheck, color: 'green' },
    { label: 'Without Coordinator', value: courses?.filter((c: any) => !c.coordinator).length || 0, icon: Users, color: 'red' },
    { label: 'Total Teachers', value: teachers?.length || 0, icon: GraduationCap, color: 'purple' },
  ]

  const handleAssign = async () => {
    if (!selectedTeacher || !assignModal) return
    setSubmitting(true)
    try {
      await api.post('/principal/assign-coordinator', {
        courseId: assignModal.id,
        employeeId: selectedTeacher,
      })
      refetchCourses()
      setAssignModal(null)
      setSelectedTeacher('')
    } catch (err: any) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (courseId: string) => {
    if (!confirm('Remove class coordinator from this course?')) return
    try {
      await api.post('/principal/remove-coordinator', { courseId })
      refetchCourses()
    } catch (err: any) {
      console.error(err)
    }
  }

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Coordinators</h1>
          <p className="text-gray-500 text-sm">Assign teachers as class coordinators for courses</p>
        </div>
        <button
          onClick={() => { refetchCourses() }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', `bg-${s.color}-50`)}>
                <s.icon className={cn('w-5 h-5', `text-${s.color}-600`)} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Students</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Class Coordinator</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCourses.map((course: any) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{course.name}</p>
                      <p className="text-xs text-gray-500">{course.code}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{course.department}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 capitalize">{course.level?.replace('_', ' ')}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{course.studentCount}</td>
                  <td className="px-5 py-4">
                    {course.coordinator ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-indigo-600">
                            {course.coordinator.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{course.coordinator.name}</p>
                          <p className="text-xs text-gray-500">{course.coordinator.employeeCode}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not assigned</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {course.coordinator ? (
                        <>
                          <button
                            onClick={() => {
                              setAssignModal(course)
                              setSelectedTeacher('')
                            }}
                            className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium"
                          >
                            Change
                          </button>
                          <button
                            onClick={() => handleRemove(course.id)}
                            className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setAssignModal(course)
                            setSelectedTeacher('')
                          }}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium"
                        >
                          <Plus className="w-3 h-3" />Assign
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">No courses found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {assignModal.coordinator ? 'Change' : 'Assign'} Class Coordinator
              </h3>
              <button onClick={() => setAssignModal(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{assignModal.name}</p>
              <p className="text-xs text-gray-500">{assignModal.code} · {assignModal.department}</p>
            </div>
            {assignModal.coordinator && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  Current coordinator: <strong>{assignModal.coordinator.name}</strong> ({assignModal.coordinator.employeeCode})
                </p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Teacher</label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Choose a teacher...</option>
                {(teachers || []).map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.employeeCode}) - {t.department || 'N/A'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setAssignModal(null)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedTeacher || submitting}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Assigning...' : 'Assign Coordinator'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

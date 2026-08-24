import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw, Search, Users, UserCheck, UserX, Home, Bus,
  ChevronLeft, ChevronRight, Filter
} from 'lucide-react'

export function PrincipalStudents() {
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('search', search)
  if (departmentId) params.set('departmentId', departmentId)

  const { data, loading, error, refetch } = useApi<any>(
    `/principal/students?${params.toString()}`,
    [search, departmentId, page]
  )

  const { data: departments } = useApi<any>('/principal/departments')

  const students = data?.students || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  const stats = [
    { label: 'Total Students', value: total, icon: Users, color: 'blue' },
    { label: 'Active', value: students.filter((s: any) => s.isActive).length, icon: UserCheck, color: 'green' },
    { label: 'Inactive', value: students.filter((s: any) => !s.isActive).length, icon: UserX, color: 'red' },
    { label: 'Hostel Students', value: students.filter((s: any) => s.isHostelStudent).length, icon: Home, color: 'purple' },
    { label: 'Transport Users', value: students.filter((s: any) => s.usesTransport).length, icon: Bus, color: 'amber' },
  ]

  if (loading && !data) {
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
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-500 text-sm">View and manage student records</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                stat.color === 'blue' && 'bg-blue-100',
                stat.color === 'green' && 'bg-green-100',
                stat.color === 'red' && 'bg-red-100',
                stat.color === 'purple' && 'bg-purple-100',
                stat.color === 'amber' && 'bg-amber-100',
              )}>
                <stat.icon className={cn(
                  'w-5 h-5',
                  stat.color === 'blue' && 'text-blue-600',
                  stat.color === 'green' && 'text-green-600',
                  stat.color === 'red' && 'text-red-600',
                  stat.color === 'purple' && 'text-purple-600',
                  stat.color === 'amber' && 'text-amber-600',
                )} />
              </div>
              <div>
                <p className={cn(
                  'text-2xl font-bold',
                  stat.color === 'blue' && 'text-blue-700',
                  stat.color === 'green' && 'text-green-700',
                  stat.color === 'red' && 'text-red-700',
                  stat.color === 'purple' && 'text-purple-700',
                  stat.color === 'amber' && 'text-amber-700',
                )}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={departmentId}
              onChange={(e) => { setDepartmentId(e.target.value); setPage(1) }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Departments</option>
              {(departments || []).map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
            Failed to load students. Please try again.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Admission #</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Department</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Course</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Hostel</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Transport</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
              {students.map((student: any) => (
                <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{student.user?.fullName}</p>
                    <p className="text-xs text-gray-500">{student.user?.email}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{student.admissionNumber}</td>
                  <td className="py-3 px-4 text-gray-700">{student.department?.name}</td>
                  <td className="py-3 px-4 text-gray-700">{student.course?.name}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      student.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      student.isHostelStudent ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      {student.isHostelStudent ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      student.usesTransport ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      {student.usesTransport ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />Prev
              </button>
              <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next<ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

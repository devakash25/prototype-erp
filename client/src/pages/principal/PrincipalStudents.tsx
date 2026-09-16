import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, Search, Users, UserCheck, UserX, Home, Bus, ChevronLeft, ChevronRight, Filter, AlertCircle } from 'lucide-react'

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
    { label: 'Total Students', value: total, icon: Users, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Active', value: data?.activeCount ?? total, icon: UserCheck, color: 'text-green-400 bg-green-500/10' },
    { label: 'Inactive', value: data?.inactiveCount ?? 0, icon: UserX, color: 'text-red-400 bg-red-500/10' },
    { label: 'Hostel Students', value: data?.hostelCount ?? 0, icon: Home, color: 'text-purple-400 bg-purple-500/10' },
    { label: 'Transport Users', value: data?.transportCount ?? 0, icon: Bus, color: 'text-amber-400 bg-amber-500/10' },
  ]

  if (loading && !data) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-400">{error}</p>
        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Student Management</h1>
          <p className="text-slate-400 text-sm">View and manage student records</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 hover:bg-slate-700">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search students..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); setPage(1) }}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All Departments</option>
              {(departments || []).map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 font-medium text-slate-400">Name</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Admission #</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Department</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Course</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Status</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Hostel</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Transport</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">No students found</td></tr>
              )}
              {students.map((student: any) => (
                <tr key={student.id} className="border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-white">{student.user?.fullName}</p>
                    <p className="text-xs text-slate-400">{student.user?.email}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{student.admissionNumber}</td>
                  <td className="py-3 px-4 text-slate-300">{student.department?.name}</td>
                  <td className="py-3 px-4 text-slate-300">{student.course?.name}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', student.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', student.isHostelStudent ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-700 text-slate-400')}>
                      {student.isHostelStudent ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', student.usesTransport ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-700 text-slate-400')}>
                      {student.usesTransport ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-700 flex items-center justify-between">
            <p className="text-sm text-slate-400">Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-700 rounded-lg text-sm text-slate-400 disabled:opacity-50 hover:bg-slate-700">
                <ChevronLeft className="w-4 h-4" />Prev
              </button>
              <span className="text-sm text-slate-300">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-700 rounded-lg text-sm text-slate-400 disabled:opacity-50 hover:bg-slate-700">
                Next<ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

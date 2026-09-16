import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users, UserCheck, UserX, Search, RefreshCw, AlertTriangle,
  GraduationCap, BookOpen, Heart, Shield, Building2, Calculator,
  Phone, ClipboardList, Bus, Library, Bed, Crown,
} from 'lucide-react'
import api from '@/services/api'

const roleIcons: Record<string, any> = {
  Student: GraduationCap,
  Teacher: BookOpen,
  Parent: Heart,
  HOD: Shield,
  Principal: Building2,
  Director: Crown,
  Accountant: Calculator,
  'Admission Counsellor': Phone,
  'Transport Manager': Bus,
  'Administrative Staff': ClipboardList,
  Librarian: Library,
  'Hostel Warden': Bed,
  'Chief Head': Shield,
}

const roleColors: Record<string, string> = {
  Student: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Teacher: 'bg-green-500/20 text-green-400 border-green-500/30',
  Parent: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  HOD: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Principal: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Director: 'bg-red-500/20 text-red-400 border-red-500/30',
  Accountant: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Admission Counsellor': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Transport Manager': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Administrative Staff': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  Librarian: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'Hostel Warden': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'Chief Head': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

export function CEOUsers() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [confirmDeactivateAll, setConfirmDeactivateAll] = useState(false)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['ceo-user-stats'],
    queryFn: () => api.get('/ceo/user-stats').then(res => res.data),
  })

  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['ceo-users', search, roleFilter, statusFilter, page],
    queryFn: () => api.get('/ceo/users', {
      params: { search, role: roleFilter, status: statusFilter, page, limit: 20 },
    }).then(res => res.data),
  })

  const toRoleKey = (role: string) => {
    const map: Record<string, string> = {
      Student: 'STUDENT',
      Teacher: 'TEACHER',
      Parent: 'PARENT',
      'Head of Department': 'HOD',
      Principal: 'PRINCIPAL',
      CEO: 'CEO',
      Accountant: 'ACCOUNTANT',
      'Admission Counsellor': 'ADMISSION_COUNSELLOR',
      'Transport Manager': 'TRANSPORT_MANAGER',
      'Administrative Staff': 'ADMINISTRATIVE_STAFF',
      Librarian: 'LIBRARIAN',
      'Hostel Warden': 'HOSTEL_WARDEN',
      'Chief Head': 'CHIEF_HEAD',
      'Vice Principal': 'VICE_PRINCIPAL',
      Receptionist: 'RECEPTIONIST',
      'Exam Controller': 'EXAM_CONTROLLER',
    }
    return map[role] || role.toUpperCase()
  }

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/ceo/users/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-users'] })
      queryClient.invalidateQueries({ queryKey: ['ceo-user-stats'] })
    },
  })

  const deactivateAllMutation = useMutation({
    mutationFn: () => api.post('/ceo/users/deactivate-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-users'] })
      queryClient.invalidateQueries({ queryKey: ['ceo-user-stats'] })
      setConfirmDeactivateAll(false)
    },
  })

  const reactivateAllMutation = useMutation({
    mutationFn: () => api.post('/ceo/users/reactivate-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-users'] })
      queryClient.invalidateQueries({ queryKey: ['ceo-user-stats'] })
    },
  })

  const roleBreakdown = stats?.roleBreakdown || []
  const users = usersData?.users || []
  const total = usersData?.total || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all platform users across institutions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm font-medium">Total Users</p>
            <div className="bg-blue-500 p-2 rounded-lg">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-3">{stats?.totalUsers ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm font-medium">Active Users</p>
            <div className="bg-green-500 p-2 rounded-lg">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-3">{stats?.activeUsers ?? 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm font-medium">Inactive Users</p>
            <div className="bg-red-500 p-2 rounded-lg">
              <UserX className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-3">{stats?.inactiveUsers ?? 0}</p>
        </div>
      </div>

      {/* Role Breakdown */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Users by Role</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {roleBreakdown.map((item: any) => {
            const Icon = roleIcons[item.role] || Users
            const color = roleColors[item.role] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
            return (
              <button
                key={item.role}
                onClick={() => {
                  setRoleFilter(roleFilter === toRoleKey(item.role) ? '' : toRoleKey(item.role))
                  setPage(1)
                }}
                className={`${color} border rounded-xl p-4 flex items-center gap-3 hover:opacity-80 transition-opacity text-left`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-slate-100">{item.count}</p>
                  <p className="text-xs text-slate-400">{item.role}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Deactivate All / Reactivate All */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Bulk Actions</h2>
            <p className="text-slate-400 text-sm mt-1">Deactivate or reactivate all users at once</p>
          </div>
          <div className="flex gap-3">
            {confirmDeactivateAll ? (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Are you sure?</span>
                <button
                  onClick={() => deactivateAllMutation.mutate()}
                  disabled={deactivateAllMutation.isPending}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deactivateAllMutation.isPending ? 'Deactivating...' : 'Yes, Deactivate All'}
                </button>
                <button
                  onClick={() => setConfirmDeactivateAll(false)}
                  className="px-3 py-1 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeactivateAll(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                <UserX className="w-4 h-4" />
                Deactivate All
              </button>
            )}
            <button
              onClick={() => reactivateAllMutation.mutate()}
              disabled={reactivateAllMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              {reactivateAllMutation.isPending ? 'Activating...' : 'Reactivate All'}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">All Users</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {(roleFilter || statusFilter || search) && (
              <button
                onClick={() => { setRoleFilter(''); setStatusFilter(''); setSearch(''); setPage(1) }}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {usersLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : usersError ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
            <p className="text-slate-400">Failed to load users</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Retry</button>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Institution</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Last Login</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-slate-200">{user.fullName}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400">
                      {user.institution?.name || 'Platform'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toggleMutation.mutate(user.id)}
                        disabled={toggleMutation.isPending || user.role === 'CEO'}
                        className={`text-sm px-3 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                          user.isActive
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
                className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

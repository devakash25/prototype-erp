import { useState, useEffect } from 'react'
import { Plus, Search, RefreshCw, Edit2, UserCheck, UserX, Key, X, Shield, ShieldCheck, ShieldAlert, Grid, List, Check, Minus } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { usersApi } from '@/services/apiService'
import api from '@/services/api'

const roleIcons: Record<string, typeof Shield> = {
  DIRECTOR: ShieldCheck, PRINCIPAL: Shield, HOD: ShieldAlert, TEACHER: Shield, ACCOUNTANT: Shield,
  ADMISSION_COUNSELLOR: Shield, LIBRARIAN: Shield, HOSTEL_WARDEN: Shield,
  TRANSPORT_MANAGER: Shield, ADMINISTRATIVE_STAFF: Shield, CHIEF_HEAD: ShieldCheck,
}

const roleLabels: Record<string, string> = {
  CHIEF_HEAD: 'Chief Head', DIRECTOR: 'Director', PRINCIPAL: 'Principal', HOD: 'HOD',
  TEACHER: 'Teacher', ACCOUNTANT: 'Accountant', ADMISSION_COUNSELLOR: 'Admission Counsellor',
  LIBRARIAN: 'Librarian', HOSTEL_WARDEN: 'Hostel Warden', TRANSPORT_MANAGER: 'Transport Manager',
  ADMINISTRATIVE_STAFF: 'Administrative Staff', STUDENT: 'Student', PARENT: 'Parent',
}

const permissionModules = [
  'Students', 'Faculty', 'Examinations', 'Fee Management', 'Attendance',
  'Library', 'Hostel', 'Transport', 'Helpdesk', 'Announcements', 'Reports', 'Settings',
]

const permissionActions = ['View', 'Create', 'Edit', 'Delete'] as const

const defaultPermissions: Record<string, Record<string, string[]>> = {
  CHIEF_HEAD: Object.fromEntries(permissionModules.map(m => [m, ['View', 'Create', 'Edit', 'Delete']])),
  DIRECTOR: {
    Students: ['View', 'Create', 'Edit'], Faculty: ['View', 'Create', 'Edit'],
    Examinations: ['View', 'Create', 'Edit'], 'Fee Management': ['View', 'Edit'],
    Attendance: ['View'], Library: ['View'], Hostel: ['View'], Transport: ['View'],
    Helpdesk: ['View', 'Edit'], Announcements: ['View', 'Create', 'Edit'],
    Reports: ['View'], Settings: ['View'],
  },
  PRINCIPAL: {
    Students: ['View', 'Create', 'Edit'], Faculty: ['View', 'Create', 'Edit'],
    Examinations: ['View', 'Create', 'Edit'], 'Fee Management': ['View'],
    Attendance: ['View'], Library: ['View'], Hostel: ['View'], Transport: ['View'],
    Helpdesk: ['View', 'Edit'], Announcements: ['View', 'Create'],
    Reports: ['View'], Settings: [],
  },
  HOD: {
    Students: ['View', 'Edit'], Faculty: ['View'],
    Examinations: ['View', 'Create', 'Edit'], 'Fee Management': [],
    Attendance: ['View', 'Edit'], Library: ['View'], Hostel: [], Transport: [],
    Helpdesk: ['View', 'Create'], Announcements: ['View'],
    Reports: ['View'], Settings: [],
  },
  TEACHER: {
    Students: ['View'], Faculty: ['View'],
    Examinations: ['View', 'Create'], 'Fee Management': [],
    Attendance: ['View', 'Edit'], Library: ['View'], Hostel: [], Transport: [],
    Helpdesk: ['Create'], Announcements: ['View'],
    Reports: [], Settings: [],
  },
  ACCOUNTANT: {
    Students: ['View'], Faculty: ['View'],
    Examinations: [], 'Fee Management': ['View', 'Create', 'Edit', 'Delete'],
    Attendance: [], Library: [], Hostel: [], Transport: [],
    Helpdesk: ['View'], Announcements: ['View'],
    Reports: ['View', 'Create'], Settings: [],
  },
  ADMISSION_COUNSELLOR: {
    Students: ['View', 'Create', 'Edit'], Faculty: ['View'],
    Examinations: [], 'Fee Management': ['View'],
    Attendance: [], Library: [], Hostel: ['View'], Transport: ['View'],
    Helpdesk: ['Create'], Announcements: ['View'],
    Reports: ['View'], Settings: [],
  },
  LIBRARIAN: {
    Students: ['View'], Faculty: ['View'],
    Examinations: [], 'Fee Management': [],
    Attendance: [], Library: ['View', 'Create', 'Edit', 'Delete'], Hostel: [], Transport: [],
    Helpdesk: ['View'], Announcements: ['View'],
    Reports: ['View'], Settings: [],
  },
  HOSTEL_WARDEN: {
    Students: ['View'], Faculty: ['View'],
    Examinations: [], 'Fee Management': [],
    Attendance: [], Library: [], Hostel: ['View', 'Create', 'Edit'], Transport: [],
    Helpdesk: ['View', 'Create', 'Edit'], Announcements: ['View'],
    Reports: ['View'], Settings: [],
  },
  TRANSPORT_MANAGER: {
    Students: ['View'], Faculty: ['View'],
    Examinations: [], 'Fee Management': [],
    Attendance: [], Library: [], Hostel: [], Transport: ['View', 'Create', 'Edit'],
    Helpdesk: ['View', 'Create'], Announcements: ['View'],
    Reports: ['View'], Settings: [],
  },
  ADMINISTRATIVE_STAFF: {
    Students: ['View'], Faculty: ['View'],
    Examinations: [], 'Fee Management': [],
    Attendance: [], Library: [], Hostel: ['View'], Transport: ['View'],
    Helpdesk: ['View', 'Create', 'Edit'], Announcements: ['View', 'Create'],
    Reports: ['View'], Settings: [],
  },
}

export function AuthorityManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [stats, setStats] = useState<any>(null)
  const [view, setView] = useState<'users' | 'permissions'>('users')

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [form, setForm] = useState({
    email: '', password: '', role: 'TEACHER', firstName: '', lastName: '',
    phone: '', departmentId: '', designation: '', employeeCode: '',
  })

  // Reset password modal
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetUserId, setResetUserId] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersRes, statsRes, deptsRes] = await Promise.allSettled([
        usersApi.list({ limit: 200 }),
        usersApi.getStats(),
        api.get('/analytics/departments').catch(() => ({ data: { data: [] } })),
      ])
      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data.data?.items || [])
      }
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data)
      if (deptsRes.status === 'fulfilled') setDepartments(deptsRes.value.data.data || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const openCreate = () => {
    setEditingUser(null)
    setForm({ email: '', password: '', role: 'TEACHER', firstName: '', lastName: '', phone: '', departmentId: '', designation: '', employeeCode: '' })
    setShowModal(true)
  }

  const openEdit = (user: any) => {
    setEditingUser(user)
    setForm({
      email: user.email, password: '', role: user.role,
      firstName: user.firstName || '', lastName: user.lastName || '',
      phone: user.phone || '', departmentId: '', designation: '',
      employeeCode: user.employee?.employeeCode || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, {
          firstName: form.firstName, lastName: form.lastName, phone: form.phone,
        })
      } else {
        await usersApi.create({
          email: form.email, password: form.password || 'Temp@123',
          role: form.role, firstName: form.firstName, lastName: form.lastName,
          phone: form.phone || undefined,
          departmentId: form.departmentId || undefined,
          designation: form.designation || undefined,
          employeeCode: form.employeeCode || undefined,
        })
      }
      setShowModal(false)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save')
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await usersApi.toggleStatus(id)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to toggle status')
    }
  }

  const openResetPassword = (userId: string) => {
    setResetUserId(userId)
    setNewPassword('')
    setShowResetModal(true)
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters')
      return
    }
    try {
      await usersApi.resetPassword(resetUserId, newPassword)
      setShowResetModal(false)
      alert('Password reset successfully')
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to reset password')
    }
  }

  const filtered = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!u.fullName?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q) && !u.phone?.includes(q)) return false
    }
    return true
  })

  const employeeRoles = ['DIRECTOR', 'PRINCIPAL', 'HOD', 'TEACHER', 'ACCOUNTANT', 'ADMISSION_COUNSELLOR', 'LIBRARIAN', 'HOSTEL_WARDEN', 'TRANSPORT_MANAGER', 'ADMINISTRATIVE_STAFF']
  const editableRoles = Object.keys(roleLabels).filter(k => k !== 'STUDENT' && k !== 'PARENT' && k !== 'CHIEF_HEAD')

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Authority Management</h1>
          <p className="text-sm text-gray-500">Manage directors, principals, HODs, and all institutional authorities</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setView('users')} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors', view === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <List className="w-4 h-4" />Users
            </button>
            <button onClick={() => setView('permissions')} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors', view === 'permissions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <Grid className="w-4 h-4" />Permissions
            </button>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
          {view === 'users' && (
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" />Create Authority
            </button>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-xs text-gray-500">Total Users</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-green-600">{stats.active}</p><p className="text-xs text-gray-500">Active</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-red-600">{stats.inactive}</p><p className="text-xs text-gray-500">Inactive</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-indigo-600">{Object.keys(stats.roleDistribution || {}).length}</p><p className="text-xs text-gray-500">Role Types</p></div>
        </div>
      )}

      {view === 'users' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by name, email or phone..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="ALL">All Roles</option>
              {Object.entries(roleLabels).filter(([k]) => k !== 'STUDENT' && k !== 'PARENT').map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Phone</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Role</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Joined</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">No authorities found</td></tr>
                  ) : filtered.map((u: any) => {
                    const RoleIcon = roleIcons[u.role] || Shield
                    return (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                              <RoleIcon className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{u.fullName}</p>
                              {u.employee?.employeeCode && <p className="text-xs text-indigo-600 font-mono">{u.employee.employeeCode}</p>}
                              {u.employee?.designation && <p className="text-xs text-gray-500">{u.employee.designation}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{u.email}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{u.phone || '—'}</td>
                        <td className="px-5 py-4"><span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{roleLabels[u.role] || u.role}</span></td>
                        <td className="px-5 py-4 text-center"><span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td className="px-5 py-4 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Edit"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                            <button onClick={() => handleToggleStatus(u.id)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Toggle Status">
                              {u.isActive ? <UserX className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                            </button>
                            <button onClick={() => openResetPassword(u.id)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Reset Password"><Key className="w-4 h-4 text-amber-500" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === 'permissions' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Role-Based Permission Matrix</h3>
            <p className="text-sm text-gray-500 mt-1">Default permissions for each role across modules</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 sticky left-0 bg-gray-50 z-10">Module</th>
                  {editableRoles.map(role => (
                    <th key={role} className="px-3 py-3 text-center text-xs font-semibold text-gray-500 min-w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <span>{roleLabels[role]}</span>
                        <span className="text-[10px] font-normal text-gray-400">
                          {users.filter(u => u.role === role).length} users
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {permissionModules.map((module) => (
                  <tr key={module} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">{module}</td>
                    {editableRoles.map(role => {
                      const perms = defaultPermissions[role]?.[module] || []
                      const allPerms = perms.length === 4
                      const somePerms = perms.length > 0 && !allPerms
                      return (
                        <td key={role} className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {allPerms ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <Check className="w-3 h-3" />Full
                              </span>
                            ) : somePerms ? (
                              <div className="flex flex-wrap gap-0.5">
                                {permissionActions.map(action => (
                                  <span key={action} className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium',
                                    perms.includes(action) ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-300')}>
                                    {action[0]}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-400 rounded-full text-xs">
                                <Minus className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">Full</span> All 4 permissions</span>
              <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium">V</span> = View, <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium">C</span> = Create, <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium">E</span> = Edit, <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium">D</span> = Delete</span>
              <span className="flex items-center gap-1"><Minus className="w-3 h-3" /> No access</span>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{editingUser ? 'Edit Authority' : 'Create Authority'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              {!editingUser && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password (default: Temp@123)</label>
                    <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Leave blank for default" />
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    disabled={!!editingUser}>
                    {editableRoles.map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              {employeeRoles.includes(form.role) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                      <option value="">Select Department</option>
                      {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input type="text" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g. Senior Professor" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                    <input type="text" value={form.employeeCode} onChange={e => setForm(f => ({ ...f, employeeCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Auto-generated if empty" />
                    <p className="text-xs text-gray-400 mt-1">Leave empty to auto-generate profile ID</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                {editingUser ? 'Update' : 'Create Authority'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Reset Password</h2>
              <button onClick={() => setShowResetModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Minimum 8 characters" />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button onClick={() => setShowResetModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleResetPassword} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium">Reset Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

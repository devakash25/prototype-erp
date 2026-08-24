import { useState, useEffect } from 'react'
import { Shield, ShieldCheck, Check, X, Save, RotateCcw, ChevronRight, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/services/api'

const MODULES = [
  'Students', 'Faculty', 'Examinations', 'Fee Management', 'Attendance',
  'Library', 'Hostel', 'Transport', 'Helpdesk', 'Announcements', 'Reports', 'System Settings',
]

const ACTIONS = ['View', 'Create', 'Edit', 'Delete', 'Export'] as const

type Permissions = Record<string, string[]>

const moduleIcons: Record<string, string> = {
  Students: '🎓', Faculty: '👨‍🏫', Examinations: '📝', 'Fee Management': '💰',
  Attendance: '✅', Library: '📚', Hostel: '🏠', Transport: '🚌',
  Helpdesk: '🎧', Announcements: '📢', Reports: '📊', 'System Settings': '⚙️',
}

const DEFAULT_PERMISSIONS: Record<string, Permissions> = {
  ADMIN: Object.fromEntries(MODULES.map(m => [m, [...ACTIONS]])),
  PRINCIPAL: {
    Students: ['View', 'Create', 'Edit'], Faculty: ['View', 'Create', 'Edit'],
    Examinations: ['View', 'Create', 'Edit'], 'Fee Management': ['View'],
    Attendance: ['View'], Library: ['View'], Hostel: ['View'], Transport: ['View'],
    Helpdesk: ['View', 'Edit'], Announcements: ['View', 'Create'],
    Reports: ['View'], 'System Settings': [],
  },
  HOD: {
    Students: ['View', 'Edit'], Faculty: ['View'],
    Examinations: ['View', 'Create', 'Edit'], 'Fee Management': [],
    Attendance: ['View', 'Edit'], Library: ['View'], Hostel: [], Transport: [],
    Helpdesk: ['View', 'Create'], Announcements: ['View'],
    Reports: ['View'], 'System Settings': [],
  },
  TEACHER: {
    Students: ['View'], Faculty: ['View'],
    Examinations: ['View', 'Create'], 'Fee Management': [],
    Attendance: ['View', 'Edit'], Library: ['View'], Hostel: [], Transport: [],
    Helpdesk: ['Create'], Announcements: ['View'],
    Reports: [], 'System Settings': [],
  },
  ACCOUNTANT: {
    Students: ['View'], Faculty: ['View'],
    Examinations: [], 'Fee Management': ['View', 'Create', 'Edit', 'Delete', 'Export'],
    Attendance: [], Library: [], Hostel: [], Transport: [],
    Helpdesk: ['View'], Announcements: ['View'],
    Reports: ['View', 'Export'], 'System Settings': [],
  },
  LIBRARIAN: {
    Students: ['View'], Faculty: ['View'],
    Examinations: [], 'Fee Management': [],
    Attendance: [], Library: ['View', 'Create', 'Edit', 'Delete'], Hostel: [], Transport: [],
    Helpdesk: ['View'], Announcements: ['View'],
    Reports: ['View'], 'System Settings': [],
  },
  STUDENT: {
    Students: ['View'], Faculty: ['View'],
    Examinations: ['View'], 'Fee Management': ['View'],
    Attendance: ['View'], Library: ['View'], Hostel: ['View'], Transport: ['View'],
    Helpdesk: ['Create'], Announcements: ['View'],
    Reports: [], 'System Settings': [],
  },
  PARENT: {
    Students: ['View'], Faculty: ['View'],
    Examinations: ['View'], 'Fee Management': ['View'],
    Attendance: ['View'], Library: [], Hostel: ['View'], Transport: ['View'],
    Helpdesk: ['Create'], Announcements: ['View'],
    Reports: ['View'], 'System Settings': [],
  },
}

export function PermissionManager() {
  const [roles, setRoles] = useState<any[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<Permissions>({})
  const [originalPermissions, setOriginalPermissions] = useState<Permissions>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => { loadRoles() }, [])

  useEffect(() => {
    if (selectedRoleId) {
      const role = roles.find(r => r.id === selectedRoleId)
      if (role) {
        const perms = role.permissions || {}
        const filled: Permissions = {}
        MODULES.forEach(m => { filled[m] = perms[m] || [] })
        setPermissions(filled)
        setOriginalPermissions(JSON.parse(JSON.stringify(filled)))
      }
    }
  }, [selectedRoleId, roles])

  const loadRoles = async () => {
    setLoading(true)
    try {
      const res = await api.get('/roles')
      setRoles(res.data?.data?.items || [])
    } catch { console.error('Failed to load roles') }
    setLoading(false)
  }

  const hasChanges = JSON.stringify(permissions) !== JSON.stringify(originalPermissions)

  const togglePermission = (module: string, action: string) => {
    setPermissions(prev => {
      const updated = { ...prev }
      const current = updated[module] || []
      updated[module] = current.includes(action) ? current.filter(a => a !== action) : [...current, action]
      return updated
    })
  }

  const toggleModuleAll = (module: string) => {
    setPermissions(prev => {
      const current = prev[module] || []
      const allActions = [...ACTIONS]
      const updated = { ...prev }
      updated[module] = current.length === allActions.length ? [] : allActions
      return updated
    })
  }

  const toggleActionAll = (action: string) => {
    setPermissions(prev => {
      const allHave = MODULES.every(m => (prev[m] || []).includes(action))
      const updated = { ...prev }
      MODULES.forEach(m => {
        const current = updated[m] || []
        updated[m] = allHave ? current.filter(a => a !== action) : [...new Set([...current, action])]
      })
      return updated
    })
  }

  const enableAllPermissions = () => {
    const all: Permissions = {}
    MODULES.forEach(m => { all[m] = [...ACTIONS] })
    setPermissions(all)
  }

  const disableAllPermissions = () => {
    const none: Permissions = {}
    MODULES.forEach(m => { none[m] = [] })
    setPermissions(none)
  }

  const resetToDefault = () => {
    const role = roles.find(r => r.id === selectedRoleId)
    if (!role) return
    const defaults = DEFAULT_PERMISSIONS[role.name] || {}
    const filled: Permissions = {}
    MODULES.forEach(m => { filled[m] = defaults[m] || [] })
    setPermissions(filled)
    setOriginalPermissions(JSON.parse(JSON.stringify(filled)))
  }

  const savePermissions = async () => {
    if (!selectedRoleId) return
    setSaving(true)
    setSaveSuccess(false)
    try {
      await api.put(`/roles/${selectedRoleId}/permissions`, { permissions })
      setOriginalPermissions(JSON.parse(JSON.stringify(permissions)))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch { alert('Failed to save permissions') }
    setSaving(false)
  }

  const selectedRole = roles.find(r => r.id === selectedRoleId)

  const totalGranted = MODULES.reduce((sum, m) => sum + (permissions[m]?.length || 0), 0)
  const totalPossible = MODULES.length * ACTIONS.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-indigo-100 rounded-xl">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Permission Manager</h1>
            <p className="text-sm text-gray-500">Configure granular access control for each role</p>
          </div>
        </div>

        <div className="flex gap-6 min-h-[calc(100vh-200px)]">
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-8">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <h2 className="font-semibold text-gray-800">Roles</h2>
                  <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{roles.length}</span>
                </div>
              </div>
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Loading roles...</div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-[calc(100vh-320px)] overflow-y-auto">
                  {roles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      className={cn(
                        'w-full px-5 py-3.5 flex items-center gap-3 text-left transition-all',
                        selectedRoleId === role.id
                          ? 'bg-indigo-50 border-l-3 border-l-indigo-500'
                          : 'hover:bg-gray-50 border-l-3 border-l-transparent'
                      )}
                    >
                      <div className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                        selectedRoleId === role.id ? 'bg-indigo-100' : 'bg-gray-100'
                      )}>
                        {selectedRoleId === role.id ? (
                          <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
                        ) : (
                          <Shield className="w-4.5 h-4.5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          'font-medium text-sm truncate',
                          selectedRoleId === role.id ? 'text-indigo-700' : 'text-gray-700'
                        )}>
                          {role.label || role.name}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{role.userCount ?? 0} users</span>
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        'w-4 h-4 flex-shrink-0 transition-colors',
                        selectedRoleId === role.id ? 'text-indigo-400' : 'text-gray-300'
                      )} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {!selectedRoleId ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center min-h-[600px]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-500">Select a role</h3>
                  <p className="text-sm text-gray-400 mt-1">Choose a role from the sidebar to manage its permissions</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900">{selectedRole?.label || selectedRole?.name}</h2>
                        <p className="text-xs text-gray-500">
                          {totalGranted} of {totalPossible} permissions granted
                          <span className="mx-1.5">·</span>
                          <span className={cn(totalGranted === totalPossible ? 'text-green-600' : totalGranted === 0 ? 'text-red-500' : 'text-indigo-600')}>
                            {totalGranted === totalPossible ? 'Full Access' : totalGranted === 0 ? 'No Access' : 'Partial Access'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={enableAllPermissions}
                        className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        Enable All
                      </button>
                      <button
                        onClick={disableAllPermissions}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Disable All
                      </button>
                      <div className="w-px h-6 bg-gray-200 mx-1" />
                      <button
                        onClick={resetToDefault}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset to Default
                      </button>
                      <button
                        onClick={savePermissions}
                        disabled={saving || !hasChanges}
                        className={cn(
                          'flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-all',
                          hasChanges && !saving
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        )}
                      >
                        <Save className="w-3.5 h-3.5" />
                        {saving ? 'Saving...' : 'Save Permissions'}
                      </button>
                      {saveSuccess && (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium animate-pulse">
                          <Check className="w-3.5 h-3.5" /> Saved
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {MODULES.map(module => {
                    const modulePerms = permissions[module] || []
                    const allActions = [...ACTIONS]
                    const isAllChecked = allActions.every(a => modulePerms.includes(a))
                    const isIndeterminate = modulePerms.length > 0 && !isAllChecked

                    return (
                      <div key={module} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{moduleIcons[module]}</span>
                            <h3 className="font-medium text-sm text-gray-800">{module}</h3>
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded-full font-medium',
                              isAllChecked ? 'bg-green-100 text-green-700'
                                : modulePerms.length === 0 ? 'bg-gray-100 text-gray-500'
                                : 'bg-indigo-100 text-indigo-600'
                            )}>
                              {modulePerms.length}/{allActions.length}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleModuleAll(module)}
                            className={cn(
                              'text-xs font-medium px-2.5 py-1 rounded-md transition-colors',
                              isAllChecked
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-indigo-600 hover:bg-indigo-50'
                            )}
                          >
                            {isAllChecked ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        <div className="p-4 space-y-2">
                          {allActions.map(action => {
                            const isChecked = modulePerms.includes(action)
                            return (
                              <button
                                key={action}
                                onClick={() => togglePermission(module, action)}
                                className={cn(
                                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg border transition-all text-sm',
                                  isChecked
                                    ? 'border-green-200 bg-green-50 text-green-800'
                                    : 'border-gray-150 bg-white text-gray-500 hover:bg-gray-50'
                                )}
                              >
                                <div className={cn(
                                  'w-5 h-5 rounded-md flex items-center justify-center border transition-all flex-shrink-0',
                                  isChecked
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300 bg-white'
                                )}>
                                  {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                                <span className="font-medium">{action}</span>
                                {isChecked ? (
                                  <Check className="w-4 h-4 text-green-500 ml-auto" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-300 ml-auto" />
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PermissionManager

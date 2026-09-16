import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreditCard, RefreshCw, Crown, Star, Zap, Check, X,
  ArrowRight, Sparkles, Edit3, ChevronDown, ChevronRight, Save, Trash2, AlertTriangle,
} from 'lucide-react'
import api from '@/services/api'
import { FEATURE_REGISTRY } from '@/config/features'

interface EditForm {
  name: string
  description: string
  planType: string
  userLimit: number
  storageLimitGB: number
  modules: string[]
  rolePricing: Array<{ role: string; pricePerSeat: number; isEnabled: boolean }>
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const totalFeatures = FEATURE_REGISTRY.reduce((s, g) => s + g.features.length, 0)

const ROLE_LABELS: Record<string, string> = {
  CHIEF_HEAD: 'Chief Head',
  PRINCIPAL: 'Principal',
  VICE_PRINCIPAL: 'Vice Principal',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
  ACCOUNTANT: 'Accountant',
  ADMISSION_COUNSELLOR: 'Admission Counsellor',
  TRANSPORT_MANAGER: 'Transport Manager',
  ADMINISTRATIVE_STAFF: 'Administrative Staff',
  LIBRARIAN: 'Librarian',
  HOSTEL_WARDEN: 'Hostel Warden',
  RECEPTIONIST: 'Receptionist',
  EXAM_CONTROLLER: 'Exam Controller',
  CEO: 'CEO',
}

export function CEOSubscription() {
  const queryClient = useQueryClient()
  const [showSummary, setShowSummary] = useState<string | null>(null)
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [creatingPlan, setCreatingPlan] = useState(false)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [expandedRoles, setExpandedRoles] = useState<string[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['ceo-plans'],
    queryFn: () => api.get('/ceo/plans').then((res) => res.data),
  })

  const { data: activeFeatures } = useQuery({
    queryKey: ['ceo-active-features'],
    queryFn: () => api.get('/ceo/plans/active-features').then((res) => res.data),
  })

  const { data: planSummary } = useQuery({
    queryKey: ['ceo-plan-summary', showSummary],
    queryFn: () => api.get(`/ceo/plans/${showSummary}/summary`).then((res) => res.data),
    enabled: !!showSummary,
  })

  const { data: userStats } = useQuery({
    queryKey: ['ceo-user-stats'],
    queryFn: () => api.get('/ceo/user-stats').then((res) => res.data),
  })

  const roleUserCounts = useMemo(() => {
    if (!userStats?.roleBreakdown) return {} as Record<string, number>
    const map: Record<string, number> = {}
    for (const item of userStats.roleBreakdown) {
      const roleMap: Record<string, string> = {
        'Student': 'STUDENT',
        'Teacher': 'TEACHER',
        'Parent': 'PARENT',
        'Head of Department': 'HOD',
        'Principal': 'PRINCIPAL',
        'Director': 'DIRECTOR',
        'Accountant': 'ACCOUNTANT',
        'Admission Counsellor': 'ADMISSION_COUNSELLOR',
        'Transport Manager': 'TRANSPORT_MANAGER',
        'Administrative Staff': 'ADMINISTRATIVE_STAFF',
        'Librarian': 'LIBRARIAN',
        'Hostel Warden': 'HOSTEL_WARDEN',
        'Chief Head': 'CHIEF_HEAD',
      }
      const key = roleMap[item.role]
      if (key) map[key] = item.count
    }
    return map
  }, [userStats])

  const calcPricing = (rolePricing: EditForm['rolePricing']) => {
    let totalMonthly = 0
    const breakdown: Array<{ role: string; label: string; pricePerSeat: number; users: number; monthly: number }> = []
    for (const rp of rolePricing) {
      if (!rp.isEnabled) continue
      const users = roleUserCounts[rp.role] || 0
      const monthly = rp.pricePerSeat * users
      totalMonthly += monthly
      breakdown.push({ role: rp.role, label: ROLE_LABELS[rp.role] || rp.role, pricePerSeat: rp.pricePerSeat, users, monthly })
    }
    return { totalMonthly, totalAnnual: Math.round(totalMonthly * 12 * 0.9), breakdown }
  }

  const activateMutation = useMutation({
    mutationFn: (planId: string) => api.post(`/ceo/plans/${planId}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-plans'] })
      queryClient.invalidateQueries({ queryKey: ['ceo-active-features'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/ceo/plans/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-plans'] })
    },
  })

  const updatePricingMutation = useMutation({
    mutationFn: ({ id, rolePricing }: { id: string; rolePricing: EditForm['rolePricing'] }) =>
      api.put(`/ceo/plans/${id}/role-pricing`, { rolePricing }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-plans'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/ceo/plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-plans'] })
      setDeleteConfirm(null)
    },
  })

  const initMutation = useMutation({
    mutationFn: () => api.post('/ceo/initialize-plans'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-plans'] })
      queryClient.invalidateQueries({ queryKey: ['ceo-active-features'] })
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/ceo/plans', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-plans'] })
      setCreatingPlan(false)
      setEditForm(null)
    },
  })

  const activePlanId = plans?.find((p: any) => p.isActive)?.id

  const startCreate = () => {
    const rolePricing = FEATURE_REGISTRY.map((group) => ({
      role: group.role,
      pricePerSeat: 0,
      isEnabled: true,
    }))

    setEditForm({
      name: '',
      description: '',
      planType: 'custom',
      userLimit: 100,
      storageLimitGB: 5,
      modules: [],
      rolePricing,
    })
    setCreatingPlan(true)
    setEditingPlan(null)
    setExpandedRoles([])
  }

  const startEdit = (plan: any) => {
    const modules: string[] = []
    const rolePricingMap: Record<string, { pricePerSeat: number; isEnabled: boolean }> = {}

    if (plan.modules && Array.isArray(plan.modules)) {
      modules.push(...plan.modules)
    }

    if (plan.rolePricing && Array.isArray(plan.rolePricing)) {
      plan.rolePricing.forEach((rp: any) => {
        rolePricingMap[rp.role] = { pricePerSeat: Number(rp.pricePerSeat), isEnabled: rp.isEnabled }
      })
    }

    const rolePricing = FEATURE_REGISTRY.map((group) => ({
      role: group.role,
      pricePerSeat: rolePricingMap[group.role]?.pricePerSeat ?? 0,
      isEnabled: rolePricingMap[group.role]?.isEnabled ?? true,
    }))

    setEditForm({
      name: plan.name,
      description: plan.description || '',
      planType: plan.planType || 'custom',
      userLimit: plan.userLimit ?? 100,
      storageLimitGB: plan.storageLimitGB ?? 5,
      modules,
      rolePricing,
    })
    setEditingPlan(plan.id)
    setCreatingPlan(false)
    setExpandedRoles([])
  }

  const toggleFeature = (featureId: string) => {
    if (!editForm) return
    setEditForm({
      ...editForm,
      modules: editForm.modules.includes(featureId)
        ? editForm.modules.filter((f) => f !== featureId)
        : [...editForm.modules, featureId],
    })
  }

  const toggleRoleFeatures = (role: string, enabled: boolean) => {
    if (!editForm) return
    const group = FEATURE_REGISTRY.find((g) => g.role === role)
    if (!group) return
    const featureIds = group.features.map((f) => f.id)
    let newModules: string[]
    if (enabled) {
      newModules = [...new Set([...editForm.modules, ...featureIds])]
    } else {
      newModules = editForm.modules.filter((f) => !featureIds.includes(f))
    }
    setEditForm({ ...editForm, modules: newModules })
  }

  const updateRolePrice = (role: string, price: number) => {
    if (!editForm) return
    setEditForm({
      ...editForm,
      rolePricing: editForm.rolePricing.map((rp) =>
        rp.role === role ? { ...rp, pricePerSeat: price } : rp
      ),
    })
  }

  const saveEdit = async () => {
    if (!editForm) return

    const pricing = calcPricing(editForm.rolePricing)

    if (creatingPlan) {
      await createMutation.mutateAsync({
        name: editForm.name,
        description: editForm.description,
        planType: editForm.planType,
        monthlyPrice: pricing.totalMonthly,
        annualPrice: pricing.totalAnnual,
        userLimit: editForm.userLimit,
        storageLimitGB: editForm.storageLimitGB,
        modules: editForm.modules,
        rolePricing: editForm.rolePricing,
      })
      return
    }

    if (!editingPlan) return
    await updateMutation.mutateAsync({
      id: editingPlan,
      data: {
        name: editForm.name,
        description: editForm.description,
        monthlyPrice: pricing.totalMonthly,
        annualPrice: pricing.totalAnnual,
        userLimit: editForm.userLimit,
        storageLimitGB: editForm.storageLimitGB,
        modules: editForm.modules,
      },
    })
    await updatePricingMutation.mutateAsync({
      id: editingPlan,
      rolePricing: editForm.rolePricing,
    })
    setEditingPlan(null)
    setEditForm(null)
  }

  const toggleExpandedRole = (role: string) => {
    setExpandedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-400" />
        <p className="text-lg text-slate-300">Failed to load subscription plans</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Retry</button>
      </div>
    )
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Plan & Subscription</h1>
          <p className="text-slate-400 text-sm mt-1">Choose a plan for your institution</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No Plans Available</h2>
          <p className="text-slate-400 mb-6">Initialize the system with default Free and Pro plans.</p>
          <button
            onClick={() => initMutation.mutate()}
            disabled={initMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            {initMutation.isPending ? 'Creating Plans...' : 'Initialize Plans'}
          </button>
        </div>
      </div>
    )
  }

  if ((editingPlan || creatingPlan) && editForm) {
    const isCreate = creatingPlan
    const pricing = calcPricing(editForm.rolePricing)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{isCreate ? 'Create New Plan' : 'Edit Plan'}</h1>
            <p className="text-slate-400 text-sm mt-1">Configure plan details, features, and role pricing</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setEditingPlan(null); setCreatingPlan(false); setEditForm(null) }}
              className="px-4 py-2 bg-slate-700 text-slate-300 text-sm rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={updateMutation.isPending || updatePricingMutation.isPending || createMutation.isPending || !editForm.name.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending || updatePricingMutation.isPending || createMutation.isPending ? 'Saving...' : isCreate ? 'Create Plan' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Plan Details */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Plan Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Plan Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="e.g. Enterprise, Starter..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Plan Type</label>
              <select
                value={editForm.planType}
                onChange={(e) => setEditForm({ ...editForm, planType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <input
                type="text"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Brief description of this plan"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">User Limit</label>
              <input
                type="number"
                value={editForm.userLimit}
                onChange={(e) => setEditForm({ ...editForm, userLimit: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Storage Limit (GB)</label>
              <input
                type="number"
                value={editForm.storageLimitGB}
                onChange={(e) => setEditForm({ ...editForm, storageLimitGB: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Feature Selection */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Feature Selection</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setEditForm({ ...editForm, modules: FEATURE_REGISTRY.flatMap((g) => g.features.map((f) => f.id)) })}
                className="text-xs px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={() => setEditForm({ ...editForm, modules: [] })}
                className="text-xs px-3 py-1.5 bg-slate-700 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            {editForm.modules.length} / {totalFeatures} features selected
          </p>

          <div className="space-y-3">
            {FEATURE_REGISTRY.map((group) => {
              const allSelected = group.features.every((f) => editForm.modules.includes(f.id))
              const someSelected = group.features.some((f) => editForm.modules.includes(f.id))
              const isExpanded = expandedRoles.includes(group.role)

              return (
                <div key={group.role} className="bg-slate-700/50 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <button
                      onClick={() => toggleExpandedRole(group.role)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                      onChange={() => toggleRoleFeatures(group.role, !allSelected)}
                      className="w-4 h-4 rounded border-slate-500 text-indigo-500 focus:ring-indigo-500 bg-slate-600"
                    />
                    <span className="text-sm font-medium text-white flex-1">{group.label}</span>
                    <span className="text-xs text-slate-400">
                      {group.features.filter((f) => editForm.modules.includes(f.id)).length} / {group.features.length}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-3 pt-1 border-t border-slate-600/50">
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => toggleRoleFeatures(group.role, true)}
                          className="text-xs px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-md hover:bg-indigo-500/20 transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => toggleRoleFeatures(group.role, false)}
                          className="text-xs px-3 py-1 bg-slate-600 text-slate-300 border border-slate-500 rounded-md hover:bg-slate-500 transition-colors"
                        >
                          Deselect All
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {group.features.map((feature) => (
                          <label
                            key={feature.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                              editForm.modules.includes(feature.id)
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                                : 'bg-slate-700 text-slate-400 border border-slate-600 hover:border-slate-500'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={editForm.modules.includes(feature.id)}
                              onChange={() => toggleFeature(feature.id)}
                              className="w-3 h-3 rounded border-slate-500 text-indigo-500 focus:ring-indigo-500 bg-slate-600"
                            />
                            {feature.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Role Pricing */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Role Pricing</h2>
          <p className="text-sm text-slate-400">Set per-seat pricing for each role. Monthly total is calculated automatically.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 text-slate-400 font-medium">Role</th>
                  <th className="text-left py-3 text-slate-400 font-medium">Enabled</th>
                  <th className="text-right py-3 text-slate-400 font-medium">Price/Seat (₹)</th>
                  <th className="text-right py-3 text-slate-400 font-medium">Users</th>
                  <th className="text-right py-3 text-slate-400 font-medium">Monthly</th>
                </tr>
              </thead>
              <tbody>
                {editForm.rolePricing.map((rp) => {
                  const users = roleUserCounts[rp.role] || 0
                  const monthly = rp.isEnabled ? rp.pricePerSeat * users : 0
                  return (
                    <tr key={rp.role} className="border-b border-slate-700/50">
                      <td className="py-3 text-white">{ROLE_LABELS[rp.role] || rp.role}</td>
                      <td className="py-3">
                        <button
                          onClick={() => {
                            setEditForm({
                              ...editForm,
                              rolePricing: editForm.rolePricing.map((r) =>
                                r.role === rp.role ? { ...r, isEnabled: !r.isEnabled } : r
                              ),
                            })
                          }}
                          className={`w-10 h-5 rounded-full transition-colors relative ${rp.isEnabled ? 'bg-green-500' : 'bg-slate-600'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${rp.isEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="py-3 text-right">
                        <input
                          type="number"
                          value={rp.pricePerSeat}
                          disabled={!rp.isEnabled}
                          onChange={(e) => updateRolePrice(rp.role, Number(e.target.value))}
                          className="w-24 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 text-right focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="py-3 text-right text-slate-400">{users}</td>
                      <td className="py-3 text-right text-green-400 font-medium">{formatCurrency(monthly)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Calculated Pricing</h2>
          <p className="text-sm text-slate-400">Auto-calculated from role pricing × actual user count</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Monthly Total</p>
              <p className="text-3xl font-bold text-green-400">{formatCurrency(pricing.totalMonthly)}</p>
              <p className="text-xs text-slate-400 mt-1">Sum of (price per seat × users) for enabled roles</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Annual Total (10% discount)</p>
              <p className="text-3xl font-bold text-green-400">{formatCurrency(pricing.totalAnnual)}</p>
              <p className="text-xs text-slate-400 mt-1">Monthly × 12 with 10% annual discount</p>
            </div>
          </div>

          {pricing.breakdown.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 text-slate-400 font-medium">Role</th>
                    <th className="text-right py-2 text-slate-400 font-medium">Price/Seat</th>
                    <th className="text-right py-2 text-slate-400 font-medium">Users</th>
                    <th className="text-right py-2 text-slate-400 font-medium">Monthly</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.breakdown.map((item) => (
                    <tr key={item.role} className="border-b border-slate-700/30">
                      <td className="py-2 text-slate-300">{item.label}</td>
                      <td className="py-2 text-right text-slate-400">{formatCurrency(item.pricePerSeat)}</td>
                      <td className="py-2 text-right text-slate-400">{item.users}</td>
                      <td className="py-2 text-right text-green-400">{formatCurrency(item.monthly)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-600 font-semibold">
                    <td className="py-2 text-white">Total</td>
                    <td className="py-2 text-right"></td>
                    <td className="py-2 text-right text-white">
                      {pricing.breakdown.reduce((s, r) => s + r.users, 0)}
                    </td>
                    <td className="py-2 text-right text-green-400">{formatCurrency(pricing.totalMonthly)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main plan cards view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Plan & Subscription</h1>
          <p className="text-slate-400 text-sm mt-1">
            Only one plan can be active at a time. Prices are auto-calculated from role pricing × user counts.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <CreditCard className="w-4 h-4" />
          Create Plan
        </button>
      </div>

      {activePlanId && (
        <div className="bg-slate-800 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-green-400 font-medium">Active Plan</p>
            <p className="text-white">
              {plans.find((p: any) => p.id === activePlanId)?.name || 'Unknown'} is currently active
              <span className="text-slate-400 ml-2">
                ({activeFeatures?.features?.length || 0} / {totalFeatures} features enabled)
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan: any) => {
          const isActive = activePlanId === plan.id
          const isPro = plan.planType === 'pro'
          return (
            <div key={plan.id} className={`relative bg-slate-800 border rounded-2xl p-8 transition-all ${
              isActive ? (isPro ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-green-500 ring-2 ring-green-500/20') : 'border-slate-700 hover:border-slate-600'
            }`}>
              {isActive && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-white text-xs font-bold rounded-full flex items-center gap-1 ${isPro ? 'bg-amber-500' : 'bg-green-500'}`}>
                  {isPro && <Crown className="w-3 h-3" />}
                  ACTIVE
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPro ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-slate-500 to-slate-700'}`}>
                  {isPro ? <Crown className="w-6 h-6 text-white" /> : <Star className="w-6 h-6 text-white" />}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                  <p className="text-xs text-slate-400">{plan.planType}</p>
                </div>
                <button
                  onClick={() => startEdit(plan)}
                  className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-slate-400 mb-6">
                {plan.description || 'No description'}
              </p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-white">{formatCurrency(Number(plan.monthlyPrice))}</span>
                  <span className="text-sm text-slate-400">/month</span>
                </div>
                <p className="text-xs text-slate-400">
                  {formatCurrency(Number(plan.annualPrice))}/year
                  {Number(plan.annualPrice) > 0 && <span className="text-green-400 ml-1">(save 10%)</span>}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Features</span>
                  <span className="text-white font-medium">{plan.featureCount} / {totalFeatures}</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isPro ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-slate-500'}`}
                    style={{ width: `${(plan.featureCount / totalFeatures) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Roles</span>
                  <span className="text-white font-medium">{plan.enabledRoles} roles</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">User Limit</span>
                  <span className="text-white font-medium">{plan.userLimit} users</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => activateMutation.mutate(plan.id)}
                  disabled={activateMutation.isPending || isActive}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30 cursor-default'
                      : isPro
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 border border-amber-500/50'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                  } disabled:opacity-50`}
                >
                  {isActive ? (
                    <><Check className="w-4 h-4" /> Currently Active</>
                  ) : activateMutation.isPending ? (
                    'Activating...'
                  ) : (
                    <><Zap className="w-4 h-4" /> Activate {plan.name}</>
                  )}
                </button>
                <button
                  onClick={() => setShowSummary(showSummary === plan.id ? null : plan.id)}
                  className="px-4 py-3 rounded-xl text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600 transition-all"
                >
                  Details
                </button>
                {!isActive && (
                  deleteConfirm === plan.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteMutation.mutate(plan.id)}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-3 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-3 rounded-xl text-sm font-medium bg-slate-700 text-slate-400 hover:bg-slate-600 border border-slate-600 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(plan.id)}
                      className="px-3 py-3 rounded-xl text-sm font-medium bg-slate-700/50 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showSummary && planSummary && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {planSummary.plan.name} Plan - Detailed Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400">Features Enabled</p>
              <p className="text-2xl font-bold text-white">
                {planSummary.features.enabled}
                <span className="text-sm font-normal text-slate-500"> / {planSummary.features.total}</span>
              </p>
              <div className="w-full h-2 bg-slate-600 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${planSummary.features.percentage}%` }} />
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400">Monthly Cost</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(planSummary.pricing.totalMonthly)}</p>
              <p className="text-xs text-slate-500 mt-1">Annual: {formatCurrency(planSummary.pricing.totalAnnualAfterDiscount)}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400">Active Users</p>
              <p className="text-2xl font-bold text-white">
                {planSummary.roleBreakdown.reduce((s: number, r: any) => s + r.actualUsers, 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Across {planSummary.roleBreakdown.filter((r: any) => r.actualUsers > 0).length} roles
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-400 font-medium">Role</th>
                  <th className="text-right py-2 text-slate-400 font-medium">Price/Seat</th>
                  <th className="text-right py-2 text-slate-400 font-medium">Users</th>
                  <th className="text-right py-2 text-slate-400 font-medium">Monthly</th>
                </tr>
              </thead>
              <tbody>
                {planSummary.roleBreakdown.map((item: any) => (
                  <tr key={item.role} className="border-b border-slate-700/50">
                    <td className="py-2 text-slate-200">{item.role.replace(/_/g, ' ')}</td>
                    <td className="py-2 text-right text-slate-300">{formatCurrency(item.pricePerSeat)}</td>
                    <td className="py-2 text-right text-slate-300">{item.actualUsers}</td>
                    <td className="py-2 text-right text-green-400 font-medium">{formatCurrency(item.monthlyCost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-600 font-semibold">
                  <td className="py-2 text-white">Total</td>
                  <td className="py-2 text-right"></td>
                  <td className="py-2 text-right text-white">
                    {planSummary.roleBreakdown.reduce((s: number, r: any) => s + r.actualUsers, 0)}
                  </td>
                  <td className="py-2 text-right text-green-400">{formatCurrency(planSummary.pricing.totalMonthly)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
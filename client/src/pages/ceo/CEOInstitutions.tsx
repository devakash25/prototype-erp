import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Building2, Plus, RefreshCw, Search, X, Pencil, Power, CreditCard,
  Users, GraduationCap, AlertTriangle, Copy, Check, Shield,
} from 'lucide-react'
import api from '@/services/api'

const inputCls =
  'w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500'
const labelCls = 'block text-sm font-medium text-slate-300 mb-1'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    trial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    suspended: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    expired: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border ${map[status] || map.cancelled}`}>
      {status}
    </span>
  )
}

export function CEOInstitutions() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', subdomain: '', type: 'SCHOOL', city: '', phone: '' })
  const [creds, setCreds] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [editTarget, setEditTarget] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [manageTarget, setManageTarget] = useState<any | null>(null)
  const [subForm, setSubForm] = useState({ planId: '', billingCycle: 'monthly', startDate: '', endDate: '', autoRenew: true, trial: false })
  const [toggleTarget, setToggleTarget] = useState<any | null>(null)
  const [error, setError] = useState('')

  const { data: institutions, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['ceo-institutions'],
    queryFn: () => api.get('/ceo/institutions').then((res) => res.data),
  })

  const { data: plans } = useQuery({
    queryKey: ['ceo-plans'],
    queryFn: () => api.get('/ceo/plans').then((res) => res.data),
  })

  const { data: subscriptions } = useQuery({
    queryKey: ['ceo-inst-subs', manageTarget?.id],
    queryFn: () => api.get(`/ceo/institutions/${manageTarget.id}/subscriptions`).then((res) => res.data),
    enabled: !!manageTarget,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['ceo-institutions'] })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/ceo/institutions', data),
    onSuccess: (res) => {
      setCreds(res.data.initialAdmin)
      setCreateOpen(false)
      setCreateForm({ name: '', subdomain: '', type: 'SCHOOL', city: '', phone: '' })
      setError('')
      invalidate()
    },
    onError: (e: any) => setError(e?.response?.data?.error || e.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.patch(`/ceo/institutions/${id}`, data),
    onSuccess: () => {
      setEditTarget(null)
      setError('')
      invalidate()
    },
    onError: (e: any) => setError(e?.response?.data?.error || e.message),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: any) => api.patch(`/ceo/institutions/${id}/status`, { isActive }),
    onSuccess: () => {
      setToggleTarget(null)
      invalidate()
    },
    onError: (e: any) => setError(e?.response?.data?.error || e.message),
  })

  const assignMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.post(`/ceo/institutions/${id}/subscriptions`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-inst-subs', manageTarget?.id] })
      invalidate()
    },
    onError: (e: any) => setError(e?.response?.data?.error || e.message),
  })

  const updateSubMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.patch(`/ceo/subscriptions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-inst-subs', manageTarget?.id] })
      invalidate()
    },
    onError: (e: any) => setError(e?.response?.data?.error || e.message),
  })

  const filtered = (institutions || []).filter((inst: any) => {
    const q = search.toLowerCase()
    return (
      !q ||
      inst.name.toLowerCase().includes(q) ||
      inst.code.toLowerCase().includes(q) ||
      (inst.subdomain || '').toLowerCase().includes(q) ||
      (inst.emailDomain || '').toLowerCase().includes(q)
    )
  })

  const activeSub = (inst: any) =>
    inst.subscriptions?.find((s: any) => s.status === 'active' || s.status === 'trial') ||
    inst.subscriptions?.[0] ||
    null

  const startEdit = (inst: any) => {
    setEditTarget(inst)
    setEditForm({
      name: inst.name,
      type: inst.type,
      address: inst.address || '',
      city: inst.city || '',
      state: inst.state || '',
      pincode: inst.pincode || '',
      phone: inst.phone || '',
      email: inst.email || '',
      website: inst.website || '',
    })
    setError('')
  }

  const startManage = (inst: any) => {
    setManageTarget(inst)
    const firstActive = (plans || []).find((p: any) => p.isActive)
    setSubForm({
      planId: firstActive?.id || '',
      billingCycle: 'monthly',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      autoRenew: true,
      trial: false,
    })
    setError('')
  }

  const submitCreate = () => {
    setError('')
    createMutation.mutate(createForm)
  }

  const submitEdit = () => {
    setError('')
    updateMutation.mutate({ id: editTarget.id, data: editForm })
  }

  const submitAssign = () => {
    if (!manageTarget || !subForm.planId) return
    setError('')
    assignMutation.mutate({
      id: manageTarget.id,
      data: {
        planId: subForm.planId,
        billingCycle: subForm.billingCycle,
        startDate: subForm.startDate || undefined,
        endDate: subForm.endDate || undefined,
        autoRenew: subForm.autoRenew,
        status: subForm.trial ? 'trial' : 'active',
      },
    })
  }

  const copyCreds = async () => {
    if (!creds) return
    try {
      await navigator.clipboard.writeText(`${creds.email} / ${creds.password}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  const stats = {
    total: (institutions || []).length,
    active: (institutions || []).filter((i: any) => i.isActive).length,
    inactive: (institutions || []).filter((i: any) => !i.isActive).length,
  }

  if (manageTarget) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-400" /> Subscriptions — {manageTarget.name}
            </h1>
            <p className="text-sm text-slate-400 mt-1">{manageTarget.emailDomain}</p>
          </div>
          <button
            onClick={() => { setManageTarget(null); setError('') }}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
          >
            Back to list
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Assign / renew a plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Plan</label>
              <select className={inputCls} value={subForm.planId} onChange={(e) => setSubForm({ ...subForm, planId: e.target.value })}>
                <option value="">Select a plan…</option>
                {(plans || []).filter((p: any) => p.isActive).map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Billing cycle</label>
              <select className={inputCls} value={subForm.billingCycle} onChange={(e) => setSubForm({ ...subForm, billingCycle: e.target.value })}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Start date</label>
              <input type="date" className={inputCls} value={subForm.startDate} onChange={(e) => setSubForm({ ...subForm, startDate: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>End date (blank = auto +1 cycle)</label>
              <input type="date" className={inputCls} value={subForm.endDate} onChange={(e) => setSubForm({ ...subForm, endDate: e.target.value })} />
            </div>
            <div className="flex items-end gap-6 pb-2">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" checked={subForm.autoRenew} onChange={(e) => setSubForm({ ...subForm, autoRenew: e.target.checked })} className="rounded border-slate-600" />
                Auto-renew
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" checked={subForm.trial} onChange={(e) => setSubForm({ ...subForm, trial: e.target.checked })} className="rounded border-slate-600" />
                Trial
              </label>
            </div>
            <div className="flex items-end">
              <button
                onClick={submitAssign}
                disabled={assignMutation.isPending || !subForm.planId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium w-full"
              >
                {assignMutation.isPending ? 'Assigning…' : 'Assign plan'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Subscription history</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700/60">
                  <th className="px-6 py-3 font-medium">Plan</th>
                  <th className="px-6 py-3 font-medium">Cycle</th>
                  <th className="px-6 py-3 font-medium">Start</th>
                  <th className="px-6 py-3 font-medium">End</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Change status</th>
                </tr>
              </thead>
              <tbody>
                {(subscriptions || []).map((sub: any) => (
                  <tr key={sub.id} className="border-b border-slate-700/40 hover:bg-slate-700/20">
                    <td className="px-6 py-3 text-white">{sub.plan?.name || '—'}</td>
                    <td className="px-6 py-3 text-slate-300 capitalize">{sub.billingCycle}</td>
                    <td className="px-6 py-3 text-slate-300">{new Date(sub.startDate).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-slate-300">{new Date(sub.endDate).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-slate-300">₹{Number(sub.totalAmount).toLocaleString()}</td>
                    <td className="px-6 py-3"><StatusBadge status={sub.status} /></td>
                    <td className="px-6 py-3">
                      <select
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                        value={sub.status}
                        onChange={(e) => updateSubMutation.mutate({ id: sub.id, data: { status: e.target.value } })}
                      >
                        {['active', 'trial', 'suspended', 'cancelled', 'expired'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {!(subscriptions || []).length && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No subscriptions yet — assign a plan above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" /> Institutions
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage tenants, domains and subscriptions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setCreateOpen(true); setError('') }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> New Institution
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total institutions', value: stats.total, icon: Building2, color: 'text-blue-400' },
          { label: 'Active', value: stats.active, icon: Check, color: 'text-emerald-400' },
          { label: 'Inactive', value: stats.inactive, icon: Power, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            className={`${inputCls} pl-9`}
            placeholder="Search by name, code or domain…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700/60">
                <th className="px-6 py-3 font-medium">Institution</th>
                <th className="px-6 py-3 font-medium">Domain</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Users / Students</th>
                <th className="px-6 py-3 font-medium">Subscription</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inst: any) => {
                const sub = activeSub(inst)
                return (
                  <tr key={inst.id} className="border-b border-slate-700/40 hover:bg-slate-700/20">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{inst.name}</div>
                      <div className="text-xs text-slate-500">{inst.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300">{inst.emailDomain || '—'}</div>
                      <div className="text-xs text-slate-500">{inst.subdomain ? `${inst.subdomain}.deverp.com` : '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${inst.type === 'SCHOOL' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'}`}>
                        {inst.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-slate-300">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {inst._count?.users ?? 0}</span>
                        <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {inst._count?.students ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sub ? (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300">{sub.plan?.name || 'Plan'}</span>
                          <StatusBadge status={sub.status} />
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">No plan assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${inst.isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {inst.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startManage(inst)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-700"
                          title="Manage subscription"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEdit(inst)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setToggleTarget(inst)}
                          className={`p-1.5 rounded-lg hover:bg-slate-700 ${inst.isActive ? 'text-slate-400 hover:text-red-400' : 'text-slate-400 hover:text-emerald-400'}`}
                          title={inst.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!filtered.length && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    {isLoading ? 'Loading…' : 'No institutions found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">New Institution</h3>
              <button onClick={() => setCreateOpen(false)} className="p-1 hover:bg-slate-700 rounded text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Name *</label>
                <input className={inputCls} value={createForm.name} placeholder="Springfield Public School"
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Subdomain * (users get @&lt;subdomain&gt;.deverp.com emails)</label>
                <input className={inputCls} value={createForm.subdomain} placeholder="springfield"
                  onChange={(e) => setCreateForm({ ...createForm, subdomain: e.target.value.toLowerCase() })} />
                {createForm.subdomain && (
                  <p className="text-xs text-slate-500 mt-1">
                    Email domain: <span className="text-slate-300">admin@{createForm.subdomain}.deverp.com</span>
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Type</label>
                  <select className={inputCls} value={createForm.type} onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}>
                    <option value="SCHOOL">School</option>
                    <option value="COLLEGE">College</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input className={inputCls} value={createForm.city} onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setCreateOpen(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm">
                Cancel
              </button>
              <button
                onClick={submitCreate}
                disabled={createMutation.isPending || !createForm.name || !createForm.subdomain}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
              >
                {createMutation.isPending ? 'Creating…' : 'Create institution'}
              </button>
            </div>
          </div>
        </div>
      )}

      {creds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" /> Institution created
              </h3>
              <button onClick={() => { setCreds(null); setCopied(false) }} className="p-1 hover:bg-slate-700 rounded text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Initial chief-head credentials — shown only once. Store them safely.
            </p>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="text-white font-mono">{creds.email}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Password</span><span className="text-white font-mono">{creds.password}</span></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={copyCreds} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button onClick={() => { setCreds(null); setCopied(false) }} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Edit {editTarget.name}</h3>
                <p className="text-xs text-slate-500">{editTarget.emailDomain} · domain changes are not allowed</p>
              </div>
              <button onClick={() => setEditTarget(null)} className="p-1 hover:bg-slate-700 rounded text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name</label>
                <input className={inputCls} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <select className={inputCls} value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                  <option value="SCHOOL">School</option>
                  <option value="COLLEGE">College</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Address</label>
                <input className={inputCls} value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input className={inputCls} value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input className={inputCls} value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Pincode</label>
                <input className={inputCls} value={editForm.pincode} onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Contact email</label>
                <input className={inputCls} value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Website</label>
                <input className={inputCls} value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditTarget(null)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm">
                Cancel
              </button>
              <button
                onClick={submitEdit}
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
              >
                {updateMutation.isPending ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toggleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className={`w-6 h-6 ${toggleTarget.isActive ? 'text-red-400' : 'text-emerald-400'}`} />
              <h3 className="text-lg font-semibold text-white">
                {toggleTarget.isActive ? 'Deactivate' : 'Activate'} {toggleTarget.name}?
              </h3>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              {toggleTarget.isActive
                ? 'All users of this institution will be blocked from logging in immediately.'
                : 'Users of this institution will be able to log in again.'}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setToggleTarget(null)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm">
                Cancel
              </button>
              <button
                onClick={() => toggleMutation.mutate({ id: toggleTarget.id, isActive: !toggleTarget.isActive })}
                disabled={toggleMutation.isPending}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${
                  toggleTarget.isActive ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {toggleMutation.isPending ? 'Working…' : toggleTarget.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreditCard, Plus, RefreshCw, Trash2, Edit3, CheckCircle, XCircle,
  IndianRupee, Users, BookOpen, Building2, ToggleLeft, ToggleRight, AlertTriangle,
} from 'lucide-react'
import api from '@/services/api'

interface PlanForm {
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  maxStudents: number
  maxTeachers: number
  maxInstitutions: number
  sortOrder: number
}

const emptyForm: PlanForm = {
  name: '',
  description: '',
  monthlyPrice: 0,
  annualPrice: 0,
  maxStudents: 100,
  maxTeachers: 20,
  maxInstitutions: 1,
  sortOrder: 0,
}

export function CEOPricing() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PlanForm>(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['ceo-subscription-plans'],
    queryFn: () => api.get('/ceo/subscription-plans').then(res => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: PlanForm) => api.post('/ceo/subscription-plans', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-subscription-plans'] })
      setShowForm(false)
      setForm(emptyForm)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PlanForm> }) =>
      api.patch(`/ceo/subscription-plans/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-subscription-plans'] })
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/ceo/subscription-plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-subscription-plans'] })
      setDeleteConfirm(null)
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/ceo/subscription-plans/${id}`, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-subscription-plans'] })
    },
  })

  const handleSubmit = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const handleEdit = (plan: any) => {
    setEditingId(plan.id)
    setForm({
      name: plan.name,
      description: plan.description || '',
      monthlyPrice: Number(plan.monthlyPrice),
      annualPrice: Number(plan.annualPrice),
      maxStudents: plan.maxStudents,
      maxTeachers: plan.maxTeachers,
      maxInstitutions: plan.maxInstitutions,
      sortOrder: plan.sortOrder || 0,
    })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Subscription Plans</h1>
          <p className="text-slate-400 text-sm mt-1">Create and manage pricing plans for institutions</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
            setForm(emptyForm)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Plan
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            {editingId ? 'Edit Plan' : 'Create New Plan'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Plan Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="e.g. Starter Plan"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="Brief description of the plan"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Monthly Price (₹) *</label>
              <input
                type="number"
                value={form.monthlyPrice}
                onChange={(e) => setForm({ ...form, monthlyPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Annual Price (₹) *</label>
              <input
                type="number"
                value={form.annualPrice}
                onChange={(e) => setForm({ ...form, annualPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Max Students</label>
              <input
                type="number"
                value={form.maxStudents}
                onChange={(e) => setForm({ ...form, maxStudents: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Max Teachers</label>
              <input
                type="number"
                value={form.maxTeachers}
                onChange={(e) => setForm({ ...form, maxTeachers: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Max Institutions</label>
              <input
                type="number"
                value={form.maxInstitutions}
                onChange={(e) => setForm({ ...form, maxInstitutions: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              disabled={!form.name || createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingId
                ? 'Update Plan'
                : 'Create Plan'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}
              className="px-4 py-2 bg-slate-700 text-slate-300 text-sm rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-slate-400">Failed to load subscription plans</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Retry</button>
        </div>
      ) : !plans || plans.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No subscription plans yet. Create your first plan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan: any) => (
            <div
              key={plan.id}
              className={`bg-slate-800 border rounded-xl p-6 transition-colors ${
                plan.isActive ? 'border-slate-700 hover:border-slate-600' : 'border-slate-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleActiveMutation.mutate({ id: plan.id, isActive: plan.isActive })}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {plan.isActive ? (
                    <ToggleRight className="w-6 h-6 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-500" />
                  )}
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <IndianRupee className="w-4 h-4 text-slate-400" />
                  <span className="text-2xl font-bold text-slate-100">
                    {Number(plan.monthlyPrice).toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-slate-400">/month</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  ₹{Number(plan.annualPrice).toLocaleString('en-IN')}/year
                </p>
              </div>

              <div className="space-y-2 mb-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{plan.maxStudents} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{plan.maxTeachers} teachers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{plan.maxInstitutions} institutions</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <span className="text-xs text-slate-500">
                  {plan._count?.subscriptions || 0} active subscriptions
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {deleteConfirm === plan.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteMutation.mutate(plan.id)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-500/10 rounded-lg transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(plan.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

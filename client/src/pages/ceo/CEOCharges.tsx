import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DollarSign, RefreshCw, Check, X, Clock, AlertTriangle,
  Filter, BadgeCheck, Calendar, Receipt, Trash2, CreditCard,
  TrendingUp, TrendingDown, ArrowRight,
} from 'lucide-react'
import api from '@/services/api'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  paid: { label: 'Paid', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: BadgeCheck },
  unpaid: { label: 'Unpaid', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: Clock },
  overdue: { label: 'Overdue', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', icon: X },
}

export function CEOCharges() {
  const queryClient = useQueryClient()
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [payCharge, setPayCharge] = useState<string | null>(null)
  const [payForm, setPayForm] = useState({ paymentMethod: 'online', transactionId: '', receiptNumber: '' })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { data: charges, isLoading } = useQuery({
    queryKey: ['ceo-charges', filterStatus, filterType],
    queryFn: () => {
      const params = new URLSearchParams()
      if (filterStatus) params.set('status', filterStatus)
      if (filterType) params.set('type', filterType)
      return api.get(`/ceo/charges?${params}`).then((res) => res.data)
    },
  })

  const { data: stats } = useQuery({
    queryKey: ['ceo-charge-stats'],
    queryFn: () => api.get('/ceo/charges/stats').then((res) => res.data),
  })

  const payMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; status: string; paidAmount: number; paymentMethod: string; transactionId: string; receiptNumber: string }) =>
      api.patch(`/ceo/charges/${id}/status`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-charges'] })
      queryClient.invalidateQueries({ queryKey: ['ceo-charge-stats'] })
      setPayCharge(null)
      setPayForm({ paymentMethod: 'online', transactionId: '', receiptNumber: '' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/ceo/charges/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceo-charges'] })
      queryClient.invalidateQueries({ queryKey: ['ceo-charge-stats'] })
      setDeleteConfirm(null)
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  // Pay modal
  if (payCharge) {
    const charge = charges?.find((c: any) => c.id === payCharge)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Confirm Payment</h1>
            <p className="text-slate-400 text-sm mt-1">{charge?.title}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setPayCharge(null)} className="px-4 py-2 bg-slate-700 text-slate-300 text-sm rounded-lg hover:bg-slate-600 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => payMutation.mutateAsync({ id: payCharge, status: 'paid', paidAmount: charge?.amount || 0, ...payForm })}
              disabled={payMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Check className="w-4 h-4" />
              {payMutation.isPending ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-sm text-green-300">Amount to Pay</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(charge?.amount || 0)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Payment Method</label>
              <select value={payForm.paymentMethod} onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                <option value="online">Online</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="net_banking">Net Banking</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Transaction ID</label>
              <input type="text" value={payForm.transactionId} onChange={(e) => setPayForm({ ...payForm, transactionId: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Receipt Number</label>
              <input type="text" value={payForm.receiptNumber} onChange={(e) => setPayForm({ ...payForm, receiptNumber: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-500" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Charges & Payments</h1>
        <p className="text-slate-500 text-sm mt-1">Auto-generated charges based on activated plan and role pricing</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-blue-600">Total Charges</p>
              <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalAmount)}</p>
            <p className="text-xs text-slate-500 mt-1">{stats.totalCharges} total</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-green-600">Paid</p>
              <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</p>
            <p className="text-xs text-slate-500 mt-1">{stats.paidCharges} paid</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-amber-600">Unpaid</p>
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.unpaidAmount)}</p>
            <p className="text-xs text-slate-500 mt-1">{stats.unpaidCharges} unpaid</p>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-red-600">Overdue</p>
              <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.overdueCharges}</p>
            <p className="text-xs text-slate-500 mt-1">overdue</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-slate-500" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="overdue">Overdue</option>
        </select>
        {(filterStatus || filterType) && (
          <button onClick={() => { setFilterStatus(''); setFilterType('') }} className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Clear</button>
        )}
      </div>

      {/* Charges List */}
      {charges && charges.length > 0 ? (
        <div className="space-y-3">
          {charges.map((charge: any) => {
            const statusCfg = STATUS_CONFIG[charge.status] || STATUS_CONFIG.unpaid
            const StatusIcon = statusCfg.icon
            const isOverdue = charge.status === 'unpaid' && charge.dueDate && new Date(charge.dueDate) < new Date()

            return (
              <div key={charge.id} className={`bg-white border rounded-xl p-5 transition-all hover:border-slate-300 ${
                isOverdue ? 'border-red-300' : 'border-slate-200'
              }`}>
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div className={`w-12 h-12 rounded-xl ${statusCfg.bg} border ${statusCfg.border} flex items-center justify-center shrink-0`}>
                    <StatusIcon className={`w-6 h-6 ${statusCfg.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-slate-800 font-semibold truncate">{charge.title}</h3>
                        {charge.description && (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{charge.description}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xl font-bold ${charge.type === 'discount' ? 'text-green-600' : 'text-slate-800'}`}>{charge.type === 'discount' ? '-' : ''}{formatCurrency(charge.amount)}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      {charge.plan && (
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{charge.plan.name} plan</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Due: {formatDate(charge.dueDate)}</span>
                      </div>
                      {charge.paidAt && (
                        <div className="flex items-center gap-1 text-green-400">
                          <Check className="w-3.5 h-3.5" />
                          <span>Paid: {formatDate(charge.paidAt)}</span>
                        </div>
                      )}
                      {charge.paymentMethod && (
                        <span className="text-slate-400 capitalize">{charge.paymentMethod.replace('_', ' ')}</span>
                      )}
                      {charge.receiptNumber && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Receipt className="w-3.5 h-3.5" />
                          <span>{charge.receiptNumber}</span>
                        </div>
                      )}
                      <span className="text-slate-600 capitalize">{charge.billingPeriod || 'one-time'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {charge.status !== 'paid' && (
                      <button
                        onClick={() => setPayCharge(charge.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Pay Now
                      </button>
                    )}
                    {charge.status !== 'paid' && (
                      deleteConfirm === charge.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => deleteMutation.mutate(charge.id)} disabled={deleteMutation.isPending}
                            className="px-2 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-2 bg-slate-700 text-slate-400 rounded-lg text-xs hover:bg-slate-600 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(charge.id)}
                          className="px-2 py-2 bg-slate-700/50 text-slate-400 hover:text-red-400 rounded-lg text-xs transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">No Charges Yet</h2>
          <p className="text-slate-500 mb-2">
            {filterStatus ? 'No charges match this filter.' : 'Charges are auto-generated when you activate a plan.'}
          </p>
          {!filterStatus && (
            <p className="text-sm text-slate-500">Go to Plan & Subscription and activate a plan to generate charges.</p>
          )}
        </div>
      )}
    </div>
  )
}

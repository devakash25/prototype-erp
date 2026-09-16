import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import {
  RefreshCw,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  CreditCard,
  AlertCircle,
  Loader2,
} from 'lucide-react'

function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'PARTIAL':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'PENDING':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'OVERDUE':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

export function ParentFees() {
  const [searchParams] = useSearchParams()
  const childId = searchParams.get('childId') || ''

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-fees', childId],
    queryFn: async () => {
      const res = await api.get(`/parent/fees?childId=${childId}`)
      return res.data
    },
    enabled: !!childId,
  })

  const summary = data?.summary || {}
  const structure = data?.structure || []
  const payments = data?.payments || []
  const dueReminders = data?.dueReminders || []

  if (!childId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-gray-400">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg">Select a child to view fees</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-400">Failed to load fee data</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fees</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Fee details and payment history</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const pending = summary.pending ?? 0
              if (pending <= 0) {
                window.alert('No pending fees to pay.')
                return
              }
              const confirmed = window.confirm(`Pay ₹${pending.toLocaleString('en-IN')} pending fees? This will redirect to the payment gateway.`)
              if (confirmed) {
                window.alert('Payment gateway integration coming soon. Your payment request has been noted.')
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            <CreditCard className="h-4 w-4" /> Pay Now
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Fee', value: `₹${(summary.totalFee ?? 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-blue-400 bg-blue-900/30' },
          { label: 'Paid', value: `₹${(summary.paid ?? 0).toLocaleString('en-IN')}`, icon: CheckCircle2, color: 'text-green-400 bg-green-900/30' },
          { label: 'Pending', value: `₹${(summary.pending ?? 0).toLocaleString('en-IN')}`, icon: Clock, color: 'text-yellow-400 bg-yellow-900/30' },
          { label: 'Overdue', value: `₹${(summary.overdue ?? 0).toLocaleString('en-IN')}`, icon: AlertTriangle, color: 'text-red-400 bg-red-900/30' },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                {isLoading ? (
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{card.value}</p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fee Structure */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fee Structure</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Component</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={3} className="px-5 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : structure.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">No fee structure available</td>
                </tr>
              ) : (
                structure.map((fee: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{fee.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 text-right font-medium">₹{(fee.amount ?? 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{fee.type || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Due Date Reminders */}
      {dueReminders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" /> Due Date Reminders
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {dueReminders.map((r: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50">
                <Clock className="h-4 w-4 text-yellow-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">{r.message}</span>
                </div>
                {r.dueDate && (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 shrink-0">
                    Due: {new Date(r.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Method</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Receipt No.</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-5 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No payment records found</p>
                  </td>
                </tr>
              ) : (
                payments.map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {p.date ? new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-gray-100 text-right">₹{(p.amount ?? 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{p.method || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">{p.receiptNumber || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

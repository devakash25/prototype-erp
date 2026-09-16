import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, AlertCircle, DollarSign, CheckCircle2, Clock, FileText, Download, CreditCard } from 'lucide-react'

export function StudentFees() {
  const { data: feeData, loading, error, refetch } = useApi<any>('/student/fees')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
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

  const totalPaid = feeData?.totalPaid ?? 0
  const totalDue = feeData?.totalDue ?? 0
  const totalPending = feeData?.totalPending ?? 0
  const payments = feeData?.feePayments ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fee Payments</h1>
          <p className="text-slate-400 text-sm">View your fee payment history and outstanding amounts</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, icon: CheckCircle2, color: 'text-green-400 bg-green-500/10' },
          { label: 'Total Due', value: `₹${totalDue.toLocaleString()}`, icon: Clock, color: 'text-red-400 bg-red-500/10' },
          { label: 'Pending', value: `₹${totalPending.toLocaleString()}`, icon: DollarSign, color: 'text-yellow-400 bg-yellow-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Fee Type</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Amount</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-5 bg-slate-700 rounded animate-pulse" /></td></tr>
                ))
              ) : !payments.length ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-lg">No payment records</p>
                </td></tr>
              ) : (
                payments.map((pay: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-white">{pay.feeStructure?.name || pay.feeType || '—'}</td>
                    <td className="px-5 py-4 text-sm text-white text-center">₹{pay.amount?.toLocaleString()}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full',
                        pay.status === 'PAID' && 'bg-green-500/10 text-green-400',
                        pay.status === 'PENDING' && 'bg-yellow-500/10 text-yellow-400',
                        pay.status === 'PARTIAL' && 'bg-orange-500/10 text-orange-400',
                        pay.status === 'FAILED' && 'bg-red-500/10 text-red-400'
                      )}>{pay.status}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{pay.paymentDate ? new Date(pay.paymentDate).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{pay.paymentMethod || '—'}</td>
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

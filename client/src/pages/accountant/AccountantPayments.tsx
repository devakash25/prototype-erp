import { useState, useEffect } from 'react'
import {
  RefreshCw, CheckCircle2, XCircle, AlertCircle,
  CreditCard, Clock, Shield, Loader2, X, Filter,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import api from '@/services/api'
import { format } from 'date-fns'

export function AccountantPayments() {
  const [activeTab, setActiveTab] = useState('pending')
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [verifyModal, setVerifyModal] = useState<{ open: boolean; payment: any; action: 'verify' | 'reject' }>({
    open: false, payment: null, action: 'verify',
  })
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => { loadPayments() }, [activeTab])

  const loadPayments = async () => {
    setLoading(true)
    try {
      const res = await api.get('/accountant/pending-verifications', {
        params: { status: activeTab === 'all' ? undefined : activeTab },
      })
      setPayments(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === payments.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(payments.map((p) => p.id))
    }
  }

  const openVerifyModal = (payment: any) => {
    setVerifyModal({ open: true, payment, action: 'verify' })
    setRejectReason('')
  }

  const openRejectModal = (payment: any) => {
    setVerifyModal({ open: true, payment, action: 'reject' })
    setRejectReason('')
  }

  const handleVerify = async () => {
    setProcessing(true)
    try {
      await api.post(`/accountant/verify-payment/${verifyModal.payment.id}`, {
        status: 'PAID',
      })
      setSuccessMessage('Payment verified successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
      setVerifyModal({ open: false, payment: null, action: 'verify' })
      loadPayments()
    } catch (err: any) {
      console.error(err)
    }
    setProcessing(false)
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    setProcessing(true)
    try {
      await api.post(`/accountant/verify-payment/${verifyModal.payment.id}`, {
        status: 'FAILED',
        notes: rejectReason,
      })
      setSuccessMessage('Payment rejected')
      setTimeout(() => setSuccessMessage(''), 3000)
      setVerifyModal({ open: false, payment: null, action: 'reject' })
      loadPayments()
    } catch (err: any) {
      console.error(err)
    }
    setProcessing(false)
  }

  const handleBatchVerify = async () => {
    if (selectedIds.length === 0) return
    setProcessing(true)
    try {
      await Promise.all(
        selectedIds.map((id) =>
          api.post(`/accountant/verify-payment/${id}`, { status: 'PAID' })
        )
      )
      setSuccessMessage(`${selectedIds.length} payment(s) verified successfully`)
      setTimeout(() => setSuccessMessage(''), 3000)
      setSelectedIds([])
      loadPayments()
    } catch (err) {
      console.error(err)
    }
    setProcessing(false)
  }

  const getMethodBadge = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'CASH': return 'bg-green-100 text-green-700'
      case 'ONLINE': case 'UPI': return 'bg-blue-100 text-blue-700'
      case 'CHEQUE': return 'bg-purple-100 text-purple-700'
      case 'CARD': return 'bg-indigo-100 text-indigo-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED': case 'APPROVED': return 'bg-green-100 text-green-700'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'REJECTED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const tabs = [
    { value: 'pending', label: 'Pending', icon: Clock, count: payments.filter((p) => p.status?.toUpperCase() === 'PENDING').length },
    { value: 'verified', label: 'Verified', icon: CheckCircle2 },
    { value: 'all', label: 'All', icon: Filter },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Verification</h1>
          <p className="text-gray-500 text-sm">Verify and manage student payments</p>
        </div>
        <button
          onClick={loadPayments}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Tabs & Batch Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 border-b border-gray-100 pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setActiveTab(tab.value); setSelectedIds([]) }}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                  activeTab === tab.value
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-600 rounded-full">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {selectedIds.length > 0 && activeTab !== 'verified' && (
            <button
              onClick={handleBatchVerify}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              Verify Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No payments found</p>
            <p className="text-sm mt-1">No payments match the current filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  {activeTab !== 'verified' && (
                    <th className="px-5 py-3 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === payments.length && payments.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                  )}
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Student</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Method</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Transaction ID</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    {activeTab !== 'verified' && (
                      <td className="px-5 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(payment.id)}
                          onChange={() => toggleSelect(payment.id)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                    )}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700">
                          {payment.studentName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{payment.studentName}</p>
                          <p className="text-xs text-gray-500">{payment.admissionNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-green-600 text-right">
                      {formatCurrency(payment.amount || 0)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', getMethodBadge(payment.method))}>
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 font-mono">{payment.transactionId || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {payment.date ? format(new Date(payment.date), 'MMM dd, yyyy') : '—'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', getStatusBadge(payment.status))}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {payment.status?.toUpperCase() === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openVerifyModal(payment)}
                            className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                            title="Verify"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openRejectModal(payment)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verify / Reject Modal */}
      {verifyModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => !processing && setVerifyModal({ open: false, payment: null, action: 'verify' })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {verifyModal.action === 'verify' ? 'Verify Payment' : 'Reject Payment'}
              </h2>
              <button
                onClick={() => !processing && setVerifyModal({ open: false, payment: null, action: 'verify' })}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {verifyModal.payment && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-900">{verifyModal.payment.studentName}</p>
                <p className="text-sm text-gray-500">{verifyModal.payment.admissionNumber}</p>
                <p className="text-lg font-bold text-green-600 mt-1">
                  {formatCurrency(verifyModal.payment.amount || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Transaction: {verifyModal.payment.transactionId || 'N/A'} &bull; {verifyModal.payment.method}
                </p>
              </div>
            )}

            {verifyModal.action === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  disabled={processing}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setVerifyModal({ open: false, payment: null, action: 'verify' })}
                disabled={processing}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={verifyModal.action === 'verify' ? handleVerify : handleReject}
                disabled={processing || (verifyModal.action === 'reject' && !rejectReason.trim())}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-lg disabled:opacity-50',
                  verifyModal.action === 'verify'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                )}
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : verifyModal.action === 'verify' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {verifyModal.action === 'verify' ? 'Confirm Verify' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountantPayments

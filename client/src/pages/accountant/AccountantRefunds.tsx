import { useState, useEffect } from 'react'
import {
  RefreshCw, CheckCircle2, XCircle, AlertCircle,
  RotateCcw, Clock, Loader2, X, Filter,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import api from '@/services/api'
import { format } from 'date-fns'

export function AccountantRefunds() {
  const [activeTab, setActiveTab] = useState('pending')
  const [refunds, setRefunds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processModal, setProcessModal] = useState<{ open: boolean; refund: any; action: 'approve' | 'reject' }>({
    open: false, refund: null, action: 'approve',
  })
  const [reason, setReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => { loadRefunds() }, [activeTab])

  const loadRefunds = async () => {
    setLoading(true)
    try {
      const res = await api.get('/accountant/refunds', {
        params: { status: activeTab === 'all' ? undefined : activeTab },
      })
      setRefunds(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const openApproveModal = (refund: any) => {
    setProcessModal({ open: true, refund, action: 'approve' })
    setReason('')
  }

  const openRejectModal = (refund: any) => {
    setProcessModal({ open: true, refund, action: 'reject' })
    setReason('')
  }

  const handleProcess = async () => {
    setProcessing(true)
    try {
      await api.post(`/accountant/refunds/${processModal.refund.id}/process`, {
        action: processModal.action,
        reason: reason || undefined,
      })
      setSuccessMessage(
        processModal.action === 'approve'
          ? 'Refund approved successfully'
          : 'Refund rejected'
      )
      setTimeout(() => setSuccessMessage(''), 3000)
      setProcessModal({ open: false, refund: null, action: 'approve' })
      loadRefunds()
    } catch (err: any) {
      console.error(err)
    }
    setProcessing(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'bg-green-100 text-green-700'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'REJECTED': return 'bg-red-100 text-red-700'
      case 'PROCESSED': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const tabs = [
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'approved', label: 'Approved', icon: CheckCircle2 },
    { value: 'rejected', label: 'Rejected', icon: XCircle },
    { value: 'all', label: 'All', icon: Filter },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Refunds</h1>
          <p className="text-gray-500 text-sm">Manage and process refund requests</p>
        </div>
        <button
          onClick={loadRefunds}
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

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex gap-2 border-b border-gray-100 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                activeTab === tab.value
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
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
        ) : refunds.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <RotateCcw className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No refund requests found</p>
            <p className="text-sm mt-1">No refunds match the current filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Student</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Reason</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {refunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700">
                          {refund.studentName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{refund.studentName}</p>
                          <p className="text-xs text-gray-500">{refund.admissionNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-red-600 text-right">
                      {formatCurrency(refund.amount || 0)}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700 max-w-xs truncate" title={refund.reason}>
                        {refund.reason || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {refund.date ? format(new Date(refund.date), 'MMM dd, yyyy') : '—'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', getStatusBadge(refund.status))}>
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {refund.status?.toUpperCase() === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openApproveModal(refund)}
                            className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openRejectModal(refund)}
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

      {/* Process Modal */}
      {processModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => !processing && setProcessModal({ open: false, refund: null, action: 'approve' })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {processModal.action === 'approve' ? 'Approve Refund' : 'Reject Refund'}
              </h2>
              <button
                onClick={() => !processing && setProcessModal({ open: false, refund: null, action: 'approve' })}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {processModal.refund && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-900">{processModal.refund.studentName}</p>
                <p className="text-sm text-gray-500">{processModal.refund.admissionNumber}</p>
                <p className="text-lg font-bold text-red-600 mt-1">
                  {formatCurrency(processModal.refund.amount || 0)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Reason:</span> {processModal.refund.reason || 'No reason provided'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Requested: {processModal.refund.date ? format(new Date(processModal.refund.date), 'MMM dd, yyyy') : '—'}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {processModal.action === 'approve' ? 'Notes (optional)' : 'Rejection Reason'}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={processModal.action === 'approve' ? 'Add notes...' : 'Enter reason for rejection...'}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                disabled={processing}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setProcessModal({ open: false, refund: null, action: 'approve' })}
                disabled={processing}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProcess}
                disabled={processing || (processModal.action === 'reject' && !reason.trim())}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-lg disabled:opacity-50',
                  processModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                )}
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : processModal.action === 'approve' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {processModal.action === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountantRefunds

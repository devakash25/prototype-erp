import { useState, useEffect } from 'react'
import {
  Search, RefreshCw, ChevronDown, ChevronUp,
  CreditCard, CheckCircle2, X, Loader2, AlertCircle,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import api from '@/services/api'

export function AccountantCollections() {
  const [search, setSearch] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'CASH',
    transactionId: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => { loadStudents() }, [search])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const res = await api.get('/accountant/students', { params: { search } })
      setStudents(res.data.data?.students || res.data.data || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const openCollectModal = (student: any) => {
    setSelectedStudent(student)
    setPaymentForm({ amount: student.due?.toString() || '', method: 'CASH', transactionId: '', notes: '' })
    setSubmitError('')
    setSubmitSuccess(false)
    setShowModal(true)
  }

  const handleCollectFee = async () => {
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      setSubmitError('Please enter a valid amount')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      await api.post('/accountant/collect-fees', {
        studentId: selectedStudent.id,
        feeStructureId: selectedStudent.feeStructureId || selectedStudent.id,
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.method,
        transactionId: paymentForm.transactionId || undefined,
        notes: paymentForm.notes || undefined,
      })
      setSubmitSuccess(true)
      setTimeout(() => {
        setShowModal(false)
        loadStudents()
      }, 1500)
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to collect fee')
    }
    setSubmitting(false)
  }

  const paymentMethods = [
    { value: 'CASH', label: 'Cash' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'DD', label: 'Demand Draft' },
    { value: 'UPI', label: 'UPI' },
    { value: 'CARD', label: 'Card' },
  ]

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID': return 'bg-green-100 text-green-700'
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-700'
      case 'PENDING': return 'bg-red-100 text-red-700'
      case 'OVERDUE': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Collection</h1>
          <p className="text-gray-500 text-sm">Search students and collect fees</p>
        </div>
        <button
          onClick={loadStudents}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, admission number, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Student Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-48" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-lg">No students found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          students.map((student) => (
            <div key={student.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(student.id)}
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-700">
                  {student.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.admissionNumber} &bull; {student.course}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Outstanding</p>
                  <p className={cn('text-lg font-bold', (student.outstandingAmount || 0) > 0 ? 'text-red-600' : 'text-green-600')}>
                    {formatCurrency(student.outstandingAmount || 0)}
                  </p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shrink-0" onClick={(e) => { e.stopPropagation(); openCollectModal(student) }}>
                  Collect Fee
                </button>
                {expandedId === student.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                )}
              </div>

              {expandedId === student.id && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <div className="pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Fee Structure Breakdown</h3>
                    {student.feeStructure && student.feeStructure.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Fee Name</th>
                              <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Amount</th>
                              <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Paid</th>
                              <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Due</th>
                              <th className="text-center py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {student.feeStructure.map((fee: any, idx: number) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="py-3 text-sm font-medium text-gray-900">{fee.name}</td>
                                <td className="py-3 text-sm text-gray-600 text-right">{formatCurrency(fee.amount || 0)}</td>
                                <td className="py-3 text-sm text-green-600 font-medium text-right">{formatCurrency(fee.paid || 0)}</td>
                                <td className="py-3 text-sm text-red-600 font-medium text-right">{formatCurrency(fee.due || 0)}</td>
                                <td className="py-3 text-center">
                                  <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', getStatusColor(fee.status))}>
                                    {fee.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 py-2">No fee structure available</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Collect Fee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => !submitting && setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Collect Fee</h2>
              <button
                onClick={() => !submitting && setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {selectedStudent && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-900">{selectedStudent.name}</p>
                <p className="text-sm text-gray-500">{selectedStudent.admissionNumber} &bull; {selectedStudent.course}</p>
                <p className="text-sm text-red-600 mt-1">Outstanding: {formatCurrency(selectedStudent.outstandingAmount || 0)}</p>
              </div>
            )}

            {submitSuccess ? (
              <div className="flex flex-col items-center py-6">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <p className="text-lg font-semibold text-gray-900">Fee Collected Successfully!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={submitting}
                  >
                    {paymentMethods.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {paymentForm.method !== 'CASH' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                    <input
                      type="text"
                      value={paymentForm.transactionId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                      placeholder="Enter transaction ID"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={submitting}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    placeholder="Optional notes"
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    disabled={submitting}
                  />
                </div>

                {submitError && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{submitError}</p>
                )}

                <button
                  onClick={handleCollectFee}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Collect Fee
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountantCollections

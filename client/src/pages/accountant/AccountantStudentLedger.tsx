import { useState, useEffect } from 'react'
import {
  Search, RefreshCw, ChevronDown, ChevronUp, Filter,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import api from '@/services/api'

export function AccountantStudentLedger() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [students, setStudents] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => { loadStudents() }, [search, statusFilter, page])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const res = await api.get('/accountant/students', {
        params: { search, status: statusFilter === 'all' ? undefined : statusFilter, page, limit: 20 },
      })
      const data = res.data.data
      if (Array.isArray(data)) {
        setStudents(data)
        setTotalPages(1)
      } else {
        setStudents(data.students || data.items || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const loadPaymentHistory = async (studentId: string) => {
    setLoadingHistory(true)
    try {
      const res = await api.get(`/accountant/students/${studentId}/payments`)
      setPaymentHistory(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
    setLoadingHistory(false)
  }

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      setPaymentHistory([])
    } else {
      setExpandedId(id)
      loadPaymentHistory(id)
    }
  }

  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
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
          <h1 className="text-2xl font-bold text-gray-900">Student Fee Ledger</h1>
          <p className="text-gray-500 text-sm">View student fee details and payment history</p>
        </div>
        <button
          onClick={loadStudents}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or admission number..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4 border-b border-gray-100 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1) }}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                statusFilter === tab.value
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
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
        ) : students.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Filter className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No students found</p>
            <p className="text-sm mt-1">Try a different search or filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Student</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Admission No</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Course</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total Fees</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Paid</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Due</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student) => (
                  <>
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggleExpand(student.id)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700">
                            {student.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 font-mono">{student.admissionNumber}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{student.course}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 text-right">{formatCurrency(student.totalFees || 0)}</td>
                      <td className="px-5 py-4 text-sm text-green-600 font-medium text-right">{formatCurrency(student.paid || 0)}</td>
                      <td className="px-5 py-4 text-sm text-red-600 font-medium text-right">{formatCurrency(student.due || 0)}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', getStatusColor(student.status))}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          {expandedId === student.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedId === student.id && (
                      <tr key={`${student.id}-detail`}>
                        <td colSpan={8} className="px-5 pb-5">
                          <div className="bg-gray-50 rounded-xl p-4 mt-1">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Payment History</h4>
                            {loadingHistory ? (
                              <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                  <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
                                ))}
                              </div>
                            ) : paymentHistory.length === 0 ? (
                              <p className="text-sm text-gray-500 py-2">No payment history found</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-gray-200">
                                      <th className="text-left py-2 text-xs font-medium text-gray-500">Date</th>
                                      <th className="text-left py-2 text-xs font-medium text-gray-500">Fee Name</th>
                                      <th className="text-right py-2 text-xs font-medium text-gray-500">Amount</th>
                                      <th className="text-left py-2 text-xs font-medium text-gray-500">Method</th>
                                      <th className="text-left py-2 text-xs font-medium text-gray-500">Receipt</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {paymentHistory.map((payment: any, idx: number) => (
                                      <tr key={idx} className="hover:bg-gray-100">
                                        <td className="py-2 text-sm text-gray-700">
                                          {payment.date ? new Date(payment.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="py-2 text-sm text-gray-700">{payment.feeName || '—'}</td>
                                        <td className="py-2 text-sm text-green-600 font-medium text-right">{formatCurrency(payment.amount || 0)}</td>
                                        <td className="py-2 text-sm text-gray-600">{payment.method || '—'}</td>
                                        <td className="py-2 text-sm text-gray-600 font-mono">{payment.receiptNumber || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountantStudentLedger

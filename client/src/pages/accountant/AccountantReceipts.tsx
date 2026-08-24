import { useState, useEffect } from 'react'
import {
  Search, RefreshCw, Printer, ArrowLeft, Download,
  Receipt, FileText, Clock, CheckCircle2, X,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import api from '@/services/api'
import { format } from 'date-fns'

export function AccountantReceipts() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [receipts, setReceipts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => { loadReceipts() }, [search, activeTab])

  const loadReceipts = async () => {
    setLoading(true)
    try {
      const res = await api.get('/accountant/receipts', {
        params: { search, filter: activeTab === 'all' ? undefined : activeTab },
      })
      setReceipts(res.data.data?.payments || res.data.data || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const viewReceipt = async (id: string) => {
    setLoadingDetail(true)
    try {
      const res = await api.get(`/accountant/receipts/${id}`)
      setSelectedReceipt(res.data.data)
    } catch (err) {
      console.error(err)
    }
    setLoadingDetail(false)
  }

  const getMethodBadge = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'CASH': return 'bg-green-100 text-green-700'
      case 'ONLINE': case 'UPI': return 'bg-blue-100 text-blue-700'
      case 'CHEQUE': return 'bg-purple-100 text-purple-700'
      case 'CARD': return 'bg-indigo-100 text-indigo-700'
      case 'DD': return 'bg-amber-100 text-amber-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': case 'PAID': return 'bg-green-100 text-green-700'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'FAILED': case 'CANCELLED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const tabs = [
    { value: 'all', label: 'All', icon: FileText },
    { value: 'recent', label: 'Recent', icon: Clock },
    { value: 'downloaded', label: 'Downloaded', icon: Download },
  ]

  const filteredReceipts = receipts

  if (selectedReceipt) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Receipt Details</h1>
              <p className="text-gray-500 text-sm">Receipt #{selectedReceipt.receiptNumber}</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        {loadingDetail ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm">
            <div className="flex flex-col items-center">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
              <p className="text-gray-500">Loading receipt details...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <Receipt className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">Fee Receipt</p>
                    <p className="text-sm text-gray-500">{selectedReceipt.institutionName || 'Institution'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Receipt No.</p>
                  <p className="text-lg font-bold font-mono text-gray-900">{selectedReceipt.receiptNumber}</p>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Student Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Name</span>
                    <span className="text-sm font-medium text-gray-900">{selectedReceipt.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Admission No.</span>
                    <span className="text-sm font-medium text-gray-900 font-mono">{selectedReceipt.admissionNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Course</span>
                    <span className="text-sm font-medium text-gray-900">{selectedReceipt.course}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Class</span>
                    <span className="text-sm font-medium text-gray-900">{selectedReceipt.className || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Payment Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(selectedReceipt.amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Payment Method</span>
                    <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', getMethodBadge(selectedReceipt.paymentMethod))}>
                      {selectedReceipt.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Transaction ID</span>
                    <span className="text-sm font-medium text-gray-900 font-mono">{selectedReceipt.transactionId || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedReceipt.date ? format(new Date(selectedReceipt.date), 'MMM dd, yyyy') : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', getStatusBadge(selectedReceipt.status))}>
                      {selectedReceipt.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedReceipt.feeItems && selectedReceipt.feeItems.length > 0 && (
              <div className="p-6 border-t">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Fee Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Fee Name</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedReceipt.feeItems.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2 text-sm text-gray-700">{item.name}</td>
                          <td className="py-2 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.amount || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedReceipt.notes && (
              <div className="p-6 border-t">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-1">Notes</h3>
                <p className="text-sm text-gray-600">{selectedReceipt.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
          <p className="text-gray-500 text-sm">View and manage payment receipts</p>
        </div>
        <button
          onClick={loadReceipts}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by receipt number or student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 mt-4 border-b border-gray-100 pb-0">
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
        ) : filteredReceipts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No receipts found</p>
            <p className="text-sm mt-1">Try a different search or filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Receipt #</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Student</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Method</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-indigo-600 font-mono">{receipt.receiptNumber}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700">
                          {receipt.studentName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{receipt.studentName}</p>
                          <p className="text-xs text-gray-500">{receipt.admissionNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-green-600 text-right">
                      {formatCurrency(receipt.amount || 0)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {receipt.date ? format(new Date(receipt.date), 'MMM dd, yyyy') : '—'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', getMethodBadge(receipt.paymentMethod))}>
                        {receipt.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', getStatusBadge(receipt.status))}>
                        {receipt.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => viewReceipt(receipt.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-indigo-600"
                        title="View Receipt"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountantReceipts

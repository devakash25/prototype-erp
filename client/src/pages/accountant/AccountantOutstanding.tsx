import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Search, RefreshCw, AlertCircle, Users,
  IndianRupee, Clock, AlertTriangle, ChevronDown, ChevronUp,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import api from '@/services/api'

function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return 'bg-green-100 text-green-700'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700'
    case 'OVERDUE':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export function AccountantOutstanding() {
  const [dues, setDues] = useState([])
  const [loading, setLoading] = useState(true)
  const [courseFilter, setCourseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortField, setSortField] = useState('daysOverdue')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    fetchDues()
  }, [courseFilter, statusFilter, dateFrom, dateTo])

  const fetchDues = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (courseFilter) params.course = courseFilter
      if (statusFilter !== 'ALL') params.status = statusFilter
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      const res = await api.get('/accountant/outstanding-dues', { params })
      setDues(res.data.data?.students || res.data.data || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const sortedDues = [...dues].sort((a: any, b: any) => {
    let valA = a[sortField]
    let valB = b[sortField]
    if (typeof valA === 'string') valA = valA.toLowerCase()
    if (typeof valB === 'string') valB = valB.toLowerCase()
    if (valA < valB) return sortDir === 'asc' ? -1 : 1
    if (valA > valB) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const totalOutstanding = dues.reduce((sum: number, d: any) => sum + (d.amountDue || 0), 0)
  const studentsWithDues = new Set(dues.map((d: any) => d.studentId)).size
  const oldestDue = dues.length > 0
    ? Math.max(...dues.map((d: any) => d.daysOverdue || 0))
    : 0
  const overdueAmount = dues
    .filter((d: any) => d.status?.toUpperCase() === 'OVERDUE')
    .reduce((sum: number, d: any) => sum + (d.amountDue || 0), 0)

  const courses = [...new Set(dues.map((d: any) => d.course).filter(Boolean))]

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 ml-1 inline" />
      : <ChevronDown className="w-3 h-3 ml-1 inline" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outstanding Dues</h1>
          <p className="text-gray-500 text-sm">Track pending and overdue fee payments</p>
        </div>
        <button
          onClick={fetchDues}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <IndianRupee className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Outstanding</p>
              {loading ? (
                <div className="h-7 w-20 bg-gray-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Students with Dues</p>
              {loading ? (
                <div className="h-7 w-10 bg-gray-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-amber-600">{studentsWithDues}</p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Oldest Due</p>
              {loading ? (
                <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-purple-600">{oldestDue} days</p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue Amount</p>
              {loading ? (
                <div className="h-7 w-20 bg-gray-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(overdueAmount)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Course</label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Courses</option>
              {courses.map((c: string) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          {(courseFilter || statusFilter !== 'ALL' || dateFrom || dateTo) && (
            <button
              onClick={() => { setCourseFilter(''); setStatusFilter('ALL'); setDateFrom(''); setDateTo('') }}
              className="mt-5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Outstanding Dues List</h2>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : sortedDues.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No outstanding dues found</p>
            <p className="text-gray-400 text-sm mt-1">All fees are up to date</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th
                    className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('studentName')}
                  >
                    Student <SortIcon field="studentName" />
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Admission No
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Course
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Fee Type
                  </th>
                  <th
                    className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('amountDue')}
                  >
                    Amount Due <SortIcon field="amountDue" />
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Due Date
                  </th>
                  <th
                    className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('daysOverdue')}
                  >
                    Days Overdue <SortIcon field="daysOverdue" />
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedDues.map((due: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{due.studentName}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 font-mono">{due.admissionNumber}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{due.course}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{due.feeType}</td>
                    <td className="px-5 py-4 text-sm text-red-600 font-semibold text-right">{formatCurrency(due.amountDue || 0)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {due.dueDate ? format(new Date(due.dueDate), 'MMM dd, yyyy') : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-right">
                      <span className={cn(due.daysOverdue > 0 ? 'text-red-600' : 'text-green-600')}>
                        {due.daysOverdue || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', getStatusBadge(due.status))}>
                        {due.status}
                      </span>
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

export default AccountantOutstanding

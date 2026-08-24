import { useState } from 'react'
import { Workflow, CheckCircle, Clock, XCircle, AlertTriangle, Download } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn, exportToCSV } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { StatsSkeleton } from '@/components/LoadingSkeleton'

const statusColors: Record<string, string> = {
  APPROVED: 'bg-green-100 text-green-700', PENDING: 'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-red-100 text-red-700', IN_PROGRESS: 'bg-blue-100 text-blue-700',
}

export function WorkflowAnalytics() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const dateParams = new URLSearchParams()
  if (fromDate) dateParams.append('from', fromDate)
  if (toDate) dateParams.append('to', toDate)
  const queryString = dateParams.toString()
  const statsUrl = `/analytics/workflow/stats${queryString ? `?${queryString}` : ''}`
  const categoriesUrl = `/analytics/workflow/categories${queryString ? `?${queryString}` : ''}`
  const trendUrl = `/analytics/workflow/approval-trend${queryString ? `?${queryString}` : ''}`
  const recentUrl = `/analytics/workflow/recent${queryString ? `?${queryString}` : ''}`
  const { data: stats, loading: statsLoading } = useApi(statsUrl)
  const { data: categories } = useApi(categoriesUrl)
  const { data: approvalTrend } = useApi(trendUrl)
  const { data: recent } = useApi(recentUrl)
  const s = stats || { total: 0, approved: 0, pending: 0, rejected: 0, avgApprovalTime: 0 }

  const handleExportCSV = () => {
    if (!recent || !recent.length) return
    exportToCSV(recent, 'workflow-recent-requests')
  }

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Workflow Analytics</h1><p className="text-sm text-gray-500">Approval workflows, requests, and processing times</p></div>
        <StatsSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Analytics</h1>
          <p className="text-sm text-gray-500">Approval workflows, requests, and processing times</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter fromDate={fromDate} toDate={toDate} onFromDateChange={setFromDate} onToDateChange={setToDate} />
          <button onClick={handleExportCSV} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Workflow className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-gray-900">{s.total}</p><p className="text-xs text-gray-500">Total Requests</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold text-green-600">{s.approved}</p><p className="text-xs text-gray-500">Approved</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div><div><p className="text-2xl font-bold text-yellow-600">{s.pending}</p><p className="text-xs text-gray-500">Pending</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-red-100 rounded-lg"><XCircle className="w-5 h-5 text-red-600" /></div><div><p className="text-2xl font-bold text-red-600">{s.rejected}</p><p className="text-xs text-gray-500">Rejected</p></div></div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Requests by Category</h3><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={categories || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count">{(categories || []).map((_: any, i: number) => <Cell key={i} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Monthly Approval Trend</h3><ResponsiveContainer width="100%" height={280}><BarChart data={approvalTrend || []}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="approved" fill="#10b981" name="Approved" radius={[4, 4, 0, 0]} /><Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} /><Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Recent Requests</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr><th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Title</th><th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Category</th><th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Submitted By</th><th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-100">{(recent || []).map((req: any) => <tr key={req.id} className="hover:bg-gray-50"><td className="px-5 py-3 text-sm text-gray-500">{req.id}</td><td className="px-5 py-3 text-sm font-medium text-gray-900">{req.title}</td><td className="px-5 py-3 text-sm text-gray-600">{req.category}</td><td className="px-5 py-3 text-sm text-gray-600">{req.submittedBy}</td><td className="px-5 py-3"><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColors[req.status])}>{req.status}</span></td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

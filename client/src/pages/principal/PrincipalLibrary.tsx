import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw, BookOpen, FolderOpen, AlertTriangle, Clock,
  BookMarked, IndianRupee, AlertCircle,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function PrincipalLibrary() {
  const { data, loading, error, refetch } = useApi<any>('/principal/library')

  const totalBooks = data?.totalBooks || 0
  const totalCategories = data?.totalCategories || 0
  const activeIssues = data?.activeIssues || 0
  const overdueIssues = data?.overdueIssues || 0
  const totalIssuedEver = data?.totalIssuedEver || 0
  const categories = data?.categories || []
  const recentIssues = data?.recentIssues || []

  const categoryPieData = categories.map((cat: any) => ({
    name: cat.category,
    value: cat.count,
  }))

  function getStatusStyle(status: string) {
    switch (status?.toUpperCase()) {
      case 'ISSUED': return 'bg-blue-900/30 text-blue-400'
      case 'RETURNED': return 'bg-green-900/30 text-green-400'
      case 'OVERDUE': return 'bg-red-900/30 text-red-400'
      case 'LOST': return 'bg-slate-700 text-slate-400'
      default: return 'bg-slate-700 text-slate-500'
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

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
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-slate-400 text-sm">{error}</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4" />Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Library Management</h1>
          <p className="text-slate-400 text-sm">Books inventory, issues & returns overview</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{totalBooks}</p>
              <p className="text-xs text-slate-500">Total Books</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-900/30 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-400">{totalCategories}</p>
              <p className="text-xs text-slate-500">Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{activeIssues}</p>
              <p className="text-xs text-slate-500">Active Issues</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{overdueIssues}</p>
              <p className="text-xs text-slate-500">Overdue Issues</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{totalIssuedEver}</p>
              <p className="text-xs text-slate-500">Total Issued Ever</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Categories</h2>
            <div className="space-y-2">
              {categories.length === 0 && (
                <p className="text-sm text-slate-500">No categories found</p>
              )}
              {categories.map((cat: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50">
                  <span className="text-sm text-slate-300">{cat.category}</span>
                  <span className="text-sm font-medium text-white">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {categoryPieData.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h2 className="text-lg font-semibold text-white mb-4">Category Breakdown</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryPieData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc' }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#94a3b8', fontSize: 11 }}
                    formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700">
          <div className="p-5 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Recent Issues</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-400">Book Title</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-400">Issued To</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-400">Issue Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-400">Due Date</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-400">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-400">Fine</th>
                </tr>
              </thead>
              <tbody>
                {recentIssues.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No recent issues
                    </td>
                  </tr>
                )}
                {recentIssues.map((issue: any) => (
                  <tr key={issue.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-white">{issue.book?.title}</p>
                      <p className="text-xs text-slate-500">{issue.book?.author}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {issue.student?.user?.fullName || issue.employee?.user?.fullName || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{formatDate(issue.issueDate)}</td>
                    <td className="py-3 px-4 text-slate-300">{formatDate(issue.dueDate)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        getStatusStyle(issue.status)
                      )}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {issue.fine > 0 ? (
                        <span className="flex items-center justify-end gap-0.5 text-sm font-medium text-red-400">
                          <IndianRupee className="w-3 h-3" />{issue.fine}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

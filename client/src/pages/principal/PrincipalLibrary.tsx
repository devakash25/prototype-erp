import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw, BookOpen, FolderOpen, AlertTriangle, Clock,
  BookMarked, IndianRupee
} from 'lucide-react'

export function PrincipalLibrary() {
  const { data, loading, error, refetch } = useApi<any>('/principal/library')

  const totalBooks = data?.totalBooks || 0
  const totalCategories = data?.totalCategories || 0
  const activeIssues = data?.activeIssues || 0
  const overdueIssues = data?.overdueIssues || 0
  const totalIssuedEver = data?.totalIssuedEver || 0
  const categories = data?.categories || []
  const recentIssues = data?.recentIssues || []

  function getStatusStyle(status: string) {
    switch (status?.toUpperCase()) {
      case 'ISSUED': return 'bg-blue-100 text-blue-700'
      case 'RETURNED': return 'bg-green-100 text-green-700'
      case 'OVERDUE': return 'bg-red-100 text-red-700'
      case 'LOST': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Library Management</h1>
          <p className="text-gray-500 text-sm">Books inventory, issues & returns overview</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          Failed to load library data. Please try again.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{totalBooks}</p>
              <p className="text-xs text-gray-500">Total Books</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-700">{totalCategories}</p>
              <p className="text-xs text-gray-500">Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{activeIssues}</p>
              <p className="text-xs text-gray-500">Active Issues</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{overdueIssues}</p>
              <p className="text-xs text-gray-500">Overdue Issues</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{totalIssuedEver}</p>
              <p className="text-xs text-gray-500">Total Issued Ever</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
          <div className="space-y-2">
            {categories.length === 0 && (
              <p className="text-sm text-gray-500">No categories found</p>
            )}
            {categories.map((cat: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <span className="text-sm text-gray-700">{cat.category}</span>
                <span className="text-sm font-medium text-gray-900">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Issues</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Book Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Issued To</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Issue Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Due Date</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Fine</th>
                </tr>
              </thead>
              <tbody>
                {recentIssues.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      No recent issues
                    </td>
                  </tr>
                )}
                {recentIssues.map((issue: any) => (
                  <tr key={issue.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{issue.book?.title}</p>
                      <p className="text-xs text-gray-500">{issue.book?.author}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {issue.student?.user?.fullName || issue.employee?.user?.fullName || '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{formatDate(issue.issueDate)}</td>
                    <td className="py-3 px-4 text-gray-700">{formatDate(issue.dueDate)}</td>
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
                        <span className="flex items-center justify-end gap-0.5 text-sm font-medium text-red-600">
                          <IndianRupee className="w-3 h-3" />{issue.fine}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
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

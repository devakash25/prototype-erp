import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  AlertCircle,
  BookOpen,
  IndianRupee,
} from 'lucide-react'

function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case 'ISSUED':
      return 'bg-blue-100 text-blue-700'
    case 'RETURNED':
      return 'bg-green-100 text-green-700'
    case 'OVERDUE':
      return 'bg-red-100 text-red-700'
    case 'LOST':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function StudentLibrary() {
  const { data, loading, error, refetch } = useApi('/student/library')

  const books = data?.books ?? []
  const summary = data?.summary ?? {}

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600">Failed to load library data</p>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Library</h1>
          <p className="text-gray-500 text-sm">Your issued books and history</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Issued', value: summary.totalIssued ?? 0, color: 'text-blue-600 bg-blue-50' },
          { label: 'Currently Issued', value: summary.currentlyIssued ?? 0, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Overdue', value: summary.overdue ?? 0, color: 'text-red-600 bg-red-50' },
          { label: 'Total Fine', value: `₹${summary.totalFine ?? 0}`, color: 'text-amber-600 bg-amber-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', stat.color)}>
                {stat.label === 'Total Fine' ? (
                  <IndianRupee className="h-5 w-5" />
                ) : (
                  <BookOpen className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                {loading ? (
                  <div className="h-7 w-12 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Issued Books</h2>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !books.length ? (
          <div className="text-center py-16 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No books issued</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Author</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Issue Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Return Date</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Fine</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {books.map((book: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{book.title}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{book.author || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatDate(book.issueDate)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatDate(book.dueDate)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatDate(book.returnDate)}</td>
                    <td className="px-5 py-4 text-sm text-right">
                      {book.fine > 0 ? (
                        <span className="flex items-center justify-end gap-0.5 font-medium text-red-600">
                          <IndianRupee className="w-3 h-3" />{book.fine}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', getStatusBadge(book.status))}>
                        {book.status}
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

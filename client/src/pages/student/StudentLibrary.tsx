import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, AlertCircle, BookOpen, Clock, CheckCircle2, AlertTriangle, Search } from 'lucide-react'

export function StudentLibrary() {
  const { data: libData, loading, error, refetch } = useApi<any>('/student/library')

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
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-400">{error}</p>
        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    )
  }

  const issuedBooks = libData?.issuedBooks ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Library</h1>
          <p className="text-slate-400 text-sm">View issued books and library status</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Issued', value: issuedBooks.length, icon: BookOpen, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Currently Issued', value: issuedBooks.filter((b: any) => b.status === 'ISSUED').length, icon: Clock, color: 'text-yellow-400 bg-yellow-500/10' },
          { label: 'Returned', value: issuedBooks.filter((b: any) => b.status === 'RETURNED').length, icon: CheckCircle2, color: 'text-green-400 bg-green-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Books Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Issued Books</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Book Title</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Author</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Issued</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Due</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-5 bg-slate-700 rounded animate-pulse" /></td></tr>
                ))
              ) : !issuedBooks.length ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-lg">No books issued</p>
                </td></tr>
              ) : (
                issuedBooks.map((book: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-white">{book.bookCopy?.book?.title || book.title || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{book.bookCopy?.book?.author || book.author || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{book.issueDate ? new Date(book.issueDate).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{book.dueDate ? new Date(book.dueDate).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full',
                        book.status === 'ISSUED' && 'bg-yellow-500/10 text-yellow-400',
                        book.status === 'RETURNED' && 'bg-green-500/10 text-green-400',
                        book.status === 'OVERDUE' && 'bg-red-500/10 text-red-400'
                      )}>{book.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

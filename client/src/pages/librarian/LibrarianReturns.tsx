import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { RotateCcw, RefreshCw, Search, DollarSign } from 'lucide-react'

export function LibrarianReturns() {
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: issues, isLoading } = useQuery({
    queryKey: ['lib-returns', search],
    queryFn: () => api.get('/librarian/issues', { params: { status: 'issued' } }).then(r => r.data),
  })

  const returnMut = useMutation({
    mutationFn: (id: string) => api.patch(`/librarian/issues/${id}/return`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lib-returns'] }),
  })

  const renewMut = useMutation({
    mutationFn: (id: string) => api.patch(`/librarian/issues/${id}/renew`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lib-returns'] }),
  })

  const filtered = (issues || []).filter((i: any) => {
    if (!search) return true
    const s = search.toLowerCase()
    return i.book?.title?.toLowerCase().includes(s) || i.student?.user?.fullName?.toLowerCase().includes(s) || i.employee?.user?.fullName?.toLowerCase().includes(s)
  })

  const getDaysLeft = (due: string) => {
    const d = Math.ceil((new Date(due).getTime() - Date.now()) / 86400000)
    return d
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><RotateCcw className="w-6 h-6" /> Return / Renew Books</h1>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by book title or member name..." className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
      </div>

      {isLoading ? <p className="text-gray-400">Loading...</p> : filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No active issues found</p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((i: any) => {
            const daysLeft = getDaysLeft(i.dueDate)
            const isOverdue = daysLeft < 0
            return (
              <div key={i.id} className={`p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800 ${isOverdue ? 'border-red-300 dark:border-red-800' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium dark:text-white">{i.book?.title || 'Unknown Book'}</p>
                    <p className="text-sm text-gray-500">by {i.book?.author || 'Unknown'} • Issued to: {i.student?.user?.fullName || i.employee?.user?.fullName || 'Unknown'}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>Issued: {new Date(i.issueDate).toLocaleDateString()}</span>
                      <span>Due: {new Date(i.dueDate).toLocaleDateString()}</span>
                      {i.returnDate && <span>Returned: {new Date(i.returnDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isOverdue && (
                      <div className="text-right">
                        <p className="text-xs text-red-500">{Math.abs(daysLeft)} days overdue</p>
                        {i.fine > 0 && <p className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1"><DollarSign className="w-3 h-3" />₹{i.fine}</p>}
                      </div>
                    )}
                    {!isOverdue && <span className="text-sm text-green-600 dark:text-green-400">{daysLeft} days left</span>}
                    <button onClick={() => renewMut.mutate(i.id)} disabled={renewMut.isPending} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Renew 14 days">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm('Confirm return?')) returnMut.mutate(i.id) }} disabled={returnMut.isPending} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                      Return
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { AlertTriangle, DollarSign } from 'lucide-react'

export function LibrarianOverdue() {
  const qc = useQueryClient()

  const { data: overdue, isLoading } = useQuery({
    queryKey: ['lib-overdue'],
    queryFn: () => api.get('/librarian/overdue').then(r => r.data),
  })

  const collectMut = useMutation({
    mutationFn: (id: string) => api.post(`/librarian/fines/${id}/collect`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lib-overdue'] }),
  })

  const totalFine = (overdue || []).reduce((s: number, i: any) => s + (Number(i.fine) || 0), 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-red-500" /> Overdue Books</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Overdue Books</p>
          <p className="text-2xl font-bold dark:text-white">{(overdue || []).length}</p>
        </div>
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Total Pending Fines</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-1"><DollarSign className="w-5 h-5" />{totalFine.toLocaleString()}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800"><tr>
            <th className="px-4 py-3 text-left dark:text-gray-300">Book</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Member</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Issue Date</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Due Date</th>
            <th className="px-4 py-3 text-center dark:text-gray-300">Days Overdue</th>
            <th className="px-4 py-3 text-right dark:text-gray-300">Fine</th>
            <th className="px-4 py-3 text-right dark:text-gray-300">Action</th>
          </tr></thead>
          <tbody className="divide-y dark:divide-gray-700">
            {isLoading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr> :
              (overdue || []).length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No overdue books</td></tr> :
              (overdue || []).sort((a: any, b: any) => {
                const da = Math.abs(Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000))
                const db = Math.abs(Math.ceil((new Date(b.dueDate).getTime() - Date.now()) / 86400000))
                return db - da
              }).map((i: any) => {
                const daysOver = Math.abs(Math.ceil((new Date(i.dueDate).getTime() - Date.now()) / 86400000))
                return (
                  <tr key={i.id} className="dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 dark:text-white">{i.book?.title || '-'}</td>
                    <td className="px-4 py-3 dark:text-gray-300">{i.student?.user?.fullName || i.employee?.user?.fullName || '-'}</td>
                    <td className="px-4 py-3 dark:text-gray-400 text-xs">{new Date(i.issueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 dark:text-gray-400 text-xs">{new Date(i.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center"><span className="px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">{daysOver} days</span></td>
                    <td className="px-4 py-3 text-right font-medium text-red-600 dark:text-red-400">₹{Number(i.fine || 0)}</td>
                    <td className="px-4 py-3 text-right">
                      {!i.finePaid ? (
                        <button onClick={() => collectMut.mutate(i.id)} disabled={collectMut.isPending} className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs">
                          Collect Fine
                        </button>
                      ) : <span className="text-xs text-green-600 dark:text-green-400">Paid</span>}
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

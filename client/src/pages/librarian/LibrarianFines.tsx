import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { DollarSign } from 'lucide-react'

export function LibrarianFines() {
  const [filter, setFilter] = useState('')
  const qc = useQueryClient()

  const { data: fines, isLoading } = useQuery({
    queryKey: ['lib-fines'],
    queryFn: () => api.get('/librarian/fines').then(r => r.data),
  })

  const collectMut = useMutation({
    mutationFn: (id: string) => api.post(`/librarian/fines/${id}/collect`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lib-fines'] }),
  })

  const list = (fines?.fines || []).filter((f: any) => {
    if (filter === 'paid') return f.finePaid
    if (filter === 'unpaid') return !f.finePaid
    return true
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><DollarSign className="w-6 h-6" /> Fine Management</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Total Fines</p>
          <p className="text-2xl font-bold dark:text-white">₹{fines?.total || 0}</p>
        </div>
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Collected</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{fines?.collected || 0}</p>
        </div>
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{fines?.pending || 0}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['', 'paid', 'unpaid'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}>{f || 'All'}</button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800"><tr>
            <th className="px-4 py-3 text-left dark:text-gray-300">Member</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Book</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Issue Date</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Return Date</th>
            <th className="px-4 py-3 text-center dark:text-gray-300">Days Late</th>
            <th className="px-4 py-3 text-right dark:text-gray-300">Fine</th>
            <th className="px-4 py-3 text-center dark:text-gray-300">Status</th>
            <th className="px-4 py-3 text-right dark:text-gray-300">Action</th>
          </tr></thead>
          <tbody className="divide-y dark:divide-gray-700">
            {isLoading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr> :
              list.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No fines found</td></tr> :
              list.map((f: any) => (
                <tr key={f.id} className="dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 dark:text-white">{f.student?.user?.fullName || f.employee?.user?.fullName || '-'}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{f.book?.title || '-'}</td>
                  <td className="px-4 py-3 dark:text-gray-400 text-xs">{new Date(f.issueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 dark:text-gray-400 text-xs">{f.returnDate ? new Date(f.returnDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-center dark:text-gray-300">{f.returnDate ? Math.max(0, Math.ceil((new Date(f.returnDate).getTime() - new Date(f.dueDate).getTime()) / 86400000)) : '-'}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-600 dark:text-red-400">₹{Number(f.fine || 0)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${f.finePaid ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                      {f.finePaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!f.finePaid && <button onClick={() => collectMut.mutate(f.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs">Collect</button>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

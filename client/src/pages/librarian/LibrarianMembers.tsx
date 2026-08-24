import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { Users, Search } from 'lucide-react'

export function LibrarianMembers() {
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data: members, isLoading } = useQuery({
    queryKey: ['lib-members', role, search],
    queryFn: () => api.get('/librarian/members', { params: { role, search } }).then(r => r.data),
  })

  const { data: memberIssues } = useQuery({
    queryKey: ['lib-member-issues', expanded],
    queryFn: () => api.get('/librarian/issues', { params: {} }).then(r => (r.data || []).filter((i: any) => i.studentId === expanded || i.employeeId === expanded)),
    enabled: !!expanded,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><Users className="w-6 h-6" /> Library Members</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..." className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
        </div>
        <div className="flex gap-2">
          {['', 'STUDENT', 'EMPLOYEE'].map(r => (
            <button key={r} onClick={() => setRole(r)} className={`px-3 py-1.5 rounded-lg text-sm ${role === r ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}>{r || 'All'}</button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800"><tr>
            <th className="px-4 py-3 text-left dark:text-gray-300">Name</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Email</th>
            <th className="px-4 py-3 text-center dark:text-gray-300">Role</th>
            <th className="px-4 py-3 text-center dark:text-gray-300">Active Issues</th>
            <th className="px-4 py-3 text-center dark:text-gray-300">Total Issues</th>
            <th className="px-4 py-3 text-right dark:text-gray-300">Total Fines</th>
          </tr></thead>
          <tbody className="divide-y dark:divide-gray-700">
            {isLoading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr> :
              (members || []).length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No members found</td></tr> :
              (members || []).map((m: any) => {
                const name = m.user?.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Unknown'
                return (
                  <tr key={m.id} onClick={() => setExpanded(expanded === m.id ? null : m.id)} className="cursor-pointer dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 dark:text-white font-medium">{name}</td>
                    <td className="px-4 py-3 dark:text-gray-400 text-xs">{m.user?.email || m.email || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${m.user?.role === 'STUDENT' || m.role === 'STUDENT' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}>
                        {m.user?.role || m.role || 'Student'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center dark:text-gray-300">{m.activeIssues || 0}</td>
                    <td className="px-4 py-3 text-center dark:text-gray-300">{m.totalIssues || 0}</td>
                    <td className="px-4 py-3 text-right dark:text-gray-300">₹{Number(m.totalFines || 0)}</td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {expanded && memberIssues && (
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-medium dark:text-white mb-3">Issue History</h3>
          {memberIssues.length === 0 ? <p className="text-gray-400 text-sm">No issues found</p> : (
            <div className="space-y-2">
              {memberIssues.map((i: any) => (
                <div key={i.id} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700/50 text-sm">
                  <span className="dark:text-white">{i.book?.title || 'Unknown'}</span>
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span>{new Date(i.issueDate).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full ${i.status === 'returned' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : i.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'}`}>{i.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

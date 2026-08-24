import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { BookPlus, Search, User, ArrowRight } from 'lucide-react'

export function LibrarianIssueBook() {
  const [bookSearch, setBookSearch] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedBook, setSelectedBook] = useState<any>(null)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const qc = useQueryClient()

  const { data: books } = useQuery({
    queryKey: ['lib-book-search', bookSearch],
    queryFn: () => api.get('/librarian/books', { params: { search: bookSearch, availability: 'available' } }).then(r => r.data),
    enabled: bookSearch.length >= 2,
  })

  const { data: members } = useQuery({
    queryKey: ['lib-member-search', memberSearch],
    queryFn: () => api.get('/librarian/members', { params: { search: memberSearch } }).then(r => r.data),
    enabled: memberSearch.length >= 2,
  })

  const issueMut = useMutation({
    mutationFn: () => api.post('/librarian/issues', { bookId: selectedBook.id, ...(selectedMember.role === 'STUDENT' ? { studentId: selectedMember.id } : { employeeId: selectedMember.id }) }),
    onSuccess: () => { setSelectedBook(null); setSelectedMember(null); setBookSearch(''); setMemberSearch(''); qc.invalidateQueries({ queryKey: ['librarian'] }) },
  })

  const { data: recentIssues } = useQuery({
    queryKey: ['lib-recent-issues'],
    queryFn: () => api.get('/librarian/issues', { params: { status: 'issued' } }).then(r => r.data),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><BookPlus className="w-6 h-6" /> Issue Book</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-medium dark:text-white">Select Book</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={bookSearch} onChange={e => { setBookSearch(e.target.value); setSelectedBook(null) }} placeholder="Search by title or ISBN..." className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
          </div>
          {books && !selectedBook && (
            <div className="max-h-48 overflow-y-auto border dark:border-gray-700 rounded-lg divide-y dark:divide-gray-700">
              {books.length === 0 ? <p className="p-3 text-sm text-gray-400">No books found</p> :
                books.map((b: any) => (
                  <button key={b.id} onClick={() => { setSelectedBook(b); setBookSearch(b.title) }} className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center">
                    <div><p className="text-sm font-medium dark:text-white">{b.title}</p><p className="text-xs text-gray-500">{b.author}</p></div>
                    <span className="text-xs text-green-600 dark:text-green-400">{b.availableCopies} avail</span>
                  </button>
                ))}
            </div>
          )}
          {selectedBook && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="font-medium dark:text-green-300">{selectedBook.title}</p>
              <p className="text-sm text-green-700 dark:text-green-400">{selectedBook.author} • {selectedBook.availableCopies} copies available</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="font-medium dark:text-white">Select Member</h3>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={memberSearch} onChange={e => { setMemberSearch(e.target.value); setSelectedMember(null) }} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
          </div>
          {members && !selectedMember && (
            <div className="max-h-48 overflow-y-auto border dark:border-gray-700 rounded-lg divide-y dark:divide-gray-700">
              {members.length === 0 ? <p className="p-3 text-sm text-gray-400">No members found</p> :
                members.map((m: any) => (
                  <button key={m.id} onClick={() => { setSelectedMember(m); setMemberSearch(m.user?.fullName || m.fullName || '') }} className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800">
                    <p className="text-sm font-medium dark:text-white">{m.user?.fullName || m.fullName || `${m.firstName} ${m.lastName}`}</p>
                    <p className="text-xs text-gray-500">{m.user?.email || m.email} • {m.role || 'Student'}</p>
                  </button>
                ))}
            </div>
          )}
          {selectedMember && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="font-medium dark:text-blue-300">{selectedMember.user?.fullName || selectedMember.fullName || `${selectedMember.firstName} ${selectedMember.lastName}`}</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">{selectedMember.user?.email || selectedMember.email}</p>
            </div>
          )}
        </div>
      </div>

      {selectedBook && selectedMember && (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
          <ArrowRight className="w-5 h-5 text-indigo-600" />
          <p className="text-sm dark:text-indigo-300">Issue <strong>{selectedBook.title}</strong> to <strong>{selectedMember.user?.fullName || selectedMember.fullName}</strong>?</p>
          <button onClick={() => issueMut.mutate()} disabled={issueMut.isPending} className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
            {issueMut.isPending ? 'Issuing...' : 'Confirm Issue'}
          </button>
        </div>
      )}

      <div>
        <h3 className="font-medium dark:text-white mb-3">Recent Issues</h3>
        <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800"><tr>
              <th className="px-4 py-3 text-left dark:text-gray-300">Book</th>
              <th className="px-4 py-3 text-left dark:text-gray-300">Member</th>
              <th className="px-4 py-3 text-left dark:text-gray-300">Issue Date</th>
              <th className="px-4 py-3 text-left dark:text-gray-300">Due Date</th>
            </tr></thead>
            <tbody className="divide-y dark:divide-gray-700">
              {(recentIssues || []).slice(0, 5).map((i: any) => (
                <tr key={i.id}>
                  <td className="px-4 py-3 dark:text-white">{i.book?.title || '-'}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{i.student?.user?.fullName || i.employee?.user?.fullName || '-'}</td>
                  <td className="px-4 py-3 dark:text-gray-400 text-xs">{new Date(i.issueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 dark:text-gray-400 text-xs">{new Date(i.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

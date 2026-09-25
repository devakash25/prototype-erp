import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { BookOpen, Plus, Search, Edit2, Trash2, X, Check } from 'lucide-react'

export function LibrarianBooks() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [availability, setAvailability] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editBook, setEditBook] = useState<any>(null)
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: '', publisher: '', publishYear: '', edition: '', language: 'English', totalCopies: '3', location: '', rack: '' })
  const qc = useQueryClient()

  const { data: books, isLoading } = useQuery({
    queryKey: ['librarian-books', search, category, availability],
    queryFn: () => api.get('/librarian/books', { params: { search, category, availability } }).then(r => r.data?.data ?? r.data),
  })

  const createMut = useMutation({
    mutationFn: (data: any) => api.post('/librarian/books', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['librarian-books'] }); setShowForm(false); resetForm() },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch(`/librarian/books/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['librarian-books'] }); setEditBook(null); resetForm() },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/librarian/books/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['librarian-books'] }),
  })

  const resetForm = () => setForm({ title: '', author: '', isbn: '', category: '', publisher: '', publishYear: '', edition: '', language: 'English', totalCopies: '3', location: '', rack: '' })

  const handleSubmit = () => {
    const data = { ...form, totalCopies: parseInt(form.totalCopies) || 3, publishYear: form.publishYear ? parseInt(form.publishYear) : null }
    if (editBook) updateMut.mutate({ id: editBook.id, ...data })
    else createMut.mutate(data)
  }

  const startEdit = (b: any) => { setEditBook(b); setForm({ title: b.title, author: b.author, isbn: b.isbn || '', category: b.category, publisher: b.publisher || '', publishYear: b.publishYear?.toString() || '', edition: b.edition || '', language: b.language || 'English', totalCopies: b.totalCopies.toString(), location: b.location || '', rack: b.rack || '' }); setShowForm(true) }

  const categories = ['Fiction', 'Science', 'Mathematics', 'History', 'Computer Science', 'Literature', 'Physics', 'Chemistry', 'Biology', 'Economics']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Library Books</h1>
        <button onClick={() => { resetForm(); setEditBook(null); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Book
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, author..." className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={availability} onChange={e => setAvailability(e.target.value)} className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm">
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      {showForm && (
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold dark:text-white">{editBook ? 'Edit Book' : 'Add New Book'}</h3>
            <button onClick={() => { setShowForm(false); setEditBook(null) }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['title', 'author', 'isbn', 'category', 'publisher', 'publishYear', 'edition', 'language', 'totalCopies', 'location', 'rack'] as const).map(f => (
              <div key={f}>
                <label className="block text-xs font-medium dark:text-gray-400 mb-1 capitalize">{f.replace(/([A-Z])/g, ' $1')}</label>
                {f === 'category' ? (
                  <select value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} className="w-full px-3 py-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm">
                    <option value="">Select</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} className="w-full px-3 py-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
                )}
              </div>
            ))}
          </div>
          <button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" /> {editBook ? 'Update' : 'Add'} Book
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800"><tr>
            <th className="px-4 py-3 text-left dark:text-gray-300">Title</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Author</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">ISBN</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Category</th>
            <th className="px-4 py-3 text-center dark:text-gray-300">Total</th>
            <th className="px-4 py-3 text-center dark:text-gray-300">Available</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Location</th>
            <th className="px-4 py-3 text-right dark:text-gray-300">Actions</th>
          </tr></thead>
          <tbody className="divide-y dark:divide-gray-700">
            {isLoading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr> :
              (books || []).length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No books found</td></tr> :
              (books || []).map((b: any) => (
                <tr key={b.id} className="dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 dark:text-white font-medium">{b.title}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{b.author}</td>
                  <td className="px-4 py-3 dark:text-gray-400 font-mono text-xs">{b.isbn || '-'}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300">{b.category}</span></td>
                  <td className="px-4 py-3 text-center dark:text-gray-300">{b.totalCopies}</td>
                  <td className="px-4 py-3 text-center"><span className={`font-medium ${b.availableCopies > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{b.availableCopies}</span></td>
                  <td className="px-4 py-3 dark:text-gray-400 text-xs">{b.location || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(b)} className="p-1 text-gray-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm('Delete this book?')) deleteMut.mutate(b.id) }} className="p-1 text-gray-400 hover:text-red-600 ml-1"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

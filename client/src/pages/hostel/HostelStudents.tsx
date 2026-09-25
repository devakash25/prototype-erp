import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { GraduationCap, Search, ArrowDownRight, ArrowUpRight } from 'lucide-react'

export function HostelStudents() {
  const [hostelId, setHostelId] = useState('')
  const [search, setSearch] = useState('')
  const [showAlloc, setShowAlloc] = useState(false)
  const [allocForm, setAllocForm] = useState({ studentId: '', hostelId: '', roomId: '' })
  const qc = useQueryClient()

  const { data: hostels } = useQuery({ queryKey: ['hostels-list'], queryFn: () => api.get('/hostel/hostels').then(r => r.data?.data ?? r.data) })
  const { data: students, isLoading } = useQuery({
    queryKey: ['hostel-students', hostelId, search],
    queryFn: () => api.get('/hostel/students', { params: { hostelId, search } }).then(r => r.data?.data ?? r.data),
  })

  const { data: rooms } = useQuery({
    queryKey: ['hostel-rooms-for-alloc', allocForm.hostelId],
    queryFn: () => api.get('/hostel/rooms', { params: { hostelId: allocForm.hostelId, availability: 'available' } }).then(r => r.data?.data ?? r.data),
    enabled: !!allocForm.hostelId,
  })

  const allocMut = useMutation({
    mutationFn: (data: any) => api.post('/hostel/allocate', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hostel-students'] }); setShowAlloc(false); setAllocForm({ studentId: '', hostelId: '', roomId: '' }) },
  })

  const deallocMut = useMutation({
    mutationFn: (studentId: string) => api.post(`/hostel/deallocate/${studentId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hostel-students'] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><GraduationCap className="w-6 h-6" /> Hostel Students</h1>
        <button onClick={() => setShowAlloc(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"><ArrowDownRight className="w-4 h-4" /> Allocate Room</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={hostelId} onChange={e => setHostelId(e.target.value)} className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm">
          <option value="">All Hostels</option>
          {(hostels || []).map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
        </div>
      </div>

      {showAlloc && (
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800 space-y-3">
          <h3 className="font-semibold dark:text-white">Allocate Room</h3>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs dark:text-gray-400 mb-1">Student ID</label><input value={allocForm.studentId} onChange={e => setAllocForm({ ...allocForm, studentId: e.target.value })} placeholder="Student UUID" className="w-full px-3 py-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" /></div>
            <div>
              <label className="block text-xs dark:text-gray-400 mb-1">Hostel</label>
              <select value={allocForm.hostelId} onChange={e => setAllocForm({ ...allocForm, hostelId: e.target.value, roomId: '' })} className="w-full px-3 py-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm">
                <option value="">Select</option>
                {(hostels || []).map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs dark:text-gray-400 mb-1">Room</label>
              <select value={allocForm.roomId} onChange={e => setAllocForm({ ...allocForm, roomId: e.target.value })} className="w-full px-3 py-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm">
                <option value="">Select</option>
                {(rooms || []).map((r: any) => <option key={r.id} value={r.id}>{r.roomNumber} ({r.capacity - r.occupied} vacant)</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => allocMut.mutate(allocForm)} disabled={!allocForm.studentId || !allocForm.roomId} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">Allocate</button>
            <button onClick={() => setShowAlloc(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800"><tr>
            <th className="px-4 py-3 text-left dark:text-gray-300">Name</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Roll No</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Department</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Room</th>
            <th className="px-4 py-3 text-left dark:text-gray-300">Hostel</th>
            <th className="px-4 py-3 text-right dark:text-gray-300">Action</th>
          </tr></thead>
          <tbody className="divide-y dark:divide-gray-700">
            {isLoading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr> :
              (students || []).length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No students found</td></tr> :
              (students || []).map((s: any) => (
                <tr key={s.id} className="dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 dark:text-white">{s.user?.fullName || 'Unknown'}</td>
                  <td className="px-4 py-3 dark:text-gray-400 text-xs">{s.rollNumber || '-'}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{s.department?.name || '-'}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{s.room?.roomNumber || <span className="text-gray-500 italic">Not allocated</span>}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{s.hostel?.name || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    {s.hostelId ? (
                      <button onClick={() => { if (confirm('Deallocate this student?')) deallocMut.mutate(s.id) }} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><ArrowUpRight className="w-4 h-4" /></button>
                    ) : null}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

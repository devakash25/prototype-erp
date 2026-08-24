import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw, Search, BookOpen, UserCheck, Plus, Trash2, X
} from 'lucide-react'

export function PrincipalSubjectAllocation() {
  const [search, setSearch] = useState('')
  const [allocateModal, setAllocateModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: allocations, loading, refetch } = useApi<any[]>('/principal/subject-allocations')
  const { data: subjects } = useApi<any[]>('/principal/subjects')
  const { data: teachers } = useApi<any[]>('/principal/teachers')

  const filteredAllocations = (allocations || []).filter((a: any) => {
    if (search) {
      const q = search.toLowerCase()
      return (
        a.subjectName?.toLowerCase().includes(q) ||
        a.subjectCode?.toLowerCase().includes(q) ||
        a.teacherName?.toLowerCase().includes(q) ||
        a.courseName?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const stats = [
    { label: 'Total Subjects', value: subjects?.length || 0, icon: BookOpen, color: 'blue' },
    { label: 'Allocated', value: allocations?.length || 0, icon: UserCheck, color: 'green' },
    {
      label: 'Unallocated',
      value: Math.max(0, (subjects?.length || 0) - (allocations?.length || 0)),
      icon: BookOpen,
      color: 'red',
    },
  ]

  const handleAllocate = async () => {
    if (!selectedSubject || !selectedTeacher) return
    setSubmitting(true)
    try {
      // Get or create a session first
      const sessionRes = await api.get('/analytics/sessions')
      const session = sessionRes.data?.data?.[0]
      if (!session) {
        alert('No academic session found. Please create one first.')
        return
      }
      await api.post('/principal/allocate-subject', {
        subjectId: selectedSubject,
        employeeId: selectedTeacher,
        academicSessionId: session.id,
      })
      refetch()
      setAllocateModal(false)
      setSelectedSubject('')
      setSelectedTeacher('')
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.error?.message || 'Failed to allocate')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeallocate = async (allocationId: string) => {
    if (!confirm('Remove this subject allocation?')) return
    try {
      await api.delete(`/principal/deallocate-subject/${allocationId}`)
      refetch()
    } catch (err: any) {
      console.error(err)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Subject Allocation</h1>
          <p className="text-gray-500 text-sm">Assign teachers to subjects</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
          <button
            onClick={() => { setAllocateModal(true); setSelectedSubject(''); setSelectedTeacher('') }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />Allocate Subject
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', `bg-${s.color}-50`)}>
                <s.icon className={cn('w-5 h-5', `text-${s.color}-600`)} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search allocations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Semester</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAllocations.map((alloc: any) => (
                <tr key={alloc.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{alloc.subjectName}</p>
                      <p className="text-xs text-gray-500">{alloc.subjectCode}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{alloc.courseName}</td>
                  <td className="px-5 py-4 text-sm text-gray-900 font-medium">{alloc.teacherName}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{alloc.semester || '-'}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleDeallocate(alloc.id)}
                      className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAllocations.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">No allocations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {allocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Allocate Subject to Teacher</h3>
              <button onClick={() => setAllocateModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Choose a subject...</option>
                  {(subjects || []).map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - {s.course?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Choose a teacher...</option>
                  {(teachers || []).map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.employeeCode}) - {t.department || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setAllocateModal(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAllocate}
                disabled={!selectedSubject || !selectedTeacher || submitting}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Allocating...' : 'Allocate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

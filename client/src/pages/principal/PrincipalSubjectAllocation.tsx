import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw, Search, BookOpen, UserCheck, Plus, Trash2, X, AlertCircle,
} from 'lucide-react'

const statStyles: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-900/50', text: 'text-blue-400' },
  green: { bg: 'bg-green-900/50', text: 'text-green-400' },
  red: { bg: 'bg-red-900/50', text: 'text-red-400' },
}

export function PrincipalSubjectAllocation() {
  const [search, setSearch] = useState('')
  const [allocateModal, setAllocateModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: allocations, loading, error, refetch } = useApi<any[]>('/principal/subject-allocations')
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Subject Allocation</h1>
            <p className="text-slate-400 text-sm">Assign teachers to subjects</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">Failed to load allocations</p>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            <RefreshCw className="w-4 h-4" />Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Subject Allocation</h1>
          <p className="text-slate-400 text-sm">Assign teachers to subjects</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700"
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
        {stats.map((s) => {
          const style = statStyles[s.color] || statStyles.blue
          return (
            <div key={s.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', style.bg)}>
                  <s.icon className={cn('w-5 h-5', style.text)} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{s.label}</p>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search allocations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-700/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Subject</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Course</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Teacher</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Semester</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredAllocations.map((alloc: any) => (
                <tr key={alloc.id} className="hover:bg-slate-700/50">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-white">{alloc.subjectName}</p>
                      <p className="text-xs text-slate-400">{alloc.subjectCode}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">{alloc.courseName}</td>
                  <td className="px-5 py-4 text-sm text-white font-medium">{alloc.teacherName}</td>
                  <td className="px-5 py-4 text-sm text-slate-300">{alloc.semester || '-'}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleDeallocate(alloc.id)}
                      className="text-xs px-3 py-1.5 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900/70 font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAllocations.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">No allocations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {allocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Allocate Subject to Teacher</h3>
              <button onClick={() => setAllocateModal(false)} className="p-1 hover:bg-slate-700 rounded text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-slate-300 mb-1">Teacher</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="px-4 py-2 text-sm border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700"
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

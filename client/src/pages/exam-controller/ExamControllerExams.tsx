import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  Plus,
  FileText,
  RefreshCw,
  AlertCircle,
  X,
  Calendar,
  GraduationCap,
} from 'lucide-react'

interface Exam {
  id: string
  name: string
  type: string
  startDate: string
  endDate: string
  maxMarks: number
  passingMarks: number
  status: string
  subjectCount: number
}

export function ExamControllerExams() {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['exam-controller-exams'],
    queryFn: async () => {
      const res = await api.get('/exam-controller/exams')
      return res.data?.data ?? res.data
    },
  })

  const createExamMutation = useMutation({
    mutationFn: async (examData: any) => {
      const res = await api.post('/exam-controller/exams', examData)
      return res.data?.data ?? res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-controller-exams'] })
      queryClient.invalidateQueries({ queryKey: ['exam-controller-dashboard'] })
      setShowCreateModal(false)
    },
  })

  if (isLoading) {
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
        <p className="text-lg text-slate-300">Failed to load exams</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const exams: Exam[] = data?.data || data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Exam Management</h1>
          <p className="text-slate-400 text-sm">Create and manage examinations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} /> Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Plus size={16} /> Create Exam
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Exams</p>
              <p className="text-2xl font-bold text-white">{exams.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <GraduationCap className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Published</p>
              <p className="text-2xl font-bold text-white">
                {exams.filter((e) => e.status === 'PUBLISHED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Upcoming</p>
              <p className="text-2xl font-bold text-white">
                {exams.filter((e) => e.status === 'UPCOMING').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Exams Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Start Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">End Date</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-slate-400 uppercase">Max Marks</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-slate-400 uppercase">Passing Marks</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-slate-400 uppercase">Subjects</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-700/50 rounded-lg">
                        <FileText className="h-4 w-4 text-slate-400" />
                      </div>
                      <span className="text-sm font-medium text-white">{exam.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-900/30 text-indigo-400">
                      {exam.type?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {exam.startDate ? new Date(exam.startDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {exam.endDate ? new Date(exam.endDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-white text-center font-medium">{exam.maxMarks}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 text-center">{exam.passingMarks}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 text-center">{exam.subjectCount ?? 0}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        exam.status === 'PUBLISHED'
                          ? 'bg-green-900/30 text-green-400'
                          : exam.status === 'ONGOING'
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : exam.status === 'COMPLETED'
                          ? 'bg-blue-900/30 text-blue-400'
                          : exam.status === 'UPCOMING'
                          ? 'bg-purple-900/30 text-purple-400'
                          : 'bg-slate-700 text-slate-400'
                      )}
                    >
                      {exam.status}
                    </span>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No exams found. Create your first exam.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <CreateExamModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createExamMutation.mutate(data)}
          isSubmitting={createExamMutation.isPending}
          error={createExamMutation.error?.message}
        />
      )}
    </div>
  )
}

function CreateExamModal({
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: {
  onClose: () => void
  onSubmit: (data: any) => void
  isSubmitting: boolean
  error?: string
}) {
  const [form, setForm] = useState({
    name: '',
    type: 'MID_TERM',
    startDate: '',
    endDate: '',
    maxMarks: 100,
    passingMarks: 33,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Plus className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Create New Exam</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Exam Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Mid-Term Examination 2026"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Exam Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MID_TERM">Mid-Term</option>
              <option value="FINAL">Final</option>
              <option value="UNIT_TEST">Unit Test</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Max Marks *</label>
              <input
                type="number"
                required
                min={1}
                value={form.maxMarks}
                onChange={(e) => setForm({ ...form, maxMarks: parseInt(e.target.value) || 100 })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Passing Marks *</label>
              <input
                type="number"
                required
                min={1}
                value={form.passingMarks}
                onChange={(e) => setForm({ ...form, passingMarks: parseInt(e.target.value) || 33 })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Create Exam
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExamControllerExams

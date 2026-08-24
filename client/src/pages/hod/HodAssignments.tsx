import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, FileText, CheckCircle, AlertCircle, Clock, Eye } from 'lucide-react'

export function HodAssignments() {
  const { data, loading, error, refetch } = useApi<any>('/hod/assignments')

  const assignments = data?.assignments || []

  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
    review: { color: 'bg-purple-100 text-purple-700', icon: Eye, label: 'Under Review' },
    graded: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Graded' },
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Active' },
    overdue: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Overdue' },
    completed: { color: 'bg-gray-100 text-gray-700', icon: CheckCircle, label: 'Completed' },
  }

  const getStatus = (assignment: any) => {
    const status = assignment.status?.toLowerCase()
    if (status && statusConfig[status]) return status
    const now = new Date()
    const due = new Date(assignment.dueDate || assignment.deadline)
    if (due < now) return 'overdue'
    return 'pending'
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
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-500 text-sm">All assignments across your department's subjects</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Title</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Due Date</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Submissions</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No assignments found
                  </td>
                </tr>
              )}
              {assignments.map((assignment: any, i: number) => {
                const status = getStatus(assignment)
                const config = statusConfig[status] || statusConfig.active
                const StatusIcon = config.icon
                return (
                  <tr key={assignment.id || i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        <span className="font-medium text-gray-900">{assignment.title || assignment.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {assignment.subject?.name || assignment.subjectName || '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {assignment.dueDate || assignment.deadline
                        ? new Date(assignment.dueDate || assignment.deadline).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">
                      {assignment.submissionsCount ?? assignment.submissions ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1', config.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

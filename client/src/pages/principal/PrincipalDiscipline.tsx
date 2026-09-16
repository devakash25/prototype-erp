import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw, AlertTriangle, ClipboardList, Shield, Filter,
  UserPlus, Calendar, AlertCircle, X,
} from 'lucide-react'

export function PrincipalDiscipline() {
  const [statusFilter, setStatusFilter] = useState('')
  const [assignModal, setAssignModal] = useState<string | null>(null)
  const [assignee, setAssignee] = useState('')
  const [assignComment, setAssignComment] = useState('')

  const { data: discipline, loading: loadingDiscipline, error: errorDiscipline, refetch: refetchDiscipline } =
    useApi<any>('/principal/discipline')

  const { data: teachersData, refetch: refetchTeachers } = useApi<any>('/principal/teachers')

  const employees = teachersData?.employees || teachersData?.teachers || teachersData?.data || []

  const complaintParams = new URLSearchParams({ category: 'academic' })
  if (statusFilter) complaintParams.set('status', statusFilter)
  else complaintParams.set('status', 'OPEN')

  const { data: complaintsData, loading: loadingComplaints, error: errorComplaints, refetch: refetchComplaints } =
    useApi<any>(`/principal/helpdesk?${complaintParams.toString()}`, [statusFilter])

  const complaints = complaintsData?.complaints || complaintsData?.tickets || []

  function getPriorityStyle(priority: string) {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-500/15 text-red-400'
      case 'HIGH': return 'bg-orange-500/15 text-orange-400'
      case 'MEDIUM': return 'bg-yellow-500/15 text-yellow-400'
      case 'LOW': return 'bg-emerald-500/15 text-emerald-400'
      default: return 'bg-slate-500/15 text-slate-400'
    }
  }

  function getStatusStyle(status: string) {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'bg-blue-500/15 text-blue-400'
      case 'IN_PROGRESS': return 'bg-yellow-500/15 text-yellow-400'
      case 'RESOLVED': return 'bg-emerald-500/15 text-emerald-400'
      case 'CLOSED': return 'bg-slate-500/15 text-slate-400'
      case 'ESCALATED': return 'bg-red-500/15 text-red-400'
      default: return 'bg-slate-500/15 text-slate-400'
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  async function handleAssign(complaintId: string) {
    if (!assignee) {
      alert('Please select an assignee')
      return
    }
    try {
      await api.post(`/principal/helpdesk/${complaintId}/action`, {
        action: 'assign',
        assigneeId: assignee,
        comments: assignComment,
      })
      setAssignModal(null)
      setAssignee('')
      setAssignComment('')
      refetchComplaints()
    } catch (e) {
      console.error(e)
    }
  }

  const loading = loadingDiscipline || loadingComplaints

  if (loading && !discipline && !complaintsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  if ((errorDiscipline || errorComplaints) && !discipline && !complaintsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Discipline & Complaints</h1>
            <p className="text-slate-400 text-sm">Monitor campus discipline & manage complaints</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-lg bg-red-500/15 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-white font-medium mb-1">Failed to load data</p>
          <p className="text-slate-400 text-sm mb-4">{errorDiscipline || errorComplaints}</p>
          <button
            onClick={() => { refetchDiscipline(); refetchComplaints() }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white hover:bg-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Discipline & Complaints</h1>
          <p className="text-slate-400 text-sm">Monitor campus discipline & manage complaints</p>
        </div>
        <button
          onClick={() => { refetchDiscipline(); refetchComplaints() }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{discipline?.openComplaints || 0}</p>
              <p className="text-xs text-slate-400">Open Complaints</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{discipline?.resolvedThisMonth || 0}</p>
              <p className="text-xs text-slate-400">Resolved This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400">{discipline?.escalations || 0}</p>
              <p className="text-xs text-slate-400">Escalations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Complaints</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Open</option>
              <option value="OPEN">All Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 font-medium text-slate-400">Title</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Student</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Category</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Priority</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Created</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No complaints found
                  </td>
                </tr>
              )}
              {complaints.map((complaint: any) => (
                <tr key={complaint.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-white">{complaint.title}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {complaint.student?.user?.fullName || complaint.user?.fullName || '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{complaint.category || '—'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      getPriorityStyle(complaint.priority)
                    )}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      getStatusStyle(complaint.status)
                    )}>
                      {complaint.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDate(complaint.createdAt)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED' && (
                      <button
                        onClick={() => { setAssignModal(complaint.id); refetchTeachers() }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-500/15 text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-500/25 transition-colors"
                      >
                        <UserPlus className="w-3 h-3" />Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Assign Complaint</h3>
              <button
                onClick={() => { setAssignModal(null); setAssignee(''); setAssignComment('') }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400">
              Assign this complaint to a team member.
            </p>
            <div className="space-y-3">
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select assignee...</option>
                {employees.map((emp: any) => (
                  <option key={emp.id || emp._id} value={emp.id || emp._id}>
                    {emp.user?.fullName || emp.fullName || emp.name || 'Unknown'}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Add comments (optional)"
                value={assignComment}
                onChange={(e) => setAssignComment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setAssignModal(null); setAssignee(''); setAssignComment('') }}
                className="px-4 py-2 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssign(assignModal)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

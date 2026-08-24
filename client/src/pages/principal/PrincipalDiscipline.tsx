import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw, AlertTriangle, ClipboardList, Shield, Filter,
  UserPlus, Calendar
} from 'lucide-react'

export function PrincipalDiscipline() {
  const [statusFilter, setStatusFilter] = useState('')
  const [assignModal, setAssignModal] = useState<string | null>(null)

  const { data: discipline, loading: loadingDiscipline, error: errorDiscipline, refetch: refetchDiscipline } =
    useApi<any>('/principal/discipline')

  const complaintParams = new URLSearchParams({ category: 'academic' })
  if (statusFilter) complaintParams.set('status', statusFilter)
  else complaintParams.set('status', 'OPEN')

  const { data: complaintsData, loading: loadingComplaints, error: errorComplaints, refetch: refetchComplaints } =
    useApi<any>(`/principal/helpdesk?${complaintParams.toString()}`, [statusFilter])

  const complaints = complaintsData?.complaints || complaintsData?.tickets || []

  function getPriorityStyle(priority: string) {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-100 text-red-700'
      case 'HIGH': return 'bg-orange-100 text-orange-700'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700'
      case 'LOW': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  function getStatusStyle(status: string) {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'bg-blue-100 text-blue-700'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700'
      case 'RESOLVED': return 'bg-green-100 text-green-700'
      case 'CLOSED': return 'bg-gray-100 text-gray-500'
      case 'ESCALATED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  async function handleAssign(complaintId: string) {
    console.log('Assign clicked for complaint:', complaintId)
    setAssignModal(complaintId)
  }

  const loading = loadingDiscipline && loadingComplaints

  if (loading && !discipline && !complaintsData) {
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
          <h1 className="text-2xl font-bold text-gray-900">Discipline & Complaints</h1>
          <p className="text-gray-500 text-sm">Monitor campus discipline & manage complaints</p>
        </div>
        <button
          onClick={() => { refetchDiscipline(); refetchComplaints() }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {(errorDiscipline || errorComplaints) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          Failed to load data. Please try again.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{discipline?.openComplaints || 0}</p>
              <p className="text-xs text-gray-500">Open Complaints</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{discipline?.resolvedThisMonth || 0}</p>
              <p className="text-xs text-gray-500">Resolved This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{discipline?.escalations || 0}</p>
              <p className="text-xs text-gray-500">Escalations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Complaints</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Title</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Priority</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No complaints found
                  </td>
                </tr>
              )}
              {complaints.map((complaint: any) => (
                <tr key={complaint.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{complaint.title}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {complaint.student?.user?.fullName || complaint.user?.fullName || '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{complaint.category || '—'}</td>
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
                  <td className="py-3 px-4 text-gray-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formatDate(complaint.createdAt)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED' && (
                      <button
                        onClick={() => handleAssign(complaint.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Assign Complaint</h3>
              <button
                onClick={() => setAssignModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Assign complaint <strong>{assignModal}</strong> to a team member.
            </p>
            <div className="space-y-3">
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Select assignee...</option>
                <option>Dean of Students</option>
                <option>HOD - Academic</option>
                <option>Student Welfare Officer</option>
              </select>
              <textarea
                placeholder="Add comments (optional)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAssignModal(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Assigning complaint:', assignModal)
                  setAssignModal(null)
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
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

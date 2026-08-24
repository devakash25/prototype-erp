import { useState, useEffect } from 'react'
import { Search, RefreshCw, Eye, CheckCircle2, XCircle, Clock, Filter } from 'lucide-react'
import api from '@/services/api'
import { cn, formatCurrency } from '@/lib/utils'

const statusColors: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  ENROLLED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
}

export function AdmissionApplications() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' })
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { loadApplications() }, [search, statusFilter, page])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admission/applications', {
        params: { search: search || undefined, status: statusFilter === 'ALL' ? undefined : statusFilter, page, limit: 15 },
      })
      setApplications(res.data.data?.admissions || [])
      setTotalPages(res.data.data?.totalPages || 1)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const viewDetail = async (id: string) => {
    try {
      const res = await api.get(`/admission/applications/${id}`)
      setSelectedApp(res.data.data)
    } catch (err) { console.error(err) }
  }

  const handleAction = async (id: string, action: string, reason?: string) => {
    setActionLoading(true)
    try {
      if (action === 'review') await api.post(`/admission/applications/${id}/review`)
      else if (action === 'approve') await api.post(`/admission/applications/${id}/approve`)
      else if (action === 'reject') await api.post(`/admission/applications/${id}/reject`, { reason })
      loadApplications()
      setSelectedApp(null)
      setRejectModal({ open: false, id: '' })
    } catch (err) { console.error(err) }
    setActionLoading(false)
  }

  const tabs = [
    { key: 'ALL', label: 'All' },
    { key: 'APPLIED', label: 'Applied' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'ENROLLED', label: 'Enrolled' },
  ]

  if (selectedApp) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-300">&larr; Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Application {selectedApp.applicationNumber}</h1>
            <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusColors[selectedApp.status] || 'bg-gray-100 text-gray-600')}>
              {selectedApp.status}
            </span>
          </div>
          <div className="flex gap-2">
            {selectedApp.status === 'APPLIED' && (
              <button onClick={() => handleAction(selectedApp.id, 'review')} disabled={actionLoading}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 disabled:opacity-50">
                {actionLoading ? 'Processing...' : 'Start Review'}
              </button>
            )}
            {selectedApp.status === 'UNDER_REVIEW' && (
              <>
                <button onClick={() => handleAction(selectedApp.id, 'approve')} disabled={actionLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50">
                  Approve
                </button>
                <button onClick={() => setRejectModal({ open: true, id: selectedApp.id })}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                  Reject
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
            <div className="space-y-3">
              {[['Name', `${selectedApp.firstName} ${selectedApp.lastName}`], ['Email', selectedApp.email], ['Phone', selectedApp.phone],
                ['DOB', selectedApp.dateOfBirth ? new Date(selectedApp.dateOfBirth).toLocaleDateString() : '-'],
                ['Gender', selectedApp.gender], ['Category', selectedApp.category || '-'],
                ['Address', [selectedApp.address, selectedApp.city, selectedApp.state, selectedApp.pincode].filter(Boolean).join(', ') || '-'],
                ['Source', selectedApp.source], ['Priority', selectedApp.priority],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between"><span className="text-sm text-gray-500 dark:text-gray-400">{label}</span><span className="text-sm font-medium text-gray-900 dark:text-white">{value || '-'}</span></div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Parent / Guardian</h2>
            <div className="space-y-3">
              {[['Name', selectedApp.parentName], ['Phone', selectedApp.parentPhone], ['Email', selectedApp.parentEmail],
                ['Relation', selectedApp.parentRelation],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between"><span className="text-sm text-gray-500 dark:text-gray-400">{label}</span><span className="text-sm font-medium text-gray-900 dark:text-white">{value || '-'}</span></div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic Details</h2>
            <div className="space-y-3">
              {[['Previous School', selectedApp.previousSchool], ['Percentage', selectedApp.previousPercentage],
                ['Course', selectedApp.course?.name || '-'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between"><span className="text-sm text-gray-500 dark:text-gray-400">{label}</span><span className="text-sm font-medium text-gray-900 dark:text-white">{value || '-'}</span></div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Info</h2>
            <div className="space-y-3">
              {[['Application #', selectedApp.applicationNumber],
                ['Applied', selectedApp.appliedAt ? new Date(selectedApp.appliedAt).toLocaleDateString() : '-'],
                ['Reviewed', selectedApp.reviewedAt ? new Date(selectedApp.reviewedAt).toLocaleDateString() : '-'],
                ['Approved', selectedApp.approvedAt ? new Date(selectedApp.approvedAt).toLocaleDateString() : '-'],
                ['Counselor Notes', selectedApp.counselorNotes || '-'],
                ['Rejection Reason', selectedApp.rejectionReason || '-'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between"><span className="text-sm text-gray-500 dark:text-gray-400">{label}</span><span className="text-sm font-medium text-gray-900 dark:text-white">{value || '-'}</span></div>
              ))}
            </div>
          </div>
        </div>

        {rejectModal.open && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reject Application</h3>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter rejection reason..."
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-24" />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setRejectModal({ open: false, id: '' })} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Cancel</button>
                <button onClick={() => { handleAction(rejectModal.id, 'reject', rejectReason); setRejectReason('') }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">Reject</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Applications</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage admission applications</p>
        </div>
        <button onClick={loadApplications} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search by name, email, or application number..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => { setStatusFilter(tab.key); setPage(1) }}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                statusFilter === tab.key ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700')}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />)}</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400"><Filter className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p>No applications found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">App #</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-5 py-3 font-mono text-xs text-indigo-600 dark:text-indigo-400">{app.applicationNumber}</td>
                    <td className="px-5 py-3"><p className="font-medium text-gray-900 dark:text-white">{app.firstName} {app.lastName}</p><p className="text-xs text-gray-500">{app.email}</p></td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{app.course?.name || '-'}</td>
                    <td className="px-5 py-3 text-center"><span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', statusColors[app.status])}>{app.status}</span></td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{app.source || '-'}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '-'}</td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => viewDetail(app.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"><Eye className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50">Prev</button>
          <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  )
}

export default AdmissionApplications

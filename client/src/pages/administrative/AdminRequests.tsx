import { useState, useEffect } from 'react'
import {
  ClipboardList, RefreshCw, Filter, X,
  CheckCircle2, XCircle, Loader2, Eye, ArrowRight, Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/StatCard'
import api from '@/services/api'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

export function AdminRequests() {
  const [activeTab, setActiveTab] = useState('all')
  const [requests, setRequests] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [remarkModal, setRemarkModal] = useState<{ open: boolean; req: any; action: string }>({
    open: false, req: null, action: '',
  })
  const [reviewerComments, setReviewerComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => { loadData() }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        api.get('/administrative/requests', { params: { status: activeTab === 'all' ? undefined : activeTab } }),
        api.get('/administrative/requests/stats'),
      ])
      const get = (i: number) => results[i].status === 'fulfilled' ? (results[i] as PromiseFulfilledResult<any>).value.data : null
      setRequests(get(0) || [])
      setStats(get(1))
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleStatusUpdate = async () => {
    if (!remarkModal.req) return
    setSubmitting(true)
    try {
      await api.patch(`/administrative/requests/${remarkModal.req.id}`, {
        status: remarkModal.action,
        reviewerComments,
      })
      setSuccessMessage(`Request ${remarkModal.action.toLowerCase()} successfully`)
      setTimeout(() => setSuccessMessage(''), 3000)
      setRemarkModal({ open: false, req: null, action: '' })
      setReviewerComments('')
      loadData()
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  const getTypeBadge = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'ACADEMIC': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'FINANCE': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'HOSTEL': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'TRANSPORT': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'LIBRARY': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
      case 'GENERAL': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'SUBMITTED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'FORWARDING': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'COMPLETED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'HIGH': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'NORMAL': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'LOW': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const tabs = [
    { value: 'all', label: 'All', icon: Filter },
    { value: 'SUBMITTED', label: 'Submitted', icon: Send },
    { value: 'UNDER_REVIEW', label: 'Under Review', icon: Eye },
    { value: 'FORWARDING', label: 'Forwarding', icon: ArrowRight },
    { value: 'APPROVED', label: 'Approved', icon: CheckCircle2 },
    { value: 'REJECTED', label: 'Rejected', icon: XCircle },
    { value: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
  ]

  const pieColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
  const barColors = ['#3b82f6', '#eab308', '#8b5cf6', '#10b981', '#ef4444', '#06b6d4']

  const pieData = stats?.byType?.map((item: any) => ({
    name: item.type,
    value: item.count,
  })) || []

  const barData = stats?.byStatus?.map((item: any) => ({
    status: item.status,
    count: item.count,
  })) || []

  const summary = stats?.summary || {}

  const kpiCards = [
    { title: 'Total Requests', value: summary.total || 0, icon: ClipboardList, color: 'bg-blue-500' },
    { title: 'Submitted', value: summary.submitted || 0, icon: Send, color: 'bg-indigo-500' },
    { title: 'Under Review', value: summary.underReview || 0, icon: Eye, color: 'bg-yellow-500' },
    { title: 'Completed', value: summary.completed || 0, icon: CheckCircle2, color: 'bg-green-500' },
  ]

  const getActionButtons = (req: any) => {
    const status = req.status?.toUpperCase()
    switch (status) {
      case 'SUBMITTED':
        return (
          <button
            onClick={() => setRemarkModal({ open: true, req, action: 'UNDER_REVIEW' })}
            className="p-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
            title="Review"
          >
            <Eye className="w-4 h-4" />
          </button>
        )
      case 'UNDER_REVIEW':
        return (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => setRemarkModal({ open: true, req, action: 'FORWARDING' })}
              className="p-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40"
              title="Forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRemarkModal({ open: true, req, action: 'APPROVED' })}
              className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40"
              title="Approve"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRemarkModal({ open: true, req, action: 'REJECTED' })}
              className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40"
              title="Reject"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )
      case 'FORWARDING':
        return (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => setRemarkModal({ open: true, req, action: 'APPROVED' })}
              className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40"
              title="Approve"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRemarkModal({ open: true, req, action: 'REJECTED' })}
              className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40"
              title="Reject"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )
      case 'APPROVED':
        return (
          <button
            onClick={() => setRemarkModal({ open: true, req, action: 'COMPLETED' })}
            className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40"
            title="Complete"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )
      default:
        return <span className="text-xs text-gray-400">—</span>
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Requests</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage and process student requests</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-750"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Requests by Type</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_: any, index: number) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">No data</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Requests by Status</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="status" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {barData.map((_: any, index: number) => (
                    <Cell key={index} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">No data</div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex gap-2 border-b border-gray-100 dark:border-gray-700 pb-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap',
                activeTab === tab.value
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : requests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center py-16 text-gray-500 dark:text-gray-400">
            <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-lg">No requests found</p>
            <p className="text-sm mt-1">No requests match the current filter</p>
          </div>
        ) : (
          requests.map((req: any) => (
            <div key={req.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-medium text-indigo-700 dark:text-indigo-400 shrink-0">
                  {req.student?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{req.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {req.student?.fullName || '—'} &bull; {req.student?.enrollmentNumber || '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', getTypeBadge(req.type))}>
                        {req.type}
                      </span>
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', getPriorityBadge(req.priority))}>
                        {req.priority}
                      </span>
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', getStatusBadge(req.status))}>
                        {req.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  {req.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{req.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Requested: {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—'}
                      {req.reviewerComments && (
                        <span className="ml-3 text-gray-500 dark:text-gray-400">Comments: {req.reviewerComments}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {getActionButtons(req)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {remarkModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => !submitting && setRemarkModal({ open: false, req: null, action: '' })} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {remarkModal.action === 'REJECTED' ? 'Reject Request' : `${remarkModal.action.charAt(0) + remarkModal.action.slice(1).toLowerCase().replace('_', ' ')} Request`}
              </h2>
              <button
                onClick={() => !submitting && setRemarkModal({ open: false, req: null, action: '' })}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {remarkModal.req && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="font-medium text-gray-900 dark:text-gray-100">{remarkModal.req.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {remarkModal.req.student?.fullName || '—'} &bull; {remarkModal.req.type}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getPriorityBadge(remarkModal.req.priority))}>
                    {remarkModal.req.priority}
                  </span>
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getStatusBadge(remarkModal.req.status))}>
                    {remarkModal.req.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {remarkModal.action === 'REJECTED' ? 'Rejection Reason' : 'Reviewer Comments'}
              </label>
              <textarea
                value={reviewerComments}
                onChange={(e) => setReviewerComments(e.target.value)}
                placeholder={remarkModal.action === 'REJECTED' ? 'Enter rejection reason...' : 'Enter comments (optional)...'}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                disabled={submitting}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRemarkModal({ open: false, req: null, action: '' })}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={submitting || (remarkModal.action === 'REJECTED' && !reviewerComments.trim())}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-lg disabled:opacity-50',
                  remarkModal.action === 'REJECTED'
                    ? 'bg-red-600 hover:bg-red-700'
                    : remarkModal.action === 'APPROVED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : remarkModal.action === 'COMPLETED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : remarkModal.action === 'FORWARDING'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                )}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : remarkModal.action === 'REJECTED' ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminRequests

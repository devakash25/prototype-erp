import { useState, useEffect } from 'react'
import {
  FileText, RefreshCw, Plus, X, Filter,
  CheckCircle2, XCircle, Loader2, Clock, Eye,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/StatCard'
import api from '@/services/api'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

export function AdminCertificates() {
  const [activeTab, setActiveTab] = useState('all')
  const [certificates, setCertificates] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ studentId: '', type: '', title: '', purpose: '' })
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [remarkModal, setRemarkModal] = useState<{ open: boolean; cert: any; action: string }>({
    open: false, cert: null, action: '',
  })
  const [remarks, setRemarks] = useState('')

  useEffect(() => { loadData() }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        api.get('/administrative/certificates', { params: { status: activeTab === 'all' ? undefined : activeTab } }),
        api.get('/administrative/certificates/stats'),
      ])
      const get = (i: number) => results[i].status === 'fulfilled' ? (results[i] as PromiseFulfilledResult<any>).value.data : null
      setCertificates(get(0) || [])
      setStats(get(1))
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      await api.post('/administrative/certificates', formData)
      setSuccessMessage('Certificate request created successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
      setShowModal(false)
      setFormData({ studentId: '', type: '', title: '', purpose: '' })
      loadData()
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  const handleStatusUpdate = async () => {
    if (!remarkModal.cert) return
    setSubmitting(true)
    try {
      await api.patch(`/administrative/certificates/${remarkModal.cert.id}`, {
        status: remarkModal.action,
        remarks,
      })
      setSuccessMessage(`Certificate ${remarkModal.action.toLowerCase()} successfully`)
      setTimeout(() => setSuccessMessage(''), 3000)
      setRemarkModal({ open: false, cert: null, action: '' })
      setRemarks('')
      loadData()
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  const getTypeBadge = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'BONAFIDE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'TRANSFER': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'CHARACTER': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'MIGRATION': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'TC': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
      case 'MARKS': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'ISSUED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'PROCESSING': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const tabs = [
    { value: 'all', label: 'All', icon: Filter },
    { value: 'PENDING', label: 'Pending', icon: Clock },
    { value: 'PROCESSING', label: 'Processing', icon: Eye },
    { value: 'APPROVED', label: 'Approved', icon: CheckCircle2 },
    { value: 'ISSUED', label: 'Issued', icon: FileText },
    { value: 'REJECTED', label: 'Rejected', icon: XCircle },
  ]

  const pieColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
  const barColors = ['#f59e0b', '#8b5cf6', '#10b981', '#3b82f6', '#ef4444']

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
    { title: 'Total Certificates', value: summary.total || 0, icon: FileText, color: 'bg-blue-500' },
    { title: 'Pending', value: summary.pending || 0, icon: Clock, color: 'bg-yellow-500' },
    { title: 'Approved', value: summary.approved || 0, icon: CheckCircle2, color: 'bg-green-500' },
    { title: 'Issued', value: summary.issued || 0, icon: ArrowRight, color: 'bg-teal-500' },
  ]

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certificate Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage and process student certificate requests</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-750"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            New Certificate
          </button>
        </div>
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
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Certificates by Type</h3>
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
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Certificates by Status</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
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
        <div className="flex gap-2 border-b border-gray-100 dark:border-gray-700 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-lg">No certificates found</p>
            <p className="text-sm mt-1">No certificates match the current filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-750">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Student</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Purpose</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Requested</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Issued</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {certificates.map((cert: any) => (
                  <tr key={cert.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-medium text-indigo-700 dark:text-indigo-400">
                          {cert.student?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{cert.student?.fullName || '—'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{cert.student?.enrollmentNumber || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', getTypeBadge(cert.type))}>
                        {cert.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-900 dark:text-gray-100">{cert.title}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{cert.purpose || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', getStatusBadge(cert.status))}>
                        {cert.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {cert.status?.toUpperCase() === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setRemarkModal({ open: true, cert, action: 'PROCESSING' })}
                            className="p-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40"
                            title="Process"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRemarkModal({ open: true, cert, action: 'APPROVED' })}
                            className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRemarkModal({ open: true, cert, action: 'ISSUED' })}
                            className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40"
                            title="Issue"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRemarkModal({ open: true, cert, action: 'REJECTED' })}
                            className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : cert.status?.toUpperCase() === 'PROCESSING' ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setRemarkModal({ open: true, cert, action: 'APPROVED' })}
                            className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRemarkModal({ open: true, cert, action: 'REJECTED' })}
                            className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : cert.status?.toUpperCase() === 'APPROVED' ? (
                        <button
                          onClick={() => setRemarkModal({ open: true, cert, action: 'ISSUED' })}
                          className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40"
                          title="Issue"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => !submitting && setShowModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Certificate Request</h2>
              <button onClick={() => !submitting && setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID</label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="Enter student ID"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certificate Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select type</option>
                  <option value="BONAFIDE">Bonafide</option>
                  <option value="TRANSFER">Transfer Certificate</option>
                  <option value="CHARACTER">Character Certificate</option>
                  <option value="MIGRATION">Migration Certificate</option>
                  <option value="TC">TC</option>
                  <option value="MARKS">Marks Sheet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter certificate title"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose</label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Enter purpose"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting || !formData.studentId || !formData.type || !formData.title}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}

      {remarkModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => !submitting && setRemarkModal({ open: false, cert: null, action: '' })} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {remarkModal.action === 'REJECTED' ? 'Reject Certificate' : `${remarkModal.action.charAt(0) + remarkModal.action.slice(1).toLowerCase()} Certificate`}
              </h2>
              <button
                onClick={() => !submitting && setRemarkModal({ open: false, cert: null, action: '' })}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {remarkModal.cert && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="font-medium text-gray-900 dark:text-gray-100">{remarkModal.cert.student?.fullName || '—'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{remarkModal.cert.title} &bull; {remarkModal.cert.type}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {remarkModal.action === 'REJECTED' ? 'Rejection Reason' : 'Remarks'}
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={remarkModal.action === 'REJECTED' ? 'Enter rejection reason...' : 'Enter remarks (optional)...'}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                disabled={submitting}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRemarkModal({ open: false, cert: null, action: '' })}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={submitting || (remarkModal.action === 'REJECTED' && !remarks.trim())}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-lg disabled:opacity-50',
                  remarkModal.action === 'REJECTED'
                    ? 'bg-red-600 hover:bg-red-700'
                    : remarkModal.action === 'APPROVED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : remarkModal.action === 'ISSUED'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-purple-600 hover:bg-purple-700'
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

export default AdminCertificates

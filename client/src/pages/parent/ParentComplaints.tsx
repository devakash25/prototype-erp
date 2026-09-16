import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import {
  RefreshCw,
  AlertTriangle,
  Plus,
  X,
  AlertCircle,
  Hash,
  Tag,
  Building2,
  CheckCircle2,
} from 'lucide-react'

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case 'OPEN':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'RESOLVED':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'CLOSED':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

function getPriorityBadge(priority: string) {
  switch (priority?.toUpperCase()) {
    case 'URGENT':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'HIGH':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'NORMAL':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'LOW':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

function getCategoryBadge(category: string) {
  switch (category?.toLowerCase()) {
    case 'academic':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'fees':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'hostel':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'transport':
      return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
    case 'infrastructure':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
    case 'admin':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    case 'technical':
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

export function ParentComplaints() {
  const [searchParams] = useSearchParams()
  const childId = searchParams.get('childId') || ''
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'academic',
    priority: 'NORMAL',
  })

  const { data: complaintsData, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-complaints', childId],
    queryFn: async () => {
      const res = await api.get(`/parent/complaints?childId=${childId}`)
      return res.data
    },
    enabled: !!childId,
  })

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post(`/parent/complaints?childId=${childId}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-complaints', childId] })
      setShowForm(false)
      setForm({ title: '', description: '', category: 'academic', priority: 'NORMAL' })
    },
    onError: (err: any) => {
      window.alert(err.response?.data?.error?.message || 'Failed to submit complaint. Please try again.')
    },
  })

  if (!childId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-lg text-gray-500 dark:text-gray-400">Select a child to view complaints</p>
        </div>
      </div>
    )
  }

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
        <p className="text-lg text-gray-600 dark:text-gray-400">Failed to load complaints</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const complaints = complaintsData?.complaints || []
  const openCount = complaints.filter((c: any) => c.status === 'OPEN').length
  const inProgressCount = complaints.filter((c: any) => c.status === 'IN_PROGRESS').length
  const resolvedCount = complaints.filter((c: any) => c.status === 'RESOLVED').length
  const closedCount = complaints.filter((c: any) => c.status === 'CLOSED').length

  const categories = [
    { value: 'academic', label: 'Academic' },
    { value: 'fees', label: 'Fees' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'transport', label: 'Transport' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'admin', label: 'Administrative' },
    { value: 'technical', label: 'Technical' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complaint Tracking</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Raise and track complaints</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Raise Complaint
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{openCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{inProgressCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{resolvedCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Closed</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{closedCount}</p>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Complaints</h2>
        </div>
        {complaints.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No complaints found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {complaints.map((complaint: any, idx: number) => (
              <div key={idx} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg mt-1">
                      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{complaint.title}</h3>
                        {complaint.ticketNumber && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Hash className="h-3 w-3" /> {complaint.ticketNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{complaint.description}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {complaint.category && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryBadge(complaint.category)}`}>
                            <Tag className="h-3 w-3 inline mr-1" />
                            {complaint.category}
                          </span>
                        )}
                        {complaint.priority && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityBadge(complaint.priority)}`}>
                            {complaint.priority}
                          </span>
                        )}
                        {complaint.assignedDepartment && (
                          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                            <Building2 className="h-3 w-3" /> {complaint.assignedDepartment}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{formatDate(complaint.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full shrink-0 ${getStatusBadge(complaint.status)}`}>
                    {complaint.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raise Complaint Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Raise Complaint</h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submitMutation.mutate(form)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Brief description of the issue"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Describe the issue in detail..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

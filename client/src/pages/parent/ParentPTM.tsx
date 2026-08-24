import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import {
  RefreshCw,
  Calendar,
  Clock,
  User,
  BookOpen,
  MapPin,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
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
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'COMPLETED':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'CANCELLED':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

export function ParentPTM() {
  const [searchParams] = useSearchParams()
  const childId = searchParams.get('childId') || ''
  const queryClient = useQueryClient()
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestForm, setRequestForm] = useState({
    subject: '',
    reason: '',
    preferredDate: '',
  })

  const { data: ptmData, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-ptm', childId],
    queryFn: async () => {
      const res = await api.get(`/parent/ptm?childId=${childId}`)
      return res.data
    },
    enabled: !!childId,
  })

  const requestMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post(`/parent/ptm/request?childId=${childId}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-ptm', childId] })
      setShowRequestForm(false)
      setRequestForm({ subject: '', reason: '', preferredDate: '' })
    },
  })

  if (!childId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-lg text-gray-500 dark:text-gray-400">Select a child to view PTM details</p>
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
        <p className="text-lg text-gray-600 dark:text-gray-400">Failed to load PTM data</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const upcomingPTMs = ptmData?.upcomingPTMs || []
  const pastPTMs = ptmData?.pastPTMs || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parent-Teacher Meetings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Schedule and track meeting progress</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Request PTM
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Upcoming PTMs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Meetings</h2>
        </div>
        {upcomingPTMs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No upcoming meetings scheduled</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcomingPTMs.map((ptm: any, idx: number) => (
              <div key={idx} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg mt-1">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{ptm.subject || 'Meeting'}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(ptm.status)}`}>
                          {ptm.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" /> {ptm.teacherName || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" /> {ptm.subject || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {ptm.time || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {ptm.location || '—'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {formatDate(ptm.date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past PTMs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Past Meetings</h2>
        </div>
        {pastPTMs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No past meetings</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pastPTMs.map((ptm: any, idx: number) => (
              <div key={idx} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg mt-1">
                      <CheckCircle2 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{ptm.subject || 'Meeting'}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(ptm.status)}`}>
                          {ptm.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" /> {ptm.teacherName || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {ptm.time || '—'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {formatDate(ptm.date)}
                      </p>
                      {ptm.summary && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{ptm.summary}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request PTM Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Request PTM</h2>
              <button onClick={() => setShowRequestForm(false)}>
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                requestMutation.mutate(requestForm)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={requestForm.subject}
                  onChange={(e) => setRequestForm({ ...requestForm, subject: e.target.value })}
                  required
                  placeholder="e.g., Academic Progress Discussion"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                <textarea
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  required
                  rows={3}
                  placeholder="Describe the reason for the meeting..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={requestForm.preferredDate}
                  onChange={(e) => setRequestForm({ ...requestForm, preferredDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {requestMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

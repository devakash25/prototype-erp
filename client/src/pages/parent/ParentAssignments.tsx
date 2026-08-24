import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import {
  RefreshCw,
  ClipboardList,
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  FileCheck,
} from 'lucide-react'

type Tab = 'pending' | 'review' | 'graded'

function getStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'review':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'graded':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

function getStatusLabel(status: string) {
  switch (status?.toLowerCase()) {
    case 'review': return 'Under Review'
    default: return status
  }
}

function getStatusIcon(status: string) {
  switch (status?.toLowerCase()) {
    case 'pending': return <Clock className="h-4 w-4" />
    case 'review': return <Eye className="h-4 w-4" />
    case 'graded': return <CheckCircle2 className="h-4 w-4" />
    default: return null
  }
}

function getStatusTabColor(tab: Tab) {
  switch (tab) {
    case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'review': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'graded': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  }
}

export function ParentAssignments() {
  const [searchParams] = useSearchParams()
  const childId = searchParams.get('childId') || ''
  const [activeTab, setActiveTab] = useState<Tab>('pending')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-assignments', childId],
    queryFn: async () => {
      const res = await api.get(`/parent/assignments?childId=${childId}`)
      return res.data
    },
    enabled: !!childId,
  })

  const assignments = data?.assignments || data || []

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'review', label: 'Under Review' },
    { key: 'graded', label: 'Graded' },
  ]

  const filtered = assignments.filter((a: any) => a.status?.toLowerCase() === activeTab)

  const counts = {
    pending: assignments.filter((a: any) => a.status?.toLowerCase() === 'pending').length,
    review: assignments.filter((a: any) => a.status?.toLowerCase() === 'review').length,
    graded: assignments.filter((a: any) => a.status?.toLowerCase() === 'graded').length,
  }

  if (!childId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-gray-400">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg">Select a child to view assignments</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-400">Failed to load assignments</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assignments</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Monitor your child's assignments</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${getStatusTabColor(tab.key)}`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Assignment Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <div className="space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-lg text-gray-500 dark:text-gray-400">No {activeTab === 'review' ? 'under review' : activeTab} assignments</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((a: any, idx: number) => (
            <div
              key={idx}
              className={`bg-white dark:bg-gray-800 rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow ${
                activeTab === 'pending'
                  ? 'border-yellow-200 dark:border-yellow-800/50'
                  : activeTab === 'review'
                  ? 'border-purple-200 dark:border-purple-800/50'
                  : 'border-green-200 dark:border-green-800/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{a.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{a.subject}</p>
                </div>
                <span className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full shrink-0 ml-2 ${getStatusBadge(a.status)}`}>
                  {getStatusIcon(a.status)}
                  {getStatusLabel(a.status)}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                  <span>
                    Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                </div>

                {a.status?.toLowerCase() === 'graded' && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Marks: {a.marksObtained ?? '—'} / {a.maxMarks ?? '—'}</span>
                    </div>
                    {a.feedback && (
                      <div className="mt-2 p-2 rounded bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Feedback:</span> {a.feedback}
                      </div>
                    )}
                  </>
                )}

                {a.status?.toLowerCase() === 'review' && (
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-purple-500" />
                    <span>Submitted &mdash; waiting for teacher to review</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw, ClipboardList, Upload, FileCheck,
  CheckCircle2, Clock, X, File, Eye, AlertCircle,
} from 'lucide-react'

type Tab = 'all' | 'pending' | 'review' | 'graded'

function getStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case 'pending': return 'bg-yellow-500/15 text-yellow-400'
    case 'review':
    case 'submitted': return 'bg-purple-500/15 text-purple-400'
    case 'graded': return 'bg-green-500/15 text-green-400'
    default: return 'bg-slate-500/15 text-slate-400'
  }
}

function getStatusIcon(status: string) {
  switch (status?.toLowerCase()) {
    case 'pending': return <Clock className="h-4 w-4" />
    case 'review':
    case 'submitted': return <Eye className="h-4 w-4" />
    case 'graded': return <CheckCircle2 className="h-4 w-4" />
    default: return null
  }
}

function getStatusLabel(status: string) {
  switch (status?.toLowerCase()) {
    case 'review': return 'Under Review'
    case 'submitted': return 'Submitted'
    default: return status
  }
}

export function StudentAssignments() {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const { data: rawAssignments, loading, error, refetch } = useApi<any[]>('/student/assignments')
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showUploadModal, setShowUploadModal] = useState<string | null>(null)

  const assignments = (rawAssignments || []).map((a: any) => ({
    ...a,
    status: a.status?.toLowerCase() === 'submitted' ? 'review' : a.status?.toLowerCase() || 'pending',
  }))

  const filtered = activeTab === 'all' ? assignments : assignments.filter((a) => a.status === activeTab)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'review', label: 'Under Review' },
    { key: 'graded', label: 'Graded' },
  ]

  const handleUpload = async (assignmentId: string) => {
    if (!selectedFile) return
    setUploadingId(assignmentId)
    try {
      await api.post('/student/submit-assignment', {
        assignmentId,
        fileUrl: selectedFile.name,
        notes: '',
      })
      setSelectedFile(null)
      setUploadingId(null)
      setShowUploadModal(null)
      refetch()
    } catch (err) {
      console.error(err)
      setUploadingId(null)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-300">Failed to load assignments</p>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Assignments</h1>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'ml-2 px-1.5 py-0.5 text-xs rounded-full',
                  activeTab === tab.key ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'
                )}
              >
                {tab.key === 'all' ? assignments.length : assignments.filter((a) => a.status === tab.key).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="space-y-3">
                <div className="h-5 w-3/4 bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : !filtered.length ? (
        <div className="text-center py-16 text-slate-400">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 text-slate-600" />
          <p className="text-lg">No assignments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a: any) => (
            <div
              key={a.id}
              className={cn(
                'bg-slate-800 rounded-xl border p-5 transition-shadow hover:shadow-md',
                a.status === 'graded' ? 'border-green-500/30' : a.status === 'review' ? 'border-purple-500/30' : 'border-slate-700'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold text-white">{a.title}</h3>
                    <span
                      className={cn(
                        'flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                        getStatusBadge(a.status)
                      )}
                    >
                      {getStatusIcon(a.status)}
                      {getStatusLabel(a.status)}
                    </span>
                  </div>
                  {a.description && <p className="text-sm text-slate-400 mb-3">{a.description}</p>}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <span className="font-medium text-slate-300">{a.subject}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Due{' '}
                      {new Date(a.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span>Max: {a.maxMarks} marks</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {a.status === 'graded' && a.marksObtained != null ? (
                    <div className="inline-flex flex-col items-center px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                      <span className="text-2xl font-bold text-green-400">{a.marksObtained}</span>
                      <span className="text-xs text-green-400/70">/ {a.maxMarks}</span>
                    </div>
                  ) : a.status === 'pending' ? (
                    <button
                      onClick={() => setShowUploadModal(a.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </button>
                  ) : a.status === 'review' ? (
                    <div className="inline-flex flex-col items-center gap-1 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="flex items-center gap-1.5 text-purple-400 text-sm font-medium">
                        <Eye className="h-4 w-4" />
                        Under Review
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden border border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Upload Assignment</h3>
              <button
                onClick={() => { setShowUploadModal(null); setSelectedFile(null) }}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-400 mb-4">{assignments.find((a: any) => a.id === showUploadModal)?.title}</p>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  {selectedFile ? (
                    <>
                      <File className="h-10 w-10 text-indigo-400" />
                      <span className="text-sm font-medium text-white">{selectedFile.name}</span>
                      <span className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-slate-500" />
                      <span className="text-sm text-slate-400">Click to browse or drag & drop</span>
                      <span className="text-xs text-slate-500">PDF, DOC, DOCX, PY (max 10MB)</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.py,.txt,.zip"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-900/50">
              <button
                onClick={() => { setShowUploadModal(null); setSelectedFile(null) }}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpload(showUploadModal)}
                disabled={!selectedFile || uploadingId === showUploadModal}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  selectedFile && uploadingId !== showUploadModal
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                )}
              >
                {uploadingId === showUploadModal ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="h-4 w-4" /> Submit</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

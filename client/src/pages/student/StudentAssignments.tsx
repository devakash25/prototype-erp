import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  RefreshCw, ClipboardList, Upload, FileCheck,
  CheckCircle2, Clock, X, File, Eye,
} from 'lucide-react'

type Tab = 'all' | 'pending' | 'review' | 'graded'

const DUMMY_ASSIGNMENTS = [
  {
    id: 1,
    title: 'Algebra Worksheet - Quadratic Equations',
    subject: 'Mathematics',
    teacher: 'Mr. Sharma',
    dueDate: '2026-08-20',
    maxMarks: 20,
    status: 'pending',
    marksObtained: null,
    submittedAt: null,
    fileName: null,
    description: 'Solve all 10 problems from Chapter 3. Show step-by-step working.',
  },
  {
    id: 2,
    title: "Physics Lab Report - Ohm's Law",
    subject: 'Physics',
    teacher: 'Ms. Patel',
    dueDate: '2026-08-18',
    maxMarks: 15,
    status: 'graded',
    marksObtained: 13,
    submittedAt: '2026-08-17T14:30:00',
    fileName: 'ohms_law_report.pdf',
    description: 'Write a detailed lab report with observations, calculations, and conclusion.',
  },
  {
    id: 3,
    title: 'Essay - Climate Change Effects',
    subject: 'English',
    teacher: 'Mrs. Gupta',
    dueDate: '2026-08-22',
    maxMarks: 25,
    status: 'review',
    marksObtained: null,
    submittedAt: '2026-08-16T09:15:00',
    fileName: 'climate_change_essay.docx',
    description: 'Write a 500-word essay on the effects of climate change on coastal cities.',
  },
  {
    id: 4,
    title: 'Chemistry Periodic Table Quiz',
    subject: 'Chemistry',
    teacher: 'Mr. Kumar',
    dueDate: '2026-08-25',
    maxMarks: 10,
    status: 'pending',
    marksObtained: null,
    submittedAt: null,
    fileName: null,
    description: 'Complete the online periodic table quiz on the LMS portal.',
  },
  {
    id: 5,
    title: 'Python Programming Assignment',
    subject: 'Computer Science',
    teacher: 'Mr. Reddy',
    dueDate: '2026-08-19',
    maxMarks: 30,
    status: 'graded',
    marksObtained: 27,
    submittedAt: '2026-08-18T11:00:00',
    fileName: 'python_assignment.py',
    description: 'Write a Python program to manage student records using dictionaries and lists.',
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'review':
      return 'bg-purple-100 text-purple-700'
    case 'graded':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />
    case 'review':
      return <Eye className="h-4 w-4" />
    case 'graded':
      return <CheckCircle2 className="h-4 w-4" />
    default:
      return null
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'review':
      return 'Under Review'
    default:
      return status
  }
}

export function StudentAssignments() {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [assignments, setAssignments] = useState(DUMMY_ASSIGNMENTS)
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showUploadModal, setShowUploadModal] = useState<number | null>(null)

  const filtered = activeTab === 'all' ? assignments : assignments.filter((a) => a.status === activeTab)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'review', label: 'Under Review' },
    { key: 'graded', label: 'Graded' },
  ]

  const handleUpload = (assignmentId: number) => {
    if (!selectedFile) return
    setUploadingId(assignmentId)
    setTimeout(() => {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId
            ? { ...a, status: 'review', fileName: selectedFile.name, submittedAt: new Date().toISOString() }
            : a
        )
      )
      setSelectedFile(null)
      setUploadingId(null)
      setShowUploadModal(null)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <button
          onClick={() => setAssignments(DUMMY_ASSIGNMENTS)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'ml-2 px-1.5 py-0.5 text-xs rounded-full',
                  activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                )}
              >
                {tab.key === 'all' ? assignments.length : assignments.filter((a) => a.status === tab.key).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Assignment Cards */}
      {!filtered.length ? (
        <div className="text-center py-16 text-gray-500">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg">No assignments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <div
              key={a.id}
              className={cn(
                'bg-white rounded-xl border p-5 transition-shadow hover:shadow-md',
                a.status === 'graded' ? 'border-green-200' : a.status === 'review' ? 'border-purple-200' : 'border-gray-200'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold text-gray-900">{a.title}</h3>
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
                  <p className="text-sm text-gray-500 mb-3">{a.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="font-medium">{a.subject}</span>
                    <span>by {a.teacher}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Due{' '}
                      {new Date(a.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span>Max: {a.maxMarks} marks</span>
                  </div>
                </div>

                {/* Marks, Upload Button, or Status */}
                <div className="shrink-0 text-right">
                  {a.status === 'graded' && a.marksObtained != null ? (
                    <div className="inline-flex flex-col items-center px-4 py-2 rounded-lg bg-green-50 border border-green-200">
                      <span className="text-2xl font-bold text-green-700">{a.marksObtained}</span>
                      <span className="text-xs text-green-600">/ {a.maxMarks}</span>
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
                    <div className="inline-flex flex-col items-center gap-1 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-1.5 text-purple-700 text-sm font-medium">
                        <Eye className="h-4 w-4" />
                        Under Review
                      </div>
                      {a.fileName && (
                        <span className="text-xs text-purple-500">{a.fileName}</span>
                      )}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Upload Assignment</h3>
              <button
                onClick={() => {
                  setShowUploadModal(null)
                  setSelectedFile(null)
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 mb-4">{assignments.find((a) => a.id === showUploadModal)?.title}</p>

              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  {selectedFile ? (
                    <>
                      <File className="h-10 w-10 text-indigo-500" />
                      <span className="text-sm font-medium text-gray-900">{selectedFile.name}</span>
                      <span className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-400" />
                      <span className="text-sm text-gray-600">Click to browse or drag & drop</span>
                      <span className="text-xs text-gray-400">PDF, DOC, DOCX, PY (max 10MB)</span>
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
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowUploadModal(null)
                  setSelectedFile(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
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
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                {uploadingId === showUploadModal ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

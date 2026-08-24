import { useState, useEffect, useCallback } from 'react'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw, BookOpen, ClipboardList, Clock, Eye, CheckCircle2,
  Plus, X, ChevronRight, FileText, Upload, ArrowLeft, Users, UserX,
} from 'lucide-react'

interface Subject {
  allocationId: string
  subjectId: string
  subjectName: string
  subjectCode: string
  subjectType: string
  credits: number
  course: { id: string; name: string; code: string } | null
  session: { id: string; name: string; isActive: boolean }
  assignedAt: string
}

interface Assignment {
  id: string
  title: string
  description: string | null
  totalMarks: number
  dueDate: string
  attachments: any
  subject: { id: string; name: string; code: string }
  createdAt: string
  submissionCount: number
  submissions: { id: string; studentId: string; marksObtained: number | null; status: string; submittedAt: string }[]
}

interface StudentSubmission {
  studentId: string
  admissionNumber: string
  rollNumber: string | null
  name: string
  email: string
  submission?: {
    id: string
    content: string | null
    attachments: any
    marksObtained: number | null
    feedback: string | null
    status: string
    submittedAt: string
    gradedAt: string | null
  }
}

type View = 'subjects' | 'assignments' | 'submissions'

function getStatusBadge(status: string) {
  switch (status) {
    case 'submitted': return 'bg-blue-100 text-blue-700'
    case 'graded': return 'bg-green-100 text-green-700'
    case 'returned': return 'bg-yellow-100 text-yellow-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

export function TeacherAssignments() {
  const [view, setView] = useState<View>('subjects')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<{ assignment: any; stats: any; submitted: StudentSubmission[]; notSubmitted: StudentSubmission[] } | null>(null)

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState<{ studentId: string; studentName: string; marksObtained: number | null } | null>(null)
  const [gradeValue, setGradeValue] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/assignments/teacher/subjects')
      setSubjects(res.data.data)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAssignments = useCallback(async (subjectId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/assignments/teacher/subjects/${subjectId}/assignments`)
      setAssignments(res.data.data)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSubmissions = useCallback(async (assignmentId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/assignments/teacher/assignments/${assignmentId}/submissions`)
      setSubmissions(res.data.data)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSubjects() }, [fetchSubjects])

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject)
    setView('assignments')
    fetchAssignments(subject.subjectId)
  }

  const handleAssignmentClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setView('submissions')
    fetchSubmissions(assignment.id)
  }

  const handleBack = () => {
    if (view === 'submissions') {
      setView('assignments')
      setSelectedAssignment(null)
      setSubmissions(null)
    } else if (view === 'assignments') {
      setView('subjects')
      setSelectedSubject(null)
      setAssignments([])
    }
  }

  const handleGrade = async () => {
    if (!showGradeModal || !selectedAssignment || !gradeValue) return
    setSubmitting(true)
    try {
      await api.post('/assignments/teacher/grade', {
        assignmentId: selectedAssignment.id,
        studentId: showGradeModal.studentId,
        marksObtained: parseInt(gradeValue),
        feedback: gradeFeedback || undefined,
      })
      await fetchSubmissions(selectedAssignment.id)
      setShowGradeModal(null)
      setGradeValue('')
      setGradeFeedback('')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to grade')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateAssignment = async (data: {
    subjectId: string; title: string; description: string;
    totalMarks: number; dueDate: string;
  }) => {
    setSubmitting(true)
    try {
      await api.post('/assignments/teacher/assignments', data)
      await fetchAssignments(data.subjectId)
      setShowCreateModal(false)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create assignment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !subjects.length && !assignments.length && !submissions) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (error && !subjects.length && !assignments.length && !submissions) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-500">{error}</p>
        <button onClick={() => { setError(null); fetchSubjects() }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== 'subjects' && (
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {view === 'subjects' && 'My Subjects'}
              {view === 'assignments' && selectedSubject?.subjectName}
              {view === 'submissions' && selectedAssignment?.title}
            </h1>
            <p className="text-sm text-gray-500">
              {view === 'subjects' && 'Subjects assigned to you'}
              {view === 'assignments' && `${selectedSubject?.subjectCode} - ${selectedSubject?.course?.name || ''}`}
              {view === 'submissions' && 'View student submissions'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {view === 'assignments' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> New Assignment
            </button>
          )}
          <button
            onClick={() => {
              if (view === 'subjects') fetchSubjects()
              else if (view === 'assignments' && selectedSubject) fetchAssignments(selectedSubject.subjectId)
              else if (view === 'submissions' && selectedAssignment) fetchSubmissions(selectedAssignment.id)
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* SUBJECTS VIEW */}
      {view === 'subjects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <button
              key={s.allocationId}
              onClick={() => handleSubjectClick(s)}
              className="text-left bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">{s.subjectName}</h3>
              <p className="text-sm text-gray-500 mb-3">{s.subjectCode} | {s.credits} credits</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="px-2 py-0.5 bg-gray-100 rounded-full capitalize">{s.subjectType}</span>
                {s.course && <span>{s.course.name}</span>}
              </div>
            </button>
          ))}
          {!subjects.length && (
            <div className="col-span-full text-center py-16 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg">No subjects assigned</p>
            </div>
          )}
        </div>
      )}

      {/* ASSIGNMENTS VIEW */}
      {view === 'assignments' && (
        <div className="space-y-4">
          {!assignments.length ? (
            <div className="text-center py-16 text-gray-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg">No assignments yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 mx-auto"
              >
                <Plus className="h-4 w-4" /> Create First Assignment
              </button>
            </div>
          ) : (
            assignments.map((a) => {
              const isOverdue = new Date(a.dueDate) < new Date()
              return (
                <div
                  key={a.id}
                  className={cn(
                    'bg-white rounded-xl border p-5 transition-shadow hover:shadow-md cursor-pointer',
                    isOverdue ? 'border-red-200' : 'border-gray-200'
                  )}
                  onClick={() => handleAssignmentClick(a)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-gray-900">{a.title}</h3>
                        {isOverdue && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">Overdue</span>
                        )}
                      </div>
                      {a.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{a.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Due {new Date(a.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span>Max: {a.totalMarks} marks</span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          {a.submissionCount} submitted
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-5 w-5 text-gray-300" />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* SUBMISSIONS VIEW */}
      {view === 'submissions' && submissions && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{submissions.stats.totalStudents}</p>
            </div>
            <div className="bg-white rounded-xl border border-green-200 p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Submitted</p>
              <p className="text-2xl font-bold text-green-600">{submissions.stats.submitted}</p>
            </div>
            <div className="bg-white rounded-xl border border-red-200 p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Not Submitted</p>
              <p className="text-2xl font-bold text-red-600">{submissions.stats.notSubmitted}</p>
            </div>
          </div>

          {/* Submitted Students */}
          {submissions.submitted.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                <Users className="h-4 w-4 text-green-600" /> Submitted ({submissions.submitted.length})
              </h3>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Roll No</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Submitted</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Marks</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {submissions.submitted.map((s) => (
                      <tr key={s.studentId} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{s.name}</div>
                          <div className="text-xs text-gray-500">{s.admissionNumber}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{s.rollNumber || '—'}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {s.submission ? new Date(s.submission.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={cn('inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize', getStatusBadge(s.submission?.status || 'submitted'))}>
                            {s.submission?.status || 'submitted'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-gray-900">
                          {s.submission?.marksObtained != null
                            ? `${s.submission.marksObtained} / ${submissions.assignment.totalMarks}`
                            : '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {s.submission?.marksObtained != null ? (
                            <span className="text-green-600 text-xs font-medium">Graded</span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowGradeModal({ studentId: s.studentId, studentName: s.name, marksObtained: null })
                              }}
                              className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
                            >
                              Grade
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Not Submitted Students */}
          {submissions.notSubmitted.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                <UserX className="h-4 w-4 text-red-600" /> Not Submitted ({submissions.notSubmitted.length})
              </h3>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Roll No</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {submissions.notSubmitted.map((s) => (
                      <tr key={s.studentId} className="hover:bg-gray-50 bg-red-50/30">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{s.name}</div>
                          <div className="text-xs text-gray-500">{s.admissionNumber}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{s.rollNumber || '—'}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{s.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!submissions.submitted.length && !submissions.notSubmitted.length && (
            <div className="text-center py-16 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg">No students found for this subject</p>
            </div>
          )}
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showCreateModal && selectedSubject && (
        <CreateAssignmentModal
          subjectName={selectedSubject.subjectName}
          subjectId={selectedSubject.subjectId}
          onSubmit={handleCreateAssignment}
          onClose={() => setShowCreateModal(false)}
          loading={submitting}
        />
      )}

      {/* GRADE MODAL */}
      {showGradeModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Grade Submission</h3>
              <button onClick={() => { setShowGradeModal(null); setGradeValue(''); setGradeFeedback('') }} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Student</p>
                <p className="font-medium text-gray-900">{showGradeModal.studentName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marks Obtained</label>
                <input
                  type="number"
                  min={0}
                  max={selectedAssignment.totalMarks}
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter marks"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1">out of {selectedAssignment.totalMarks} marks</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback (optional)</label>
                <textarea
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add feedback..."
                  rows={2}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button onClick={() => { setShowGradeModal(null); setGradeValue(''); setGradeFeedback('') }} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleGrade}
                disabled={!gradeValue || submitting}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  gradeValue && !submitting ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Submit Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CreateAssignmentModal({ subjectName, subjectId, onSubmit, onClose, loading }: {
  subjectName: string; subjectId: string;
  onSubmit: (data: { subjectId: string; title: string; description: string; totalMarks: number; dueDate: string }) => Promise<void>
  onClose: () => void; loading: boolean
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [totalMarks, setTotalMarks] = useState('')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = () => {
    if (!title || !totalMarks || !dueDate) return
    onSubmit({ subjectId, title, description, totalMarks: parseInt(totalMarks), dueDate: new Date(dueDate).toISOString() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">New Assignment</h3>
            <p className="text-sm text-gray-500">{subjectName}</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Assignment title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Assignment description" rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks *</label>
              <input
                type="number" min={1} value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. 20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input
                type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!title || !totalMarks || !dueDate || loading}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              title && totalMarks && dueDate && !loading ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create Assignment
          </button>
        </div>
      </div>
    </div>
  )
}

export default TeacherAssignments

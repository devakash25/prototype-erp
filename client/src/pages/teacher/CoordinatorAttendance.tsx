import { useState, useEffect } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  RefreshCw,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  CalendarDays,
  Lock,
  Unlock,
  ClipboardCheck,
  Sun,
  Moon,
  Save,
  ChevronDown,
  AlertTriangle,
  Loader2,
  BookOpen,
  Search,
} from 'lucide-react'

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE'
type SessionType = 'morning' | 'evening'
type ModeType = 'COORDINATOR' | 'SUBJECT'

interface Course {
  id: string
  name: string
  code: string
  studentCount: number
}

interface Student {
  id: string
  name: string
  rollNumber: string
  admissionNumber: string
}

interface AttendanceRecord {
  studentId: string
  status: AttendanceStatus
  remarks: string
}

interface ClassStatus {
  mode: ModeType
  locked: boolean
  totalStudents: number
  presentCount: number
  absentCount: number
  lateCount: number
}

export function CoordinatorAttendance() {
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [selectedSession, setSelectedSession] = useState<SessionType>('morning')
  const [records, setRecords] = useState<Map<string, AttendanceRecord>>(new Map())
  const [remarks, setRemarks] = useState<Map<string, string>>(new Map())
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [locking, setLocking] = useState(false)
  const [showModeDialog, setShowModeDialog] = useState(false)
  const [pendingMode, setPendingMode] = useState<ModeType | null>(null)

  const { data: courses, loading: coursesLoading, error: coursesError } = useApi<Course[]>('/attendance/courses')

  const effectiveCourseId = selectedCourseId || courses?.[0]?.id || ''

  const { data: classStatus, loading: statusLoading, refetch: refetchStatus } = useApi<ClassStatus>(
    effectiveCourseId ? `/attendance/class-status?courseId=${effectiveCourseId}&date=${selectedDate}` : '',
    [effectiveCourseId, selectedDate]
  )

  const { data: students, loading: studentsLoading, refetch: refetchStudents } = useApi<Student[]>(
    effectiveCourseId ? `/attendance/class-students?courseId=${effectiveCourseId}` : '',
    [effectiveCourseId]
  )

  const { data: existingRecords, loading: recordsLoading } = useApi<any[]>(
    effectiveCourseId
      ? `/attendance/daily?courseId=${effectiveCourseId}&date=${selectedDate}&session=${selectedSession}`
      : '',
    [effectiveCourseId, selectedDate, selectedSession]
  )

  useEffect(() => {
    if (existingRecords && existingRecords.length > 0) {
      const newRecords = new Map<string, AttendanceRecord>()
      const newRemarks = new Map<string, string>()
      existingRecords.forEach((rec: any) => {
        newRecords.set(rec.studentId, {
          studentId: rec.studentId,
          status: rec.status as AttendanceStatus,
          remarks: rec.remarks || '',
        })
        newRemarks.set(rec.studentId, rec.remarks || '')
      })
      setRecords(newRecords)
      setRemarks(newRemarks)
    } else if (students && students.length > 0) {
      const newRecords = new Map<string, AttendanceRecord>()
      const newRemarks = new Map<string, string>()
      students.forEach((s: Student) => {
        newRecords.set(s.id, { studentId: s.id, status: 'ABSENT', remarks: '' })
        newRemarks.set(s.id, '')
      })
      setRecords(newRecords)
      setRemarks(newRemarks)
    }
  }, [existingRecords, students])

  useEffect(() => {
    setSaveMessage(null)
  }, [selectedCourseId, selectedDate, selectedSession])

  useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id)
    }
  }, [courses, selectedCourseId])

  const updateRecord = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => {
      const next = new Map(prev)
      next.set(studentId, { studentId, status, remarks: next.get(studentId)?.remarks || '' })
      return next
    })
  }

  const updateRemarks = (studentId: string, value: string) => {
    setRemarks((prev) => {
      const next = new Map(prev)
      next.set(studentId, value)
      return next
    })
    setRecords((prev) => {
      const next = new Map(prev)
      const existing = next.get(studentId)
      if (existing) {
        next.set(studentId, { ...existing, remarks: value })
      }
      return next
    })
  }

  const markAll = (status: AttendanceStatus) => {
    if (!students) return
    const newRecords = new Map<string, AttendanceRecord>()
    students.forEach((s: Student) => {
      newRecords.set(s.id, { studentId: s.id, status, remarks: records.get(s.id)?.remarks || '' })
    })
    setRecords(newRecords)
  }

  const handleSave = async () => {
    if (!effectiveCourseId || records.size === 0) return
    setSaving(true)
    setSaveMessage(null)
    try {
      const payload = {
        courseId: effectiveCourseId,
        date: selectedDate,
        session: selectedSession,
        records: Array.from(records.values()),
      }
      await api.post('/attendance/mark-daily', payload)
      setSaveMessage({ type: 'success', text: 'Attendance saved successfully.' })
      refetchStatus()
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save attendance.' })
    } finally {
      setSaving(false)
    }
  }

  const handleLock = async () => {
    if (!effectiveCourseId) return
    setLocking(true)
    setSaveMessage(null)
    try {
      const endpoint = classStatus?.locked ? '/attendance/unlock' : '/attendance/lock'
      await api.post(endpoint, { courseId: effectiveCourseId, date: selectedDate })
      setSaveMessage({
        type: 'success',
        text: classStatus?.locked ? 'Attendance unlocked.' : 'Attendance locked.',
      })
      refetchStatus()
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update lock status.' })
    } finally {
      setLocking(false)
    }
  }

  const handleModeToggle = (targetMode: ModeType) => {
    if (classStatus?.mode === targetMode) return
    setPendingMode(targetMode)
    setShowModeDialog(true)
  }

  const confirmModeSwitch = async () => {
    if (!effectiveCourseId || !pendingMode) return
    setSaving(true)
    setSaveMessage(null)
    try {
      const endpoint = pendingMode === 'SUBJECT' ? '/attendance/enable-subject-mode' : '/attendance/disable-subject-mode'
      await api.post(endpoint, { courseId: effectiveCourseId, date: selectedDate })
      setSaveMessage({ type: 'success', text: `Switched to ${pendingMode === 'SUBJECT' ? 'Subject' : 'Coordinator'} mode.` })
      setShowModeDialog(false)
      setPendingMode(null)
      refetchStatus()
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.response?.data?.message || 'Failed to switch mode.' })
      setShowModeDialog(false)
      setPendingMode(null)
    } finally {
      setSaving(false)
    }
  }

  const currentMode = classStatus?.mode || 'COORDINATOR'
  const isLocked = classStatus?.locked || false

  const totalStudents = students?.length || 0
  const presentCount = Array.from(records.values()).filter((r) => r.status === 'PRESENT').length
  const absentCount = Array.from(records.values()).filter((r) => r.status === 'ABSENT').length
  const lateCount = Array.from(records.values()).filter((r) => r.status === 'LATE').length

  const isLoading = coursesLoading

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-gray-500">Loading coordinator data...</p>
      </div>
    )
  }

  if (coursesError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-12 h-12 text-red-300" />
        <h2 className="text-lg font-semibold text-gray-700">Unable to Load Classes</h2>
        <p className="text-sm text-red-500 text-center max-w-md">{coursesError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <BookOpen className="w-12 h-12 text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-700">No Classes Assigned</h2>
        <p className="text-sm text-gray-500 text-center max-w-md">
          You have not been assigned as a class coordinator for any course.
          Contact the Principal to get assigned.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coordinator Attendance</h1>
          <p className="text-gray-500 text-sm">
            Mark daily attendance for your class
          </p>
        </div>
        <button
          onClick={() => {
            refetchStatus()
            refetchStudents()
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Class & Date Selector */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
            <div className="relative">
              <select
                value={effectiveCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              >
                {courses.map((c: Course) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) - {c.studentCount} students
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              <span className="font-semibold">{totalStudents}</span> Students
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Mode:</span>
            <span className={cn(
              'px-2.5 py-1 text-xs font-medium rounded-full',
              currentMode === 'COORDINATOR'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'
            )}>
              {currentMode === 'COORDINATOR' ? 'Coordinator' : 'Subject-wise'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            {isLocked ? (
              <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                <Lock className="h-3 w-3" /> Locked
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                <Unlock className="h-3 w-3" /> Unlocked
              </span>
            )}
          </div>
          {/* Mode Toggle */}
          <div className="ml-auto flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => handleModeToggle('COORDINATOR')}
              disabled={isLocked}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors',
                currentMode === 'COORDINATOR'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50',
                isLocked && 'opacity-50 cursor-not-allowed'
              )}
            >
              <ClipboardCheck className="h-3.5 w-3.5" /> Coordinator
            </button>
            <button
              onClick={() => handleModeToggle('SUBJECT')}
              disabled={isLocked}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors',
                currentMode === 'SUBJECT'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50',
                isLocked && 'opacity-50 cursor-not-allowed'
              )}
            >
              <BookOpen className="h-3.5 w-3.5" /> Subject-wise
            </button>
          </div>
        </div>
      </div>

      {/* Session Tabs (Coordinator Mode Only) */}
      {currentMode === 'COORDINATOR' && (
        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            {(['morning', 'evening'] as SessionType[]).map((session) => (
              <button
                key={session}
                onClick={() => setSelectedSession(session)}
                className={cn(
                  'flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors',
                  selectedSession === session
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                {session === 'morning' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {session.charAt(0).toUpperCase() + session.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 mr-1">Quick:</span>
          <button
            onClick={() => markAll('PRESENT')}
            disabled={isLocked || currentMode === 'SUBJECT'}
            className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />
            All Present
          </button>
          <button
            onClick={() => markAll('ABSENT')}
            disabled={isLocked || currentMode === 'SUBJECT'}
            className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="inline h-3.5 w-3.5 mr-1" />
            All Absent
          </button>
          <button
            onClick={() => markAll('LATE')}
            disabled={isLocked || currentMode === 'SUBJECT'}
            className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Clock className="inline h-3.5 w-3.5 mr-1" />
            All Late
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border p-3 shadow-sm text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">{totalStudents}</p>
          </div>
          <div className="bg-white rounded-xl border p-3 shadow-sm text-center">
            <p className="text-xs text-green-600">Present</p>
            <p className="text-lg font-bold text-green-600">{presentCount}</p>
          </div>
          <div className="bg-white rounded-xl border p-3 shadow-sm text-center">
            <p className="text-xs text-red-600">Absent</p>
            <p className="text-lg font-bold text-red-600">{absentCount}</p>
          </div>
          <div className="bg-white rounded-xl border p-3 shadow-sm text-center">
            <p className="text-xs text-amber-600">Late</p>
            <p className="text-lg font-bold text-amber-600">{lateCount}</p>
          </div>
        </div>
      </div>

      {/* Save / Lock Messages */}
      {saveMessage && (
        <div className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-lg text-sm',
          saveMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        )}>
          {saveMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {saveMessage.text}
        </div>
      )}

      {/* Student List */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {studentsLoading || recordsLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !students || students.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No students in this class</p>
          </div>
        ) : currentMode === 'SUBJECT' ? (
          <div className="text-center py-16 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">Subject-wise Mode Active</p>
            <p className="text-sm text-gray-400 mt-1">
              Subject teachers will mark attendance during their own timetable periods.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-20">#</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Roll No</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Student Name</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Present</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Absent</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Late</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student: Student, idx: number) => {
                  const rec = records.get(student.id)
                  const status = rec?.status || 'ABSENT'
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 font-mono">{student.rollNumber || '-'}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => updateRecord(student.id, 'PRESENT')}
                          disabled={isLocked}
                          className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            status === 'PRESENT'
                              ? 'bg-green-100 text-green-700 ring-2 ring-green-300'
                              : 'text-gray-400 hover:bg-green-50 hover:text-green-600',
                            isLocked && 'opacity-50 cursor-not-allowed'
                          )}
                          title="Present"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => updateRecord(student.id, 'ABSENT')}
                          disabled={isLocked}
                          className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            status === 'ABSENT'
                              ? 'bg-red-100 text-red-700 ring-2 ring-red-300'
                              : 'text-gray-400 hover:bg-red-50 hover:text-red-600',
                            isLocked && 'opacity-50 cursor-not-allowed'
                          )}
                          title="Absent"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => updateRecord(student.id, 'LATE')}
                          disabled={isLocked}
                          className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            status === 'LATE'
                              ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300'
                              : 'text-gray-400 hover:bg-amber-50 hover:text-amber-600',
                            isLocked && 'opacity-50 cursor-not-allowed'
                          )}
                          title="Late"
                        >
                          <Clock className="h-5 w-5" />
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="text"
                          value={remarks.get(student.id) || ''}
                          onChange={(e) => updateRemarks(student.id, e.target.value)}
                          disabled={isLocked}
                          placeholder="Optional remark"
                          className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {currentMode === 'COORDINATOR' && students && students.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {totalStudents > 0 && (
              <span>
                {presentCount + absentCount + lateCount} of {totalStudents} marked
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLock}
              disabled={locking || currentMode === 'SUBJECT'}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                isLocked
                  ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  : 'bg-white border-red-200 text-red-700 hover:bg-red-50',
                (locking || currentMode === 'SUBJECT') && 'opacity-50 cursor-not-allowed'
              )}
            >
              {locking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isLocked ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {isLocked ? 'Unlock Attendance' : 'Lock Attendance'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || isLocked}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Attendance
            </button>
          </div>
        </div>
      )}

      {/* Mode Switch Confirmation Dialog */}
      {showModeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setShowModeDialog(false); setPendingMode(null) }} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Switch Attendance Mode</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to switch to <strong>{pendingMode === 'SUBJECT' ? 'Subject-wise' : 'Coordinator'}</strong> mode?
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-amber-800">
                Morning and Evening attendance will be disabled for this class today. Subject teachers will mark attendance during their own timetable periods.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowModeDialog(false); setPendingMode(null) }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmModeSwitch}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Confirm Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoordinatorAttendance

import { useState, useEffect, useMemo } from 'react'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  RefreshCw,
  Users,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Lock,
  Unlock,
  ClipboardCheck,
  Sun,
  Moon,
  Save,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  Clock,
  ArrowLeft,
} from 'lucide-react'

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE'
type SessionType = 'morning' | 'evening'

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

interface MonthOverview {
  year: number
  month: number
  totalStudents: number
  dates: Array<{
    date: string
    mode: string | null
    locked: boolean
    morning: number
    evening: number
    totalStudents: number
  }>
}

export function CoordinatorAttendance() {
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [overview, setOverview] = useState<MonthOverview | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<SessionType>('morning')
  const [students, setStudents] = useState<Student[]>([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [records, setRecords] = useState<Map<string, AttendanceRecord>>(new Map())
  const [remarks, setRemarks] = useState<Map<string, string>>(new Map())
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [locking, setLocking] = useState(false)
  const [dayStatus, setDayStatus] = useState<any>(null)
  const [dayStatusLoading, setDayStatusLoading] = useState(false)

  const effectiveCourseId = selectedCourseId || courses?.[0]?.id || ''

  // Load courses
  useEffect(() => {
    const loadCourses = async () => {
      setCoursesLoading(true)
      try {
        const res = await api.get('/attendance/courses')
        setCourses(res.data.data)
        if (res.data.data.length > 0 && !selectedCourseId) {
          setSelectedCourseId(res.data.data[0].id)
        }
      } catch {
      } finally {
        setCoursesLoading(false)
      }
    }
    loadCourses()
  }, [])

  // Load monthly overview
  const loadOverview = async () => {
    if (!effectiveCourseId) return
    setOverviewLoading(true)
    try {
      const res = await api.get(`/attendance/monthly-overview?courseId=${effectiveCourseId}&year=${currentYear}&month=${currentMonth}`)
      setOverview(res.data.data)
    } catch {
    } finally {
      setOverviewLoading(false)
    }
  }

  useEffect(() => {
    loadOverview()
  }, [effectiveCourseId, currentYear, currentMonth])

  // Load day status when date is selected
  useEffect(() => {
    if (!selectedDate || !effectiveCourseId) {
      setDayStatus(null)
      return
    }
    const loadDayStatus = async () => {
      setDayStatusLoading(true)
      try {
        const res = await api.get(`/attendance/class-status?courseId=${effectiveCourseId}&date=${selectedDate}`)
        setDayStatus(res.data.data)
      } catch {
      } finally {
        setDayStatusLoading(false)
      }
    }
    loadDayStatus()
  }, [selectedDate, effectiveCourseId])

  // Load students when date is selected
  useEffect(() => {
    if (!selectedDate || !effectiveCourseId) {
      setStudents([])
      return
    }
    const loadStudents = async () => {
      setStudentsLoading(true)
      try {
        const res = await api.get(`/attendance/class-students?courseId=${effectiveCourseId}`)
        setStudents(res.data.data)
      } catch {
      } finally {
        setStudentsLoading(false)
      }
    }
    loadStudents()
  }, [selectedDate, effectiveCourseId])

  // Load existing records for selected date + session
  useEffect(() => {
    if (!selectedDate || !effectiveCourseId || students.length === 0) return
    const loadRecords = async () => {
      try {
        const res = await api.get(`/attendance/daily?courseId=${effectiveCourseId}&date=${selectedDate}&session=${selectedSession}`)
        const existing = res.data.data || []
        if (existing.length > 0) {
          const newRecords = new Map<string, AttendanceRecord>()
          const newRemarks = new Map<string, string>()
          existing.forEach((rec: any) => {
            newRecords.set(rec.studentId, { studentId: rec.studentId, status: rec.status as AttendanceStatus, remarks: rec.remarks || '' })
            newRemarks.set(rec.studentId, rec.remarks || '')
          })
          setRecords(newRecords)
          setRemarks(newRemarks)
        } else {
          const newRecords = new Map<string, AttendanceRecord>()
          const newRemarks = new Map<string, string>()
          students.forEach((s) => {
            newRecords.set(s.id, { studentId: s.id, status: 'ABSENT', remarks: '' })
            newRemarks.set(s.id, '')
          })
          setRecords(newRecords)
          setRemarks(newRemarks)
        }
      } catch {
        const newRecords = new Map<string, AttendanceRecord>()
        const newRemarks = new Map<string, string>()
        students.forEach((s) => {
          newRecords.set(s.id, { studentId: s.id, status: 'ABSENT', remarks: '' })
          newRemarks.set(s.id, '')
        })
        setRecords(newRecords)
        setRemarks(newRemarks)
      }
    }
    loadRecords()
  }, [selectedDate, effectiveCourseId, students, selectedSession])

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
      if (existing) next.set(studentId, { ...existing, remarks: value })
      return next
    })
  }

  const markAll = (status: AttendanceStatus) => {
    if (!students) return
    const newRecords = new Map<string, AttendanceRecord>()
    students.forEach((s) => {
      newRecords.set(s.id, { studentId: s.id, status, remarks: records.get(s.id)?.remarks || '' })
    })
    setRecords(newRecords)
  }

  const handleSave = async () => {
    if (!effectiveCourseId || !selectedDate || records.size === 0) return
    setSaving(true)
    setSaveMessage(null)
    try {
      await api.post('/attendance/mark-daily', {
        courseId: effectiveCourseId,
        date: selectedDate,
        session: selectedSession,
        records: Array.from(records.values()),
      })
      setSaveMessage({ type: 'success', text: 'Attendance saved successfully.' })
      loadOverview()
      setTimeout(() => { setSelectedDate(null); setSaveMessage(null) }, 800)
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save attendance.' })
    } finally {
      setSaving(false)
    }
  }

  const handleLock = async () => {
    if (!effectiveCourseId || !selectedDate) return
    setLocking(true)
    setSaveMessage(null)
    try {
      const endpoint = dayStatus?.locked ? '/attendance/unlock' : '/attendance/lock'
      await api.post(endpoint, { courseId: effectiveCourseId, date: selectedDate })
      setSaveMessage({
        type: 'success',
        text: dayStatus?.locked ? 'Attendance unlocked.' : 'Attendance locked.',
      })
      const res = await api.get(`/attendance/class-status?courseId=${effectiveCourseId}&date=${selectedDate}`)
      setDayStatus(res.data.data)
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update lock status.' })
    } finally {
      setLocking(false)
    }
  }

  const totalStudents = students?.length || 0
  const presentCount = Array.from(records.values()).filter((r) => r.status === 'PRESENT').length
  const absentCount = Array.from(records.values()).filter((r) => r.status === 'ABSENT').length
  const lateCount = Array.from(records.values()).filter((r) => r.status === 'LATE').length
  const isLocked = dayStatus?.locked || false
  const isReadOnly = selectedDate ? !isToday(selectedDate) : false

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
    const days: Array<{ day: number; dateStr: string } | null> = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ day: d, dateStr })
    }
    return days
  }, [currentYear, currentMonth])

  const getOverviewForDate = (dateStr: string) => {
    return overview?.dates.find((d) => d.date === dateStr)
  }

  const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().split('T')[0]
  }

  if (coursesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-gray-500">Loading classes...</p>
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
        </p>
      </div>
    )
  }

  // Date drill-down view
  if (selectedDate) {
    return (
      <div className="space-y-6">
        {/* Preview-only banner for past dates */}
        {isReadOnly && (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Preview Only</span> — Past attendance is read-only. You can only view, not edit.
          </div>
        )}

        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedDate(null); setSaveMessage(null) }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </h1>
              <p className="text-gray-500 text-sm">
                {courses.find((c) => c.id === effectiveCourseId)?.name} — Attendance
              </p>
            </div>
          </div>
          <button
            onClick={() => { loadOverview(); loadStudents(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Session Tabs */}
        {dayStatus?.mode === 'COORDINATOR' && (
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

        {/* Status Bar */}
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                <span className="font-semibold">{totalStudents}</span> Students
              </span>
            </div>
            {dayStatus?.mode && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Mode:</span>
                <span className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-full',
                  dayStatus.mode === 'COORDINATOR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                )}>
                  {dayStatus.mode === 'COORDINATOR' ? 'Coordinator' : 'Subject-wise'}
                </span>
              </div>
            )}
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
          </div>
        </div>

        {/* Quick Actions & Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-1">Quick:</span>
            <button
              onClick={() => markAll('PRESENT')}
              disabled={isLocked || isReadOnly}
              className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />
              All Present
            </button>
            <button
              onClick={() => markAll('ABSENT')}
              disabled={isLocked || isReadOnly}
              className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <XCircle className="inline h-3.5 w-3.5 mr-1" />
              All Absent
            </button>
            <button
              onClick={() => markAll('LATE')}
              disabled={isLocked || isReadOnly}
              className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
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
          {studentsLoading ? (
            <div className="p-5 space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg">No students in this class</p>
            </div>
          ) : dayStatus?.mode === 'SUBJECT' ? (
            <div className="text-center py-16 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">Subject-wise Mode Active</p>
              <p className="text-sm text-gray-400 mt-1">Subject teachers mark attendance during their periods.</p>
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
                            disabled={isLocked || isReadOnly}
                            className={cn(
                              'p-1.5 rounded-lg transition-colors',
                              status === 'PRESENT'
                                ? 'bg-green-100 text-green-700 ring-2 ring-green-300'
                                : 'text-gray-400 hover:bg-green-50 hover:text-green-600',
                              (isLocked || isReadOnly) && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => updateRecord(student.id, 'ABSENT')}
                            disabled={isLocked || isReadOnly}
                            className={cn(
                              'p-1.5 rounded-lg transition-colors',
                              status === 'ABSENT'
                                ? 'bg-red-100 text-red-700 ring-2 ring-red-300'
                                : 'text-gray-400 hover:bg-red-50 hover:text-red-600',
                              (isLocked || isReadOnly) && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => updateRecord(student.id, 'LATE')}
                            disabled={isLocked || isReadOnly}
                            className={cn(
                              'p-1.5 rounded-lg transition-colors',
                              status === 'LATE'
                                ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300'
                                : 'text-gray-400 hover:bg-amber-50 hover:text-amber-600',
                              (isLocked || isReadOnly) && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <Clock className="h-5 w-5" />
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <input
                            type="text"
                            value={remarks.get(student.id) || ''}
                            onChange={(e) => updateRemarks(student.id, e.target.value)}
                            disabled={isLocked || isReadOnly}
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
        {dayStatus?.mode !== 'SUBJECT' && students.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {totalStudents > 0 && (
                <span>{presentCount + absentCount + lateCount} of {totalStudents} marked</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLock}
                disabled={locking || dayStatus?.mode === 'SUBJECT' || isReadOnly}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                  isLocked
                    ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    : 'bg-white border-red-200 text-red-700 hover:bg-red-50',
                  (locking || dayStatus?.mode === 'SUBJECT' || isReadOnly) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {locking ? <Loader2 className="h-4 w-4 animate-spin" /> : isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {isLocked ? 'Unlock' : 'Lock'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || isLocked || isReadOnly}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Attendance
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Calendar grid view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coordinator Attendance</h1>
          <p className="text-gray-500 text-sm">Select a date to mark attendance</p>
        </div>
        <button
          onClick={loadOverview}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Class Selector */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
        <div className="relative max-w-md">
          <select
            value={effectiveCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.code}) — {c.studentCount} students</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Calendar Month Navigation */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear((y) => y - 1) }
              else setCurrentMonth((m) => m - 1)
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => {
              if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear((y) => y + 1) }
              else setCurrentMonth((m) => m + 1)
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        {overviewLoading ? (
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, idx) => {
              if (!item) return <div key={`empty-${idx}`} />
              const ov = getOverviewForDate(item.dateStr)
              const hasMorning = ov && ov.morning > 0
              const hasEvening = ov && ov.evening > 0
              const allMarked = ov && ov.totalStudents > 0 && (ov.morning >= ov.totalStudents || ov.evening >= ov.totalStudents)
                  const today = isToday(item.dateStr)
                  const past = new Date(item.dateStr + 'T00:00:00') < new Date(new Date().toISOString().split('T')[0] + 'T00:00:00')
                  const future = new Date(item.dateStr + 'T00:00:00') > new Date(new Date().toISOString().split('T')[0] + 'T00:00:00')

                  return (
                    <button
                      key={item.dateStr}
                      onClick={() => !future && setSelectedDate(item.dateStr)}
                      disabled={future}
                      className={cn(
                        'h-24 p-2 rounded-lg border text-left transition-all',
                        future && 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100',
                        !future && 'hover:ring-2 hover:ring-blue-300 hover:border-blue-300',
                        today && !future && 'ring-2 ring-blue-500 border-blue-500',
                        !future && allMarked && 'bg-green-50 border-green-200',
                        !future && !allMarked && hasMorning && 'bg-amber-50 border-amber-200',
                        !future && !allMarked && !hasMorning && past && 'bg-gray-50 border-gray-200',
                        !future && !allMarked && !hasMorning && !past && 'bg-white border-gray-200',
                      )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'text-sm font-medium',
                      today ? 'text-blue-600' : 'text-gray-900'
                    )}>
                      {item.day}
                    </span>
                    {allMarked ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-medium text-green-600">
                        <CheckCircle2 className="h-3 w-3" /> Done
                      </span>
                    ) : ov && ov.morning > 0 ? (
                      <span className="text-[10px] font-medium text-amber-600">
                        Partial
                      </span>
                    ) : past ? (
                      <span className="text-[10px] font-medium text-red-500">
                        Missed
                      </span>
                    ) : null}
                  </div>
                  {ov && (ov.morning > 0 || ov.evening > 0) && (
                    <div className="mt-1 space-y-0.5">
                      {ov.morning > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-600">
                          <Sun className="h-2.5 w-2.5 text-amber-500" />
                          {ov.morning}/{ov.totalStudents}
                        </div>
                      )}
                      {ov.evening > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-600">
                          <Moon className="h-2.5 w-2.5 text-indigo-500" />
                          {ov.evening}/{ov.totalStudents}
                        </div>
                      )}
                    </div>
                  )}
                  {(!ov || (ov.morning === 0 && ov.evening === 0)) && !past && (
                    <div className="mt-1 text-[10px] text-gray-400">No data</div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CoordinatorAttendance

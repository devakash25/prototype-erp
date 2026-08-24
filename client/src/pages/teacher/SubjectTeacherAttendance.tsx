import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  Users,
  ClipboardCheck,
  BookOpen,
  MapPin,
  ArrowLeft,
  Save,
  UserCheck,
  UserX,
  AlertTriangle,
} from 'lucide-react'

interface Student {
  id: string
  name: string
  admissionNumber: string
  rollNumber: string
}

interface PeriodEntry {
  entryId: string
  subject: string
  subjectCode?: string
  course: string
  courseId: string
  courseCode?: string
  time: string
  totalStudents: number
  marked: number
  delegated: boolean
  locked: boolean
}

export function SubjectTeacherAttendance() {
  const { data: scheduleData, loading, error, refetch } = useApi('/attendance/teacher/status')
  const [selectedEntry, setSelectedEntry] = useState<PeriodEntry | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [studentError, setStudentError] = useState<string | null>(null)
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({})
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })

  const periods: PeriodEntry[] = scheduleData?.periods ?? scheduleData ?? []

  const loadStudents = async (entry: PeriodEntry) => {
    if (!entry.delegated) return
    setLoadingStudents(true)
    setStudentError(null)
    setSelectedEntry(entry)
    setAttendance({})
    setSaveSuccess(false)
    try {
      const res = await api.get(
        `/attendance/teacher/period-students?entryId=${entry.entryId}&date=${dateStr}`
      )
      const data = res.data.data
      const studentList: Student[] = data?.students ?? data ?? []
      setStudents(studentList)
      const initial: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {}
      studentList.forEach((s: Student) => {
        initial[s.id] = 'PRESENT'
      })
      setAttendance(initial)
    } catch (err: any) {
      setStudentError(err.response?.data?.message || err.message || 'Failed to load students')
      setStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  const setStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  const markAll = (status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    const updated: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {}
    students.forEach((s) => {
      updated[s.id] = status
    })
    setAttendance(updated)
  }

  const saveAttendance = async () => {
    if (!selectedEntry) return
    setSaving(true)
    setSaveSuccess(false)
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
      }))
      await api.post('/attendance/teacher/mark-period', {
        timetableEntryId: selectedEntry.entryId,
        date: dateStr,
        records,
      })
      setSaveSuccess(true)
      refetch()
      setTimeout(() => {
        setSelectedEntry(null)
        setStudents([])
        setAttendance({})
        setSaveSuccess(false)
      }, 2000)
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const goBack = () => {
    setSelectedEntry(null)
    setStudents([])
    setAttendance({})
    setSaveSuccess(false)
    setStudentError(null)
  }

  const getAttendanceCounts = () => {
    const counts = { present: 0, absent: 0, late: 0 }
    Object.values(attendance).forEach((s) => {
      if (s === 'PRESENT') counts.present++
      else if (s === 'ABSENT') counts.absent++
      else if (s === 'LATE') counts.late++
    })
    return counts
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600">Failed to load attendance data</p>
        <button
          onClick={refetch}
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
        <div className="flex items-center gap-3">
          {selectedEntry && (
            <button
              onClick={goBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedEntry ? 'Mark Attendance' : 'My Classes Today'}
          </h1>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Date:</span>
            <span className="font-medium text-gray-900">
              {dayName}, {today.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Periods today:</span>
            <span className="font-medium text-gray-900">{loading ? '—' : periods.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Completed:</span>
            <span className="font-medium text-gray-900">
              {loading ? '—' : periods.filter((p) => p.marked === p.totalStudents && p.totalStudents > 0).length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Pending:</span>
            <span className="font-medium text-gray-900">
              {loading ? '—' : periods.filter((p) => p.marked < p.totalStudents || p.totalStudents === 0).length}
            </span>
          </div>
        </div>
      </div>

      {selectedEntry ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-5 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">{selectedEntry.subject}</h2>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">Class {selectedEntry.course}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <ClipboardCheck className="h-3.5 w-3.5" /> {selectedEntry.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {selectedEntry.marked}/{selectedEntry.totalStudents} marked
                    </span>
                  </div>
                </div>
                {selectedEntry.marked === selectedEntry.totalStudents && selectedEntry.totalStudents > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                  </div>
                )}
              </div>
            </div>

            {selectedEntry.marked === selectedEntry.totalStudents && selectedEntry.totalStudents > 0 && (
              <div className="mx-5 mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-700">
                  Attendance already marked. This page is read-only.
                </p>
              </div>
            )}
          </div>

          {selectedEntry.delegated && !(selectedEntry.marked === selectedEntry.totalStudents && selectedEntry.totalStudents > 0) && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-500">Quick mark:</span>
              <button
                onClick={() => markAll('PRESENT')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <UserCheck className="h-3.5 w-3.5" /> All Present
              </button>
              <button
                onClick={() => markAll('ABSENT')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <UserX className="h-3.5 w-3.5" /> All Absent
              </button>
              <button
                onClick={() => markAll('LATE')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Clock className="h-3.5 w-3.5" /> All Late
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {loadingStudents ? (
              <div className="p-5 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : studentError ? (
              <div className="text-center py-16 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-400" />
                <p className="text-lg">{studentError}</p>
                <button
                  onClick={() => selectedEntry && loadStudents(selectedEntry)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                >
                  Try again
                </button>
              </div>
            ) : !students.length ? (
              <div className="text-center py-16 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg">No students found for this period</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Roll #
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Student Name
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map((student) => {
                      const status = attendance[student.id] || 'PRESENT'
                      const isReadonly = selectedEntry.marked === selectedEntry.totalStudents && selectedEntry.totalStudents > 0
                      return (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4 text-sm font-mono text-gray-600">
                            {student.rollNumber}
                          </td>
                          <td className="px-5 py-4 text-sm font-medium text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setStatus(student.id, 'PRESENT')}
                                disabled={isReadonly}
                                className={cn(
                                  'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                                  status === 'PRESENT'
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-white text-green-700 border-green-200 hover:bg-green-50',
                                  isReadonly && 'opacity-60 cursor-not-allowed'
                                )}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => setStatus(student.id, 'ABSENT')}
                                disabled={isReadonly}
                                className={cn(
                                  'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                                  status === 'ABSENT'
                                    ? 'bg-red-600 text-white border-red-600'
                                    : 'bg-white text-red-700 border-red-200 hover:bg-red-50',
                                  isReadonly && 'opacity-60 cursor-not-allowed'
                                )}
                              >
                                Absent
                              </button>
                              <button
                                onClick={() => setStatus(student.id, 'LATE')}
                                disabled={isReadonly}
                                className={cn(
                                  'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                                  status === 'LATE'
                                    ? 'bg-orange-600 text-white border-orange-600'
                                    : 'bg-white text-orange-700 border-orange-200 hover:bg-orange-50',
                                  isReadonly && 'opacity-60 cursor-not-allowed'
                                )}
                              >
                                Late
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {students.length > 0 && !(selectedEntry.marked === selectedEntry.totalStudents && selectedEntry.totalStudents > 0) && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Present: {getAttendanceCounts().present}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Absent: {getAttendanceCounts().absent}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Late: {getAttendanceCounts().late}
                </span>
              </div>
              <button
                onClick={saveAttendance}
                disabled={saving}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  saveSuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700',
                  saving && 'opacity-60 cursor-not-allowed'
                )}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Saved!
                  </>
                ) : saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Attendance
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !periods.length ? (
            <div className="text-center py-16 text-gray-500">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg">No classes assigned for today</p>
              <p className="text-sm text-gray-400 mt-1">Check your schedule for upcoming classes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {periods.map((period) => {
                const isCompleted = period.marked === period.totalStudents && period.totalStudents > 0
                const canMark = period.delegated && !isCompleted
                return (
                  <button
                    key={period.entryId}
                    onClick={() => loadStudents(period)}
                    disabled={!canMark}
                    className={cn(
                      'w-full text-left bg-white rounded-xl border shadow-sm p-5 transition-all',
                      canMark
                        ? 'hover:shadow-md hover:border-blue-200 cursor-pointer'
                        : 'opacity-70 cursor-default',
                      isCompleted && 'bg-green-50/30'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{period.subject}</h3>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">Class {period.course}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <ClipboardCheck className="h-3.5 w-3.5" /> {period.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {period.marked}/{period.totalStudents} marked
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {!period.delegated && (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                            Not Delegated
                          </span>
                        )}
                        {period.delegated && (
                          <span
                            className={cn(
                              'px-2.5 py-1 text-xs font-medium rounded-full',
                              isCompleted
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-orange-100 text-orange-700 border border-orange-200'
                            )}
                          >
                            {isCompleted ? 'Completed' : 'Pending'}
                          </span>
                        )}
                        {canMark && (
                          <span className="text-sm font-medium text-blue-600">Mark →</span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SubjectTeacherAttendance

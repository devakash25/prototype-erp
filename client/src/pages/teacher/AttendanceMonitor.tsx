import { useState, useEffect, useCallback } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  CalendarDays,
  RefreshCw,
  CheckCircle2,
  Clock,
  Users,
  Lock,
  Unlock,
  AlertCircle,
  ChevronDown,
  Sun,
  Moon,
  Loader2,
  BookOpen,
  Shield,
  Eye,
} from 'lucide-react'

interface Course {
  id: string
  name: string
  code: string
}

interface PeriodStatus {
  entryId: string
  subject: string
  subjectCode: string
  time: string
  room: string
  marked: number
  total: number
  completed: boolean
}

interface ClassStatus {
  courseId: string
  date: string
  students: any[]
  mode: string
  enabledBy: string
  locked: boolean
  lockedAt: string | null
  morningMarked: number
  eveningMarked: number
  totalStudents: number
  periodStatus: PeriodStatus[]
}

interface DailyRecord {
  studentId: string
  studentName: string
  enrollmentNo: string
  status: 'present' | 'absent' | 'late' | 'excused' | null
  session: string
  markedBy: string | null
  markedAt: string | null
}

export function AttendanceMonitor() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedSession, setSelectedSession] = useState<'morning' | 'evening'>('morning')
  const [lockLoading, setLockLoading] = useState(false)

  const { data: coursesData, loading: coursesLoading } = useApi<Course[]>('/attendance/courses')

  const statusEndpoint = selectedCourseId
    ? `/attendance/class-status?courseId=${selectedCourseId}&date=${selectedDate}`
    : ''

  const { data: classStatus, loading: statusLoading, error: statusError, refetch: refetchStatus } = useApi<ClassStatus>(
    statusEndpoint,
    [selectedCourseId, selectedDate]
  )

  const dailyEndpoint = selectedCourseId
    ? `/attendance/daily?courseId=${selectedCourseId}&date=${selectedDate}&session=${selectedSession}`
    : ''

  const { data: dailyRecords, loading: dailyLoading, refetch: refetchDaily } = useApi<DailyRecord[]>(
    dailyEndpoint,
    [selectedCourseId, selectedDate, selectedSession]
  )

  const courses: Course[] = coursesData ?? []
  const status: ClassStatus | null = classStatus ?? null
  const records: DailyRecord[] = dailyRecords ?? []

  const totalPeriods = status?.periodStatus?.length ?? 0
  const completedPeriods = status?.periodStatus?.filter((p) => p.completed).length ?? 0
  const pendingPeriods = totalPeriods - completedPeriods

  const totalStudents = status?.totalStudents ?? records.length ?? 0
  const morningMarked = status?.morningMarked ?? 0
  const eveningMarked = status?.eveningMarked ?? 0

  const presentCount = records.filter((r) => r.status === 'present' || r.status === 'late').length
  const absentCount = records.filter((r) => r.status === 'absent').length
  const unmarkedCount = records.filter((r) => r.status === null).length

  const handleLock = useCallback(async () => {
    if (!selectedCourseId) return
    setLockLoading(true)
    try {
      await api.post('/attendance/lock', { courseId: selectedCourseId, date: selectedDate })
      refetchStatus()
    } catch (err) {
      console.error('Failed to lock attendance', err)
    } finally {
      setLockLoading(false)
    }
  }, [selectedCourseId, selectedDate, refetchStatus])

  const handleUnlock = useCallback(async () => {
    if (!selectedCourseId) return
    setLockLoading(true)
    try {
      await api.post('/attendance/unlock', { courseId: selectedCourseId, date: selectedDate })
      refetchStatus()
    } catch (err) {
      console.error('Failed to unlock attendance', err)
    } finally {
      setLockLoading(false)
    }
  }, [selectedCourseId, selectedDate, refetchStatus])

  const handleRefresh = useCallback(() => {
    refetchStatus()
    refetchDaily()
  }, [refetchStatus, refetchDaily])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Monitor</h1>
          <p className="text-sm text-gray-500">Real-time monitoring of class attendance</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={cn('h-4 w-4', statusLoading && 'animate-spin')} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <div className="relative">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-8 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="min-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="relative">
              <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {statusError && (
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p className="text-gray-600">Failed to load attendance status</p>
            <button
              onClick={refetchStatus}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        </div>
      )}

      {!selectedCourseId && !statusError && (
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="text-center py-16 text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">Select a course and date to monitor attendance</p>
          </div>
        </div>
      )}

      {selectedCourseId && !statusError && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Periods</p>
                  <p className="text-2xl font-bold text-gray-900">{statusLoading ? '—' : totalPeriods}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{statusLoading ? '—' : completedPeriods}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{statusLoading ? '—' : pendingPeriods}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Students</p>
                  <p className="text-2xl font-bold text-gray-900">{statusLoading ? '—' : totalStudents}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {statusLoading ? (
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-100 rounded w-48 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-28 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            ) : !status ? (
              <div className="text-center py-16 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg">No status data available</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Mode & Lock Status</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Current attendance mode and lock configuration
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {status.locked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                        <Lock className="h-3.5 w-3.5" /> Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        <Unlock className="h-3.5 w-3.5" /> Unlocked
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Mode</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{status.mode || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Enabled By</p>
                    <p className="text-sm font-medium text-gray-900">{status.enabledBy || 'System'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Locked At</p>
                    <p className="text-sm font-medium text-gray-900">
                      {status.lockedAt
                        ? new Date(status.lockedAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Not locked'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {status.locked ? (
                    <button
                      onClick={handleUnlock}
                      disabled={lockLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {lockLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Unlock className="h-4 w-4" />
                      )}
                      Unlock Attendance
                    </button>
                  ) : (
                    <button
                      onClick={handleLock}
                      disabled={lockLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {lockLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      Lock Attendance
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {status.mode === 'subject' && (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              {statusLoading ? (
                <div className="p-6">
                  <div className="h-5 bg-gray-100 rounded w-40 mb-4 animate-pulse" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Period Status</h2>
                  <p className="text-sm text-gray-500 mb-4">Subject-wise attendance completion</p>

                  {status.periodStatus.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Clock className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                      <p>No periods configured for this day</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {status.periodStatus.map((period) => (
                        <div
                          key={period.entryId}
                          className={cn(
                            'border rounded-lg p-4 transition-all hover:shadow-sm',
                            period.completed ? 'bg-green-50/50 border-green-200' : 'bg-white border-gray-200'
                          )}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{period.subject}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{period.subjectCode}</p>
                            </div>
                            {period.completed ? (
                              <div className="p-1.5 bg-green-100 rounded-full">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </div>
                            ) : (
                              <div className="p-1.5 bg-orange-100 rounded-full">
                                <Clock className="h-4 w-4 text-orange-600" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Time: {period.time}</span>
                              <span>Room: {period.room}</span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  period.completed ? 'bg-green-500' : period.marked > 0 ? 'bg-blue-500' : 'bg-gray-300'
                                )}
                                style={{
                                  width: period.total > 0 ? `${(period.marked / period.total) * 100}%` : '0%',
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {period.marked}/{period.total} marked
                              </span>
                              <span
                                className={cn(
                                  'text-xs font-medium',
                                  period.completed ? 'text-green-600' : 'text-orange-600'
                                )}
                              >
                                {period.completed ? 'Completed' : 'In Progress'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {status.mode === 'coordinator' && (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              {statusLoading ? (
                <div className="p-6">
                  <div className="h-5 bg-gray-100 rounded w-48 mb-4 animate-pulse" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-36 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Morning / Evening Status</h2>
                  <p className="text-sm text-gray-500 mb-4">Coordinator-level attendance summary</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Sun className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Morning Session</p>
                          <p className="text-xs text-gray-500">Morning attendance</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Marked</span>
                          <span className="text-sm font-bold text-gray-900">{morningMarked} / {totalStudents}</span>
                        </div>
                        <div className="w-full bg-amber-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: totalStudents > 0 ? `${(morningMarked / totalStudents) * 100}%` : '0%' }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 text-right">
                          {totalStudents > 0 ? Math.round((morningMarked / totalStudents) * 100) : 0}% complete
                        </p>
                      </div>
                    </div>

                    <div className="border border-indigo-200 bg-indigo-50/50 rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Moon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Evening Session</p>
                          <p className="text-xs text-gray-500">Evening attendance</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Marked</span>
                          <span className="text-sm font-bold text-gray-900">{eveningMarked} / {totalStudents}</span>
                        </div>
                        <div className="w-full bg-indigo-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{ width: totalStudents > 0 ? `${(eveningMarked / totalStudents) * 100}%` : '0%' }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 text-right">
                          {totalStudents > 0 ? Math.round((eveningMarked / totalStudents) * 100) : 0}% complete
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold text-gray-900">Student Attendance Summary</h2>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setSelectedSession('morning')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                      selectedSession === 'morning'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <Sun className="inline h-3.5 w-3.5 mr-1" />
                    Morning
                  </button>
                  <button
                    onClick={() => setSelectedSession('evening')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                      selectedSession === 'evening'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <Moon className="inline h-3.5 w-3.5 mr-1" />
                    Evening
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">Individual student status for {selectedSession} session</p>

              {!selectedCourseId ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p>Select a course to view student details</p>
                </div>
              ) : dailyLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p>No attendance records found for this session</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-green-700">{presentCount}</p>
                      <p className="text-xs text-green-600">Present</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-red-700">{absentCount}</p>
                      <p className="text-xs text-red-600">Absent</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-gray-700">{unmarkedCount}</p>
                      <p className="text-xs text-gray-600">Unmarked</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-blue-700">{records.length}</p>
                      <p className="text-xs text-blue-600">Total</p>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="px-4 py-2.5 text-left font-medium text-gray-600">#</th>
                          <th className="px-4 py-2.5 text-left font-medium text-gray-600">Student Name</th>
                          <th className="px-4 py-2.5 text-left font-medium text-gray-600">Enrollment No.</th>
                          <th className="px-4 py-2.5 text-left font-medium text-gray-600">Status</th>
                          <th className="px-4 py-2.5 text-left font-medium text-gray-600">Marked By</th>
                          <th className="px-4 py-2.5 text-left font-medium text-gray-600">Marked At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {records.map((record, idx) => (
                          <tr key={record.studentId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{record.studentName}</td>
                            <td className="px-4 py-3 text-gray-600">{record.enrollmentNo}</td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
                                  record.status === 'present' && 'bg-green-100 text-green-700',
                                  record.status === 'absent' && 'bg-red-100 text-red-700',
                                  record.status === 'late' && 'bg-amber-100 text-amber-700',
                                  record.status === 'excused' && 'bg-blue-100 text-blue-700',
                                  record.status === null && 'bg-gray-100 text-gray-500'
                                )}
                              >
                                {record.status === 'present' && <CheckCircle2 className="h-3 w-3" />}
                                {record.status === 'absent' && <AlertCircle className="h-3 w-3" />}
                                {record.status === 'late' && <Clock className="h-3 w-3" />}
                                {record.status === null && <span className="h-1.5 w-1.5 bg-gray-400 rounded-full" />}
                                {record.status
                                  ? record.status.charAt(0).toUpperCase() + record.status.slice(1)
                                  : 'Unmarked'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{record.markedBy || '—'}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              {record.markedAt
                                ? new Date(record.markedAt).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AttendanceMonitor

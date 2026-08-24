import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw, Users, BookOpen, TrendingUp, AlertTriangle,
  ChevronLeft, ChevronRight, BarChart3, UserCheck
} from 'lucide-react'

type Tab = 'overview' | 'students' | 'academics' | 'attendance'

export function TeacherMyClass() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [attDays, setAttDays] = useState(30)

  const { data: courses, loading: coursesLoading } = useApi<any[]>('/teacher/coordinator/courses')

  const selectedCourse = (courses || []).find((c: any) => c.id === selectedCourseId)

  // Auto-select first course
  const effectiveCourseId = selectedCourseId || courses?.[0]?.id || ''

  const { data: students, loading: studentsLoading, refetch: refetchStudents } = useApi<any>(
    effectiveCourseId ? `/teacher/coordinator/students/${effectiveCourseId}?search=${search}&page=${page}&limit=20` : '',
    [effectiveCourseId, search, page]
  )

  const { data: academics, loading: academicsLoading, refetch: refetchAcademics } = useApi<any>(
    effectiveCourseId ? `/teacher/coordinator/academics/${effectiveCourseId}` : '',
    [effectiveCourseId]
  )

  const { data: attendance, loading: attendanceLoading, refetch: refetchAttendance } = useApi<any>(
    effectiveCourseId ? `/teacher/coordinator/attendance/${effectiveCourseId}?days=${attDays}` : '',
    [effectiveCourseId, attDays]
  )

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'students', label: 'Students' },
    { id: 'academics', label: 'Academics' },
    { id: 'attendance', label: 'Attendance' },
  ]

  const isLoading = coursesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Class</h1>
          <p className="text-gray-500 text-sm">
            {selectedCourse
              ? `${selectedCourse.name} (${selectedCourse.code})`
              : 'Select a course'}
          </p>
        </div>
        <button
          onClick={() => {
            refetchStudents()
            refetchAcademics()
            refetchAttendance()
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {/* Course Selector */}
      {courses.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Select Course:</span>
          <div className="flex gap-2 flex-wrap">
            {courses.map((c: any) => (
              <button
                key={c.id}
                onClick={() => { setSelectedCourseId(c.id); setPage(1); setSearch('') }}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                  effectiveCourseId === c.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                )}
              >
                {c.name}
                <span className="ml-2 text-xs opacity-70">({c.studentCount} students)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab courseId={effectiveCourseId} students={students} academics={academics} attendance={attendance}
          studentsLoading={studentsLoading} academicsLoading={academicsLoading} attendanceLoading={attendanceLoading} />
      )}

      {activeTab === 'students' && (
        <StudentsTab
          students={students} loading={studentsLoading}
          search={search} setSearch={setSearch}
          page={page} setPage={setPage}
        />
      )}

      {activeTab === 'academics' && (
        <AcademicsTab data={academics} loading={academicsLoading} />
      )}

      {activeTab === 'attendance' && (
        <AttendanceTab
          data={attendance} loading={attendanceLoading}
          attDays={attDays} setAttDays={setAttDays}
        />
      )}
    </div>
  )
}

function OverviewTab({ courseId, students, academics, attendance, studentsLoading, academicsLoading, attendanceLoading }: any) {
  if (studentsLoading || academicsLoading || attendanceLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    )
  }

  const kpis = [
    { label: 'Total Students', value: students?.total || 0, icon: Users, color: 'blue' },
    { label: 'Avg Marks', value: academics?.overallAvgMarks || 0, icon: TrendingUp, color: 'green' },
    { label: 'Pass Rate', value: `${academics?.overallPassRate || 0}%`, icon: UserCheck, color: 'purple' },
    { label: 'Avg Attendance', value: `${attendance?.avgAttendance || 0}%`, icon: BarChart3, color: 'amber' },
    { label: 'At-Risk Students', value: attendance?.atRiskStudents || 0, icon: AlertTriangle, color: 'red' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', `bg-${kpi.color}-50`)}>
                <kpi.icon className={cn('w-5 h-5', `text-${kpi.color}-600`)} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{kpi.label}</p>
                <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subject Performance */}
      {academics?.subjectPerformance?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Subject Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {academics.subjectPerformance.map((sp: any) => (
              <div key={sp.subjectId} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Avg Marks</span>
                  <span className="text-sm font-bold text-indigo-600">{sp.avgMarks}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Pass Rate</span>
                  <span className="text-sm font-medium text-green-600">{sp.passRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Results</span>
                  <span className="text-sm text-gray-700">{sp.totalResults}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* At-Risk Students */}
      {attendance?.attendanceList?.filter((s: any) => s.atRisk).length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h3 className="text-sm font-medium text-red-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />At-Risk Students (Below 75% Attendance)
          </h3>
          <div className="space-y-2">
            {attendance.attendanceList.filter((s: any) => s.atRisk).map((s: any) => (
              <div key={s.studentId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.presentDays}/{s.totalDays} days present</p>
                </div>
                <span className={cn(
                  'text-sm font-bold',
                  s.attendanceRate < 50 ? 'text-red-600' : 'text-amber-600'
                )}>
                  {s.attendanceRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StudentsTab({ students, loading, search, setSearch, page, setPage }: any) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    )
  }

  const studentList = students?.students || []
  const total = students?.total || 0
  const totalPages = students?.totalPages || 1

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Search students by name, admission no, or roll no..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Admission No</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Roll No</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {studentList.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-indigo-600">
                          {s.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 font-mono">{s.admissionNumber}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 font-mono">{s.rollNumber || '-'}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{s.email}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{s.phone || '-'}</td>
                </tr>
              ))}
              {studentList.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">No students found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AcademicsTab({ data, loading }: any) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">{data.totalStudents}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Overall Avg Marks</p>
          <p className="text-2xl font-bold text-indigo-600">{data.overallAvgMarks}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Overall Pass Rate</p>
          <p className="text-2xl font-bold text-green-600">{data.overallPassRate}%</p>
        </div>
      </div>

      {data.subjectPerformance?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Subject-wise Performance</h3>
          <div className="space-y-3">
            {data.subjectPerformance.map((sp: any) => {
              const subject = data.courseName || 'Subject'
              return (
                <div key={sp.subjectId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Subject {sp.subjectId.slice(0, 8)}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">Avg: <strong className="text-gray-900">{sp.avgMarks}</strong></span>
                        <span className="text-sm text-gray-500">Pass: <strong className="text-green-600">{sp.passRate}%</strong></span>
                        <span className="text-xs text-gray-400">({sp.totalResults} results)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(100, sp.avgMarks)}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function AttendanceTab({ data, loading, attDays, setAttDays }: any) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const attendanceList = data.attendanceList || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Avg Attendance</p>
            <p className="text-2xl font-bold text-indigo-600">{data.avgAttendance}%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">At-Risk Students</p>
            <p className="text-2xl font-bold text-red-600">{data.atRiskStudents}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Period</p>
            <p className="text-2xl font-bold text-gray-900">{data.periodDays} days</p>
          </div>
        </div>
        <select
          value={attDays}
          onChange={(e) => setAttDays(Number(e.target.value))}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase">Present</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase">Absent</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase">Late</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendanceList.map((s: any) => (
                <tr key={s.studentId} className={cn('hover:bg-gray-50', s.atRisk && 'bg-red-50')}>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-5 py-4 text-sm text-center text-green-600">{s.presentDays}</td>
                  <td className="px-5 py-4 text-sm text-center text-red-600">{s.absentDays}</td>
                  <td className="px-5 py-4 text-sm text-center text-amber-600">{s.lateDays}</td>
                  <td className="px-5 py-4 text-sm text-center text-gray-600">{s.totalDays}</td>
                  <td className="px-5 py-4 text-sm text-center">
                    <span className={cn(
                      'font-bold',
                      s.attendanceRate >= 75 ? 'text-green-600' : s.attendanceRate >= 50 ? 'text-amber-600' : 'text-red-600'
                    )}>
                      {s.attendanceRate}%
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {s.atRisk ? (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">At Risk</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Good</span>
                    )}
                  </td>
                </tr>
              ))}
              {attendanceList.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">No attendance data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

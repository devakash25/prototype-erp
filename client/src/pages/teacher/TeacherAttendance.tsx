import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import { AlertCircle, RefreshCw, CheckCircle2, Clock, Users, ClipboardCheck } from 'lucide-react'

export function TeacherAttendance() {
  const { data: attendanceData, loading, error, refetch } = useApi('/teacher/attendance/status')
  const [showToast, setShowToast] = useState<{ open: boolean; type: 'success' | 'error'; message: string } | null>(null)

  const handleTakeAttendance = async (classId: string) => {
    try {
      await api.post('/teacher/attendance/mark-daily', { classId })
      setShowToast({ open: true, type: 'success', message: `Attendance marked for class ${classId}` })
      refetch()
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Failed to mark attendance'
      setShowToast({ open: true, type: 'error', message })
      console.error('Failed to take attendance', err)
    }
  }

  const classes = attendanceData?.classes ?? []
  const totalClasses = attendanceData?.totalClasses ?? classes.length
  const marked = attendanceData?.marked ?? classes.filter((c: any) => c.status === 'marked').length
  const pending = totalClasses - marked

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600">Failed to load attendance data</p>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  if (showToast?.open) {
    const IconComponent = showToast.type === 'success' ? CheckCircle2 : AlertCircle
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-xl border shadow-lg {showToast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}">
        <IconComponent className="h-5 w-5" />
        <span>{showToast.message}</span>
        <button
          onClick={() => setShowToast(null)}
          className="ml-4 text-opacity-80 hover:text-white"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Status</h1>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><ClipboardCheck className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : totalClasses}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Marked</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : marked}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg"><Clock className="h-5 w-5 text-orange-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !classes.length ? (
          <div className="text-center py-16 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No classes for today</p>
          </div>
        ) : (
          <div className="divide-y">
            {classes.map((cls: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{cls.subject}</p>
                  <p className="text-sm text-gray-500">{cls.course} • {cls.time}</p>
                </div>
                <div className="text-sm text-gray-500 hidden sm:block">
                  <Users className="inline h-4 w-4 mr-1" />
                  {cls.totalStudents} students
                </div>
                <div className="text-sm text-gray-500 hidden sm:block">
                  {cls.marked}/{cls.totalStudents} marked
                </div>
                <span className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-full',
                  cls.status === 'marked'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                )}>
                  {cls.status === 'marked' ? 'Marked' : 'Pending'}
                </span>
                <button
                  onClick={() => handleTakeAttendance(cls.classId)}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
                >
                  Take Attendance
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherAttendance

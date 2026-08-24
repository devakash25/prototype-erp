import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import {
  RefreshCw,
  FileText,
  CalendarDays,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Award,
} from 'lucide-react'

function getExamTypeBadge(type: string) {
  switch (type?.toUpperCase()) {
    case 'INTERNAL':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'EXTERNAL':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'MIDTERM':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'FINAL':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

export function ParentExams() {
  const [searchParams] = useSearchParams()
  const childId = searchParams.get('childId') || ''

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-exams', childId],
    queryFn: async () => {
      const res = await api.get(`/parent/examinations?childId=${childId}`)
      return res.data
    },
    enabled: !!childId,
  })

  const upcoming = data?.upcoming || []
  const internalMarks = data?.internalMarks || []
  const pastResults = data?.pastResults || []
  const schedule = data?.schedule || []

  if (!childId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-gray-400">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg">Select a child to view examinations</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-400">Failed to load examinations</p>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Examinations</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Exam schedule and results</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Upcoming Exams */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-gray-400" /> Upcoming Exams
          </h2>
        </div>
        <div className="p-5">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No upcoming exams</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((exam: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="p-2 bg-purple-900/30 rounded-lg shrink-0">
                    <FileText className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{exam.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getExamTypeBadge(exam.type)}`}>
                        {exam.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {exam.startDate ? new Date(exam.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                        {' — '}
                        {exam.endDate ? new Date(exam.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                      {exam.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {exam.time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Internal Marks */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Award className="h-5 w-5 text-gray-400" /> Internal Marks
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Subject</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Marks</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Max Marks</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-5 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : internalMarks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">No internal marks available</td>
                </tr>
              ) : (
                internalMarks.map((mark: any, idx: number) => {
                  const pct = mark.maxMarks > 0 ? Math.round((mark.marks / mark.maxMarks) * 100) : 0
                  return (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{mark.subject}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 text-center">{mark.marks ?? '—'}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 text-center">{mark.maxMarks ?? '—'}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-sm font-semibold ${
                          pct >= 80 ? 'text-green-600 dark:text-green-400' : pct >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Past Results */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-gray-400" /> Past Results
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Exam</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Subject</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Marks</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-5 py-4"><div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : pastResults.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">No past results available</td>
                </tr>
              ) : (
                pastResults.map((r: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{r.examName}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{r.subject}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 text-center">{r.marksObtained ?? '—'} / {r.totalMarks ?? '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        r.grade?.startsWith?.('A') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : r.grade?.startsWith?.('B') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {r.grade || '—'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exam Schedule */}
      {schedule.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gray-400" /> Exam Schedule
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Subject</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Time</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {schedule.map((s: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {s.date ? new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{s.subject}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{s.time || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{s.room || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

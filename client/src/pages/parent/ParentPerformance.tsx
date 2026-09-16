import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
import {
  RefreshCw, TrendingUp, BookOpen, BarChart3, Target, Award,
  ChevronDown, AlertCircle, MessageSquare,
} from 'lucide-react'

function getGradeBadge(grade: string) {
  const g = grade?.toUpperCase() || ''
  if (['A+', 'A', 'A1'].includes(g)) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (['B+', 'B', 'B1', 'B2'].includes(g)) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  if (['C', 'C1', 'C2'].includes(g)) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  if (['D', 'E', 'F'].includes(g)) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
}

function getPercentColor(pct: number) {
  if (pct >= 80) return 'text-green-600 dark:text-green-400'
  if (pct >= 60) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

export function ParentPerformance() {
  const [searchParams] = useSearchParams()
  const childId = searchParams.get('childId') || ''
  const [selectedSubject, setSelectedSubject] = useState('')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-performance', childId],
    queryFn: async () => {
      const res = await api.get(`/parent/performance?childId=${childId}`)
      return res.data
    },
    enabled: !!childId,
  })

  const d = data || {}
  const subjectWise = d.subjectWise || []
  const trend = d.trend || []
  const teacherRemarks = d.teacherRemarks || []
  const overallCGPA = d.overallCGPA ?? 0
  const semesterGPA = d.semesterGPA ?? 0

  const subjects = subjectWise.map((s: any) => s.subject)
  const selectedSubjectData = subjectWise.find((s: any) => s.subject === selectedSubject)

  // Build exam data from subjectWise for the bar chart
  const examChartData = subjectWise.map((s: any) => ({
    name: s.subject || s.code,
    percentage: s.percentage ?? (s.marks && s.totalMarks ? Math.round((s.marks / s.totalMarks) * 100) : 0),
    marksObtained: s.marks ?? 0,
    totalMarks: s.totalMarks ?? 0,
  }))

  const averagePercentage = examChartData.length > 0
    ? Math.round(examChartData.reduce((s: number, e: any) => s + e.percentage, 0) / examChartData.length)
    : 0

  const highestPercentage = examChartData.length > 0
    ? Math.max(...examChartData.map((e: any) => e.percentage))
    : 0

  const overallStats = {
    averagePercentage,
    totalExams: examChartData.length,
    highestPercentage,
  }

  const maxGpa = Math.max(...trend.map((s: any) => s.gpa || 0), 1)

  if (!childId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-gray-400">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg">Select a child to view performance</p>
      </div>
    )
  }

  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-400">Failed to load performance data</p>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Performance</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Academic performance and progress overview</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* GPA Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Current GPA</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{semesterGPA || '—'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" /></div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Overall CGPA</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{overallCGPA || '—'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg"><Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /></div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Percentage</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{overallStats.averagePercentage}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><Award className="h-5 w-5 text-green-600 dark:text-green-400" /></div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Highest %</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{overallStats.highestPercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Exam Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Subject-wise Performance</h2>
          </div>
        </div>
        {isLoading ? (
          <div className="h-[350px] bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
        ) : examChartData.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No exam data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={examChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{label}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{d.marksObtained} / {d.totalMarks}</p>
                      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{d.percentage}%</p>
                    </div>
                  )
                }}
              />
              <ReferenceLine y={overallStats.averagePercentage} stroke="#10b981" strokeDasharray="5 5" />
              <Bar dataKey="percentage" name="Marks %" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {examChartData.map((_: any, i: number) => (
                  <Cell key={i} fill={examChartData[i].percentage >= overallStats.averagePercentage ? '#6366f1' : '#c4b5fd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Subject-wise Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Subject-wise Summary</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[200px] bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
        ) : subjectWise.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No subject data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Subject</th>
                  <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Code</th>
                  <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Marks</th>
                  <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Percentage</th>
                  <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {subjectWise.map((row: any, idx: number) => {
                  const pct = row.totalMarks > 0 ? Math.round((row.marks / row.totalMarks) * 100) : 0
                  return (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{row.subject}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-center">{row.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-center">{row.marks}/{row.totalMarks}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full', pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500')} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={cn('text-sm font-semibold', getPercentColor(pct))}>{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.grade && (
                          <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getGradeBadge(row.grade))}>{row.grade}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Semester GPA Trend */}
      {trend.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Semester-wise GPA Trend</h2>
          </div>
          <div className="space-y-3">
            {trend.map((sem: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-24 shrink-0">{sem.semester}</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', sem.gpa >= 8 ? 'bg-green-500' : sem.gpa >= 6 ? 'bg-yellow-500' : 'bg-red-500')}
                    style={{ width: `${((sem.gpa || 0) / maxGpa) * 100}%` }}
                  />
                </div>
                <span className={cn('text-sm font-semibold w-12 text-right', getPercentColor(((sem.gpa || 0) / 10) * 100))}>
                  {sem.gpa ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teacher Remarks */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Teacher Remarks</h2>
        </div>
        {teacherRemarks.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No remarks available</p>
        ) : (
          <div className="space-y-3">
            {teacherRemarks.map((r: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.subject} — {r.examName}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {r.date ? new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{r.remark}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

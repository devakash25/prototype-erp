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

const DUMMY_EXAMS = [
  { name: 'Unit Test 1', percentage: 72, marksObtained: 36, totalMarks: 50 },
  { name: 'Mid Semester', percentage: 85, marksObtained: 42, totalMarks: 50 },
  { name: 'Unit Test 2', percentage: 68, marksObtained: 34, totalMarks: 50 },
  { name: 'Pre-Finals', percentage: 91, marksObtained: 45, totalMarks: 50 },
  { name: 'Finals', percentage: 78, marksObtained: 78, totalMarks: 100 },
]

const DUMMY_SUBJECTS: Record<string, { name: string; percentage: number; marksObtained: number; totalMarks: number; grade: string }[]> = {
  Mathematics: [
    { name: 'Unit Test 1', percentage: 80, marksObtained: 40, totalMarks: 50, grade: 'A' },
    { name: 'Mid Semester', percentage: 92, marksObtained: 46, totalMarks: 50, grade: 'A+' },
    { name: 'Unit Test 2', percentage: 74, marksObtained: 37, totalMarks: 50, grade: 'B+' },
    { name: 'Pre-Finals', percentage: 88, marksObtained: 44, totalMarks: 50, grade: 'A' },
    { name: 'Finals', percentage: 85, marksObtained: 85, totalMarks: 100, grade: 'A' },
  ],
  Physics: [
    { name: 'Unit Test 1', percentage: 65, marksObtained: 32, totalMarks: 50, grade: 'B' },
    { name: 'Mid Semester', percentage: 78, marksObtained: 39, totalMarks: 50, grade: 'B+' },
    { name: 'Unit Test 2', percentage: 70, marksObtained: 35, totalMarks: 50, grade: 'B+' },
    { name: 'Pre-Finals', percentage: 82, marksObtained: 41, totalMarks: 50, grade: 'A' },
    { name: 'Finals', percentage: 76, marksObtained: 76, totalMarks: 100, grade: 'B+' },
  ],
  Chemistry: [
    { name: 'Unit Test 1', percentage: 88, marksObtained: 44, totalMarks: 50, grade: 'A' },
    { name: 'Mid Semester', percentage: 72, marksObtained: 36, totalMarks: 50, grade: 'B+' },
    { name: 'Unit Test 2', percentage: 90, marksObtained: 45, totalMarks: 50, grade: 'A+' },
    { name: 'Pre-Finals', percentage: 85, marksObtained: 42, totalMarks: 50, grade: 'A' },
    { name: 'Finals', percentage: 80, marksObtained: 80, totalMarks: 100, grade: 'A' },
  ],
  English: [
    { name: 'Unit Test 1', percentage: 76, marksObtained: 38, totalMarks: 50, grade: 'B+' },
    { name: 'Mid Semester', percentage: 82, marksObtained: 41, totalMarks: 50, grade: 'A' },
    { name: 'Unit Test 2', percentage: 78, marksObtained: 39, totalMarks: 50, grade: 'B+' },
    { name: 'Pre-Finals', percentage: 88, marksObtained: 44, totalMarks: 50, grade: 'A' },
    { name: 'Finals', percentage: 84, marksObtained: 84, totalMarks: 100, grade: 'A' },
  ],
  'Computer Science': [
    { name: 'Unit Test 1', percentage: 92, marksObtained: 46, totalMarks: 50, grade: 'A+' },
    { name: 'Mid Semester', percentage: 96, marksObtained: 48, totalMarks: 50, grade: 'A+' },
    { name: 'Unit Test 2', percentage: 88, marksObtained: 44, totalMarks: 50, grade: 'A' },
    { name: 'Pre-Finals', percentage: 94, marksObtained: 47, totalMarks: 50, grade: 'A+' },
    { name: 'Finals', percentage: 90, marksObtained: 90, totalMarks: 100, grade: 'A+' },
  ],
}

const DUMMY_SEMESTERS = [
  { name: 'Sem 1', gpa: 8.2 },
  { name: 'Sem 2', gpa: 8.5 },
  { name: 'Sem 3', gpa: 8.8 },
  { name: 'Sem 4', gpa: 9.1 },
]

const DUMMY_REMARKS = [
  { teacher: 'Mr. Sharma (Mathematics)', message: 'Excellent progress in algebra. Keep up the good work!', date: '2026-01-15' },
  { teacher: 'Ms. Patel (Physics)', message: 'Needs to focus more on practical concepts. Good theory knowledge.', date: '2026-01-10' },
  { teacher: 'Mr. Kumar (Computer Science)', message: 'Outstanding performance in coding assignments. Top of the class.', date: '2026-01-12' },
]

const SUBJECT_NAMES = Object.keys(DUMMY_SUBJECTS)

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
  const [selectedSubject, setSelectedSubject] = useState(SUBJECT_NAMES[0])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-performance', childId],
    queryFn: async () => {
      const res = await api.get(`/parent/performance?childId=${childId}`)
      return res.data
    },
    enabled: !!childId,
  })

  const d = data || {}
  const apiExams = d.exams || d.results || []
  const apiSubjectWise = d.subjectWise || d.subjects || []

  const exams = apiExams.length > 0 ? apiExams : DUMMY_EXAMS
  const semesters = d.semesters?.length > 0 ? d.semesters : DUMMY_SEMESTERS
  const remarks = d.remarks?.length > 0 ? d.remarks : DUMMY_REMARKS
  const gpa = d.gpa || { currentSemester: 8.8, overall: 8.65 }

  const overallStats = d.overallStats || {
    averagePercentage: Math.round(exams.reduce((s: number, e: any) => s + (e.percentage || 0), 0) / exams.length),
    averagePercentile: Math.round(exams.reduce((s: number, e: any) => s + (e.percentile || 0), 0) / exams.length),
    totalExams: exams.length,
    highestPercentage: Math.max(...exams.map((e: any) => e.percentage || 0)),
  }

  const subjects = SUBJECT_NAMES
  const filteredSubjectData = DUMMY_SUBJECTS[selectedSubject] || []

  const overallChartData = exams.map((exam: any) => ({
    name: exam.name || exam.examName || 'Exam',
    percentage: exam.percentage ?? (exam.marksObtained && exam.totalMarks ? Math.round((exam.marksObtained / exam.totalMarks) * 100) : 0),
    marksObtained: exam.marksObtained ?? 0,
    totalMarks: exam.totalMarks ?? 0,
  }))

  const maxGpa = Math.max(...semesters.map((s: any) => s.gpa || 0), 1)

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
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{gpa.currentSemester}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" /></div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Overall CGPA</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{gpa.overall}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg"><Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /></div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Percentile</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{overallStats.averagePercentile}</p>
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Overall Exam Progress</h2>
          </div>
        </div>
        {isLoading ? (
          <div className="h-[350px] bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={overallChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                {overallChartData.map((_: any, i: number) => (
                  <Cell key={i} fill={overallChartData[i].percentage >= overallStats.averagePercentage ? '#6366f1' : '#c4b5fd'} />
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Subject-wise Progress</h2>
          </div>
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Subject Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              {sub}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredSubjectData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              formatter={(value: number) => [`${value}%`, 'Marks']}
            />
            <ReferenceLine y={75} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'Target 75%', position: 'right', fontSize: 10, fill: '#10b981' }} />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, fill: '#4f46e5' }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Exam</th>
                <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Marks</th>
                <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Percentage</th>
                <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredSubjectData.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{row.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-center">{row.marksObtained}/{row.totalMarks}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', row.percentage >= 80 ? 'bg-green-500' : row.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500')} style={{ width: `${row.percentage}%` }} />
                      </div>
                      <span className={cn('text-sm font-semibold', getPercentColor(row.percentage))}>{row.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.grade && (
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getGradeBadge(row.grade))}>{row.grade}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Semester GPA Trend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Semester-wise GPA Trend</h2>
        </div>
        <div className="space-y-3">
          {semesters.map((sem: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-24 shrink-0">{sem.name || sem.semester}</span>
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

      {/* Teacher Remarks */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Teacher Remarks</h2>
        </div>
        <div className="space-y-3">
          {remarks.map((r: any, idx: number) => (
            <div key={idx} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.teacher || r.subject}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {r.date ? new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{r.message || r.remark}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

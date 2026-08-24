import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Award, ChevronRight, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn, formatNumber, exportToCSV } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { ChartSkeleton, StatsSkeleton } from '@/components/LoadingSkeleton'

export function ExaminationAnalytics() {
  const [view, setView] = useState<'overview' | 'subjects' | 'departments' | 'performers'>('overview')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const statsUrl = `/analytics/examinations/stats${fromDate ? `?from=${fromDate}&to=${toDate}` : ''}`
  const { data: stats, loading: sLoading } = useApi(statsUrl, [fromDate, toDate])
  const { data: subjects, loading: subLoading } = useApi('/analytics/examinations/subjects')
  const { data: semesters } = useApi('/analytics/examinations/semesters')
  const { data: grades } = useApi('/analytics/examinations/grades')
  const { data: departments } = useApi('/analytics/examinations/departments')
  const { data: performers } = useApi('/analytics/examinations/top-performers')

  const examStats = stats || { totalExams: 0, totalResults: 0, passPercentage: 0, averageMarks: 0, topPerformers: 0, failedStudents: 0 }

  const handleExport = () => {
    if (subjects && subjects.length) {
      exportToCSV(subjects, 'examination_subject_performance')
    }
  }

  if (sLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Examination Analytics</h1></div>
        <StatsSkeleton count={6} />
        <ChartSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examination Analytics</h1>
          <p className="text-sm text-gray-500">Exam performance, results, and rankings</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Download className="w-4 h-4" />Export CSV
          </button>
          {(['overview', 'subjects', 'departments', 'performers'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', view === v ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <DateRangeFilter fromDate={fromDate} toDate={toDate} onFromDateChange={setFromDate} onToDateChange={setToDate} onClear={() => { setFromDate(''); setToDate('') }} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-xs text-gray-500">Total Exams</p><p className="text-2xl font-bold text-gray-900">{examStats.totalExams}</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-xs text-gray-500">Total Results</p><p className="text-2xl font-bold text-gray-900">{formatNumber(examStats.totalResults)}</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-xs text-gray-500">Pass Rate</p><p className="text-2xl font-bold text-green-600">{examStats.passPercentage}%</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-xs text-gray-500">Avg Marks</p><p className="text-2xl font-bold text-blue-600">{examStats.averageMarks}</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-xs text-gray-500">Top Performers</p><p className="text-2xl font-bold text-purple-600">{examStats.topPerformers}</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-xs text-gray-500">Failed Students</p><p className="text-2xl font-bold text-red-600">{examStats.failedStudents}</p></div>
      </div>

      {view === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Semester Performance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={semesters || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="semester" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={2} name="Avg Marks" />
                <Line type="monotone" dataKey="pass" stroke="#10b981" strokeWidth={2} name="Pass %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Grade Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={grades || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(grades || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {view === 'subjects' && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Subject Performance</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Subject</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Avg Marks</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Pass %</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Students</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subLoading ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">Loading...</td></tr>
                ) : (subjects || []).map((subj: any) => (
                  <tr key={subj.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{subj.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{subj.avg}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{subj.pass}%</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatNumber(subj.total)}</td>
                    <td className="px-5 py-4"><div className="w-32 h-2 bg-gray-100 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${subj.pass}%` }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'departments' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Department Rankings</h3>
          <div className="space-y-3">
            {(departments || []).map((dept: any) => (
              <div key={dept.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm', dept.rank <= 3 ? 'bg-yellow-500' : 'bg-gray-300')}>{dept.rank}</div>
                <div className="flex-1"><p className="text-sm font-medium text-gray-900">{dept.name}</p><p className="text-xs text-gray-500">Avg: {dept.avg} | Pass: {dept.pass}%</p></div>
                {dept.trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'performers' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {(performers || []).map((student: any) => (
              <Link key={student.rank} to={`/students/${student.id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-bold', student.rank <= 3 ? 'bg-yellow-500' : 'bg-indigo-500')}>{student.rank}</div>
                <div className="flex-1"><p className="text-sm font-medium text-gray-900">{student.name}</p><p className="text-xs text-gray-500">{student.dept}</p></div>
                <div className="text-right"><p className="text-lg font-bold text-indigo-600">{student.cgpa}</p><p className="text-xs text-gray-500">CGPA</p></div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw, AlertCircle, TrendingUp, BarChart3, Target, Award,
  CheckCircle2, XCircle, BookOpen, Calendar,
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function StudentPerformance() {
  const { data: performance, loading, error, refetch } = useApi<any>('/student/performance')

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-400">{error}</p>
        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    )
  }

  const exams = performance?.exams ?? []
  const subjectWise = performance?.subjectWise ?? []
  const overallStats = performance?.overallStats ?? {}
  const attendanceTrend = performance?.attendanceTrend ?? []
  const assignmentCompletion = performance?.assignmentCompletion ?? {}
  const hasExams = exams.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Academic Performance</h1>
          <p className="text-slate-400 text-sm">Track your exam results and progress</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Exams Taken', value: overallStats.totalExams ?? 0, icon: Award, color: 'text-indigo-400 bg-indigo-500/10' },
          { label: 'Average %', value: `${overallStats.averagePercentage ?? 0}%`, icon: TrendingUp, color: 'text-green-400 bg-green-500/10' },
          { label: 'Highest %', value: `${overallStats.highestPercentage ?? 0}%`, icon: Target, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Assignment Rate', value: `${assignmentCompletion.rate ?? 0}%`, icon: CheckCircle2, color: 'text-purple-400 bg-purple-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                {loading ? (
                  <div className="h-7 w-16 bg-slate-700 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!hasExams && !loading && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 text-slate-600" />
          <p className="text-lg text-slate-400">No exam results yet</p>
          <p className="text-sm text-slate-500 mt-1">Your performance data will appear here after exams</p>
        </div>
      )}

      {/* Charts Row */}
      {hasExams && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exam Results Pie Chart */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Exam Score Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={exams.map((e: any) => ({ name: e.name, value: e.percentage }))} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {exams.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {exams.map((e: any, i: number) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-slate-400">{e.name} ({e.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subject-wise Bar Chart */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Subject-wise Scores</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectWise.map((s: any) => ({ subject: s.code || s.subject, percentage: s.percentage }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="percentage" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Exam Breakdown Table */}
      {hasExams && exams.map((exam: any) => (
        <div key={exam.id} className="bg-slate-800 rounded-xl border border-slate-700">
          <div className="p-5 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{exam.name}</h2>
              <p className="text-sm text-slate-400">{exam.subjects.length} subjects · Total: {exam.totalMarks}/{exam.totalMax}</p>
            </div>
            <span className={cn('px-3 py-1 text-sm font-medium rounded-full',
              exam.percentage >= 75 ? 'bg-green-500/10 text-green-400' : exam.percentage >= 50 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
            )}>{exam.percentage}%</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Subject</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Marks</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Grade</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {exam.subjects.map((sub: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">{sub.subject}</p>
                      <p className="text-xs text-slate-500">{sub.code}</p>
                    </td>
                    <td className="px-5 py-4 text-center text-sm text-white">{sub.marks}/{sub.totalMarks}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400">{sub.grade || '—'}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {sub.isPassed
                        ? <CheckCircle2 className="h-5 w-5 text-green-400 mx-auto" />
                        : <XCircle className="h-5 w-5 text-red-400 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Attendance Trend */}
      {attendanceTrend.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

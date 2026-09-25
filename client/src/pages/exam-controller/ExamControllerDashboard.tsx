import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import { GreetingBanner } from '@/components/GreetingBanner'
import {
  FileText,
  CalendarClock,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  Plus,
  Upload,
  Trophy,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444']

export function ExamControllerDashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['exam-controller-dashboard'],
    queryFn: async () => {
      const res = await api.get('/exam-controller/dashboard')
      return res.data?.data ?? res.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-300">Failed to load dashboard data</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const d = data?.data || data || {}

  const kpiCards = [
    {
      label: 'Total Exams',
      value: d.totalExams ?? 0,
      icon: FileText,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
    },
    {
      label: 'Upcoming Exams',
      value: d.upcomingExams ?? 0,
      icon: CalendarClock,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
    },
    {
      label: 'Pending Results',
      value: d.pendingResults ?? 0,
      icon: ClipboardList,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
    },
    {
      label: 'Published Results',
      value: d.publishedResults ?? 0,
      icon: CheckCircle2,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
    },
    {
      label: 'Average Score',
      value: `${d.averageScore ?? 0}%`,
      icon: TrendingUp,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
    },
  ]

  const quickActions = [
    { label: 'Create Exam', href: '/exam-controller/exams', icon: Plus, color: 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' },
    { label: 'Publish Results', href: '/exam-controller/results', icon: Upload, color: 'bg-green-900/30 text-green-400 hover:bg-green-900/50' },
    { label: 'View Merit List', href: '/exam-controller/merit-list', icon: Trophy, color: 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50' },
  ]

  const recentExams = d.recentExams || []

  return (
    <div className="space-y-6">
      <GreetingBanner />

      <div className="flex items-center justify-end">
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={cn('rounded-xl border p-5 shadow-sm', card.bg, card.border)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm font-medium', card.color)}>{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className={cn('p-3 rounded-xl', card.bg)}>
                <card.icon className={cn('h-5 w-5', card.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl transition-colors',
                action.color
              )}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Status Pie Chart */}
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Exam Status Distribution</h2>
          {recentExams.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Published', value: d.publishedResults ?? 0 },
                    { name: 'Pending', value: d.pendingResults ?? 0 },
                    { name: 'Upcoming', value: d.upcomingExams ?? 0 },
                    { name: 'Completed', value: Math.max((d.totalExams ?? 0) - (d.upcomingExams ?? 0) - (d.publishedResults ?? 0), 0) },
                  ].filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  dataKey="value"
                >
                  {[0,1,2,3,4].map((i) => (
                    <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">No exam data</div>
          )}
        </div>

        {/* Average Score Bar Chart */}
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Score Overview</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={[
              { name: 'Avg Score', value: d.averageScore ?? 0 },
              { name: 'Pass Rate', value: d.passRate ?? 85 },
              { name: 'Completion', value: d.totalExams > 0 ? Math.round(((d.publishedResults ?? 0) / d.totalExams) * 100) : 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                <Cell fill="#6366f1" />
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Exams */}
      <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Exams</h2>
          <Link
            to="/exam-controller/exams"
            className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentExams.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No recent exams</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate-400 uppercase">Name</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate-400 uppercase">Type</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate-400 uppercase">Start Date</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate-400 uppercase">End Date</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {recentExams.slice(0, 5).map((exam: any) => (
                  <tr key={exam.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-white">{exam.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-900/30 text-indigo-400">
                        {exam.type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {exam.startDate ? new Date(exam.startDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {exam.endDate ? new Date(exam.endDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          exam.status === 'PUBLISHED'
                            ? 'bg-green-900/30 text-green-400'
                            : exam.status === 'ONGOING'
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : exam.status === 'COMPLETED'
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-slate-700 text-slate-400'
                        )}
                      >
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExamControllerDashboard

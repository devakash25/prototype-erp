import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface RevenueChartProps {
  data: { month: string; amount: number }[]
}

export function RevenueChart({ data = [] }: RevenueChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
        <span className="text-xs text-gray-500">Last 12 months</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 100000).toFixed(1)}L`} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} name="Revenue" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

interface AttendanceChartProps {
  data: { date: string; percentage: number }[]
}

export function AttendanceChart({ data = [] }: AttendanceChartProps) {
  const displayData = data.slice(-7).map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Student Attendance Trend</h3>
        <span className="text-xs text-gray-500">Last 7 days</span>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={displayData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Bar dataKey="percentage" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface DepartmentDistributionProps {
  data: { name: string; students: number }[]
}

const deptColors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

export function DepartmentDistribution({ data = [] }: DepartmentDistributionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Department Distribution</h3>
        <span className="text-xs text-gray-500">By students</span>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="students" nameKey="name">
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={deptColors[index % deptColors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value} students`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

interface AdmissionFunnelProps {
  data: { applied: number; underReview: number; approved: number; rejected: number; enrolled: number }
}

export function AdmissionFunnel({ data }: AdmissionFunnelProps) {
  const stages = [
    { stage: 'Applied', count: data?.applied || 0, color: '#6366f1' },
    { stage: 'Under Review', count: data?.underReview || 0, color: '#f59e0b' },
    { stage: 'Approved', count: data?.approved || 0, color: '#10b981' },
    { stage: 'Enrolled', count: data?.enrolled || 0, color: '#3b82f6' },
    { stage: 'Rejected', count: data?.rejected || 0, color: '#ef4444' },
  ]
  const maxCount = Math.max(...stages.map(s => s.count), 1)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Admission Pipeline</h3>
        <span className="text-xs text-gray-500">Current session</span>
      </div>
      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.stage}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">{stage.stage}</span>
              <span className="text-sm font-medium text-gray-900">{stage.count}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(stage.count / maxCount) * 100}%`, backgroundColor: stage.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface RevenueByTypeChartProps {
  data: Record<string, number>
}

export function RevenueByTypeChart({ data = {} }: RevenueByTypeChartProps) {
  const chartData = Object.entries(data).map(([type, amount]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' '),
    amount,
  })).sort((a, b) => b.amount - a.amount)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Revenue by Fee Type</h3>
        <span className="text-xs text-gray-500">This year</span>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 100000).toFixed(1)}L`} />
          <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }} width={120} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Bar dataKey="amount" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function InstitutionHealthScore({ score }: { score: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600'
    if (s >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Institution Health Score</h3>
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg className="w-40 h-40" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="url(#gradient)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(score / 100) * 314} 314`} transform="rotate(-90 60 60)" />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
            <span className="text-xs text-gray-500">out of 100</span>
          </div>
        </div>
      </div>
    </div>
  )
}

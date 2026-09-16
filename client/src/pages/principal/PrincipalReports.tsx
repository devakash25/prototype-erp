import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Clock,
  Wallet,
  FileText,
  LifeBuoy,
  Bus,
  Home,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: number | string; sub?: string; icon: any; color: string }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="text-lg font-bold text-white">{value}</p>
          {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

function ProgressBar({ label, current, total, color }: { label: string; current: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-500">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-300 font-medium">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs text-slate-400">
          {entry.name}: <span className="text-white font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

export function PrincipalReports() {
  const { data, loading, error, refetch } = useApi('/principal/reports')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports</h1>
            <p className="text-slate-400 text-sm">Institution-wide overview</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">Failed to load reports</p>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            <RefreshCw className="w-4 h-4" />Retry
          </button>
        </div>
      </div>
    )
  }

  const students = data?.students || { total: 0, active: 0, inactive: 0 }
  const faculty = data?.faculty || { total: 0, active: 0 }
  const departments = data?.departments || { total: 0 }
  const courses = data?.courses || { total: 0 }
  const attendance = data?.attendance || { todayRate: 0 }
  const fees = data?.fees || { collected: 0, pending: 0 }
  const exams = data?.exams || { total: 0, active: 0 }
  const helpdesk = data?.helpdesk || { open: 0, resolved: 0 }
  const transport = data?.transport || { vehicles: 0, routes: 0 }
  const hostel = data?.hostel || { total: 0, occupied: 0 }

  const feeTotal = fees.collected + fees.pending

  const chartData = [
    { name: 'Students', total: students.total, active: students.active },
    { name: 'Faculty', total: faculty.total, active: faculty.active },
    { name: 'Exams', total: exams.total, active: exams.active },
    { name: 'Transport', total: transport.vehicles, active: transport.routes },
    { name: 'Hostel', total: hostel.total, active: hostel.occupied },
  ]

  const reportSections = [
    {
      title: 'Students',
      icon: GraduationCap,
      color: 'bg-blue-900/50 text-blue-400',
      stats: [
        { label: 'Total', value: students.total },
        { label: 'Active', value: students.active },
        { label: 'Inactive', value: students.inactive },
      ],
      progress: students.total > 0 ? [{ label: 'Active Rate', current: students.active, total: students.total, color: 'bg-blue-500' }] : [],
    },
    {
      title: 'Faculty',
      icon: Users,
      color: 'bg-indigo-900/50 text-indigo-400',
      stats: [
        { label: 'Total', value: faculty.total },
        { label: 'Active', value: faculty.active },
      ],
      progress: faculty.total > 0 ? [{ label: 'Active Rate', current: faculty.active, total: faculty.total, color: 'bg-indigo-500' }] : [],
    },
    {
      title: 'Departments',
      icon: Building2,
      color: 'bg-emerald-900/50 text-emerald-400',
      stats: [{ label: 'Total', value: departments.total }],
      progress: [],
    },
    {
      title: 'Courses',
      icon: BookOpen,
      color: 'bg-teal-900/50 text-teal-400',
      stats: [{ label: 'Total', value: courses.total }],
      progress: [],
    },
    {
      title: 'Attendance',
      icon: Clock,
      color: 'bg-amber-900/50 text-amber-400',
      stats: [{ label: 'Today Rate', value: `${attendance.todayRate}%` }],
      progress: [{ label: 'Today', current: attendance.todayRate, total: 100, color: 'bg-amber-500' }],
    },
    {
      title: 'Fees',
      icon: Wallet,
      color: 'bg-green-900/50 text-green-400',
      stats: [
        { label: 'Collected', value: fees.collected.toLocaleString() },
        { label: 'Pending', value: fees.pending.toLocaleString() },
      ],
      progress: feeTotal > 0 ? [{ label: 'Collection Rate', current: fees.collected, total: feeTotal, color: 'bg-green-500' }] : [],
    },
    {
      title: 'Exams',
      icon: FileText,
      color: 'bg-purple-900/50 text-purple-400',
      stats: [
        { label: 'Total', value: exams.total },
        { label: 'Active', value: exams.active },
      ],
      progress: [],
    },
    {
      title: 'Helpdesk',
      icon: LifeBuoy,
      color: 'bg-orange-900/50 text-orange-400',
      stats: [
        { label: 'Open', value: helpdesk.open },
        { label: 'Resolved', value: helpdesk.resolved },
      ],
      progress: (helpdesk.open + helpdesk.resolved) > 0
        ? [{ label: 'Resolution Rate', current: helpdesk.resolved, total: helpdesk.open + helpdesk.resolved, color: 'bg-green-500' }]
        : [],
    },
    {
      title: 'Transport',
      icon: Bus,
      color: 'bg-cyan-900/50 text-cyan-400',
      stats: [
        { label: 'Vehicles', value: transport.vehicles },
        { label: 'Routes', value: transport.routes },
      ],
      progress: [],
    },
    {
      title: 'Hostel',
      icon: Home,
      color: 'bg-rose-900/50 text-rose-400',
      stats: [
        { label: 'Total', value: hostel.total },
        { label: 'Occupied', value: hostel.occupied },
      ],
      progress: hostel.total > 0
        ? [{ label: 'Occupancy Rate', current: hostel.occupied, total: hostel.total, color: 'bg-rose-500' }]
        : [],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 text-sm">Institution-wide overview</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Key Metrics Overview</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#475569' }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#475569' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" name="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="active" name="Active" fill="#22d3ee" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportSections.map((section) => (
          <div key={section.title} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', section.color)}>
                <section.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">{section.title}</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {section.stats.map((stat) => (
                <div key={stat.label} className="bg-slate-700/50 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-slate-400">{stat.label}</p>
                  <p className="text-base font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {section.progress.length > 0 && (
              <div className="space-y-2">
                {section.progress.map((p) => (
                  <ProgressBar key={p.label} {...p} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

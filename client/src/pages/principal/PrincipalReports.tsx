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
} from 'lucide-react'

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: number | string; sub?: string; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
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
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-500">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function PrincipalReports() {
  const { data, loading } = useApi('/principal/reports')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
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

  const reportSections = [
    {
      title: 'Students',
      icon: GraduationCap,
      color: 'bg-blue-100 text-blue-700',
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
      color: 'bg-indigo-100 text-indigo-700',
      stats: [
        { label: 'Total', value: faculty.total },
        { label: 'Active', value: faculty.active },
      ],
      progress: faculty.total > 0 ? [{ label: 'Active Rate', current: faculty.active, total: faculty.total, color: 'bg-indigo-500' }] : [],
    },
    {
      title: 'Departments',
      icon: Building2,
      color: 'bg-emerald-100 text-emerald-700',
      stats: [{ label: 'Total', value: departments.total }],
      progress: [],
    },
    {
      title: 'Courses',
      icon: BookOpen,
      color: 'bg-teal-100 text-teal-700',
      stats: [{ label: 'Total', value: courses.total }],
      progress: [],
    },
    {
      title: 'Attendance',
      icon: Clock,
      color: 'bg-amber-100 text-amber-700',
      stats: [{ label: 'Today Rate', value: `${attendance.todayRate}%` }],
      progress: [{ label: 'Today', current: attendance.todayRate, total: 100, color: 'bg-amber-500' }],
    },
    {
      title: 'Fees',
      icon: Wallet,
      color: 'bg-green-100 text-green-700',
      stats: [
        { label: 'Collected', value: fees.collected.toLocaleString() },
        { label: 'Pending', value: fees.pending.toLocaleString() },
      ],
      progress: feeTotal > 0 ? [{ label: 'Collection Rate', current: fees.collected, total: feeTotal, color: 'bg-green-500' }] : [],
    },
    {
      title: 'Exams',
      icon: FileText,
      color: 'bg-purple-100 text-purple-700',
      stats: [
        { label: 'Total', value: exams.total },
        { label: 'Active', value: exams.active },
      ],
      progress: [],
    },
    {
      title: 'Helpdesk',
      icon: LifeBuoy,
      color: 'bg-orange-100 text-orange-700',
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
      color: 'bg-cyan-100 text-cyan-700',
      stats: [
        { label: 'Vehicles', value: transport.vehicles },
        { label: 'Routes', value: transport.routes },
      ],
      progress: [],
    },
    {
      title: 'Hostel',
      icon: Home,
      color: 'bg-rose-100 text-rose-700',
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
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm">Institution-wide overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportSections.map((section) => (
          <div key={section.title} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', section.color)}>
                <section.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {section.stats.map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-gray-500">{stat.label}</p>
                  <p className="text-base font-bold text-gray-900">{stat.value}</p>
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

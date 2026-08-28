import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, GraduationCap, DollarSign, TrendingUp, Clock, CheckCircle,
  AlertTriangle, RefreshCw, GripVertical, Settings, RotateCcw,
  BarChart3,
} from 'lucide-react'
import { cn, formatCurrency, formatNumber } from '@/lib/utils'
import { StatCard } from '@/components/StatCard'
import { GreetingBanner } from '@/components/GreetingBanner'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { RevenueChart, AttendanceChart, DepartmentDistribution, AdmissionFunnel, RevenueByTypeChart, InstitutionHealthScore } from './DashboardCharts'
import { RecentActivity, PendingActionCenter, SmartAlerts } from './DashboardActivity'
import { dashboardApi } from '@/services/apiService'

const LAYOUT_KEY = 'superadmin_dashboard_layout'

function loadLayout(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveLayout(layout: Record<string, string[]>) {
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout))
}

interface WidgetItem {
  id: string
  label: string
  component: React.ReactNode
}

export function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'academic' | 'hr' | 'campus'>('overview')
  const [summary, setSummary] = useState<any>(null)
  const [revenue, setRevenue] = useState<any>(null)
  const [attendance, setAttendance] = useState<any>(null)
  const [admissions, setAdmissions] = useState<any>(null)
  const [academic, setAcademic] = useState<any>(null)
  const [hr, setHr] = useState<any>(null)
  const [hostel, setHostel] = useState<any>(null)
  const [transport, setTransport] = useState<any>(null)
  const [library, setLibrary] = useState<any>(null)
  const [helpdesk, setHelpdesk] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)
  const [healthScore, setHealthScore] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [customizeMode, setCustomizeMode] = useState(false)
  const [layout, setLayout] = useState<Record<string, string[]>>(loadLayout)
  const [draggedId, setDraggedId] = useState<string | null>(null)

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        dashboardApi.getSummary(),
        dashboardApi.getRevenue(),
        dashboardApi.getAttendance(),
        dashboardApi.getAdmissions(),
        dashboardApi.getAcademic(),
        dashboardApi.getHR(),
        dashboardApi.getHostel(),
        dashboardApi.getTransport(),
        dashboardApi.getLibrary(),
        dashboardApi.getHelpdesk(),
        dashboardApi.getWorkflow(),
        dashboardApi.getHealthScore(),
        dashboardApi.getActivity(20),
      ])
      const get = (i: number) => results[i].status === 'fulfilled' ? (results[i] as PromiseFulfilledResult<any>).value.data.data : null
      setSummary(get(0))
      setRevenue(get(1))
      setAttendance(get(2))
      setAdmissions(get(3))
      setAcademic(get(4))
      setHr(get(5))
      setHostel(get(6))
      setTransport(get(7))
      setLibrary(get(8))
      setHelpdesk(get(9))
      setWorkflow(get(10))
      setHealthScore(get(11))
      setActivity(get(12) || [])
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    }
    setLoading(false)
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'finance' as const, label: 'Finance' },
    { id: 'academic' as const, label: 'Academic' },
    { id: 'hr' as const, label: 'HR' },
    { id: 'campus' as const, label: 'Campus' },
  ]

  const pendingActions = [
    summary?.pendingAdmissions > 0 && { title: `${summary.pendingAdmissions} Admission Approvals`, type: 'admissions', color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/admissions' },
    summary?.pendingApprovals > 0 && { title: `${summary.pendingApprovals} Workflow Approvals`, type: 'workflow', color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/workflow' },
    summary?.openTickets > 0 && { title: `${summary.openTickets} Open Tickets`, type: 'helpdesk', color: 'text-orange-400', bg: 'bg-orange-500/10', href: '/helpdesk' },
    hr?.leaveStats?.pending > 0 && { title: `${hr.leaveStats.pending} Leave Requests`, type: 'leave', color: 'text-green-400', bg: 'bg-green-500/10', href: '/leave' },
  ].filter(Boolean) as any[]

  const smartAlerts = [
    attendance?.student?.percentage < 75 && { type: 'warning' as const, message: `Student attendance at ${attendance?.student?.percentage || 0}% - below 75% threshold` },
    revenue?.outstanding > 0 && { type: 'error' as const, message: `${formatCurrency(revenue.outstanding)} in outstanding fees` },
    hostel?.occupancy?.rate > 90 && { type: 'warning' as const, message: `Hostel occupancy at ${hostel?.occupancy?.rate || 0}% - limited seats` },
    helpdesk?.open > 0 && { type: 'info' as const, message: `${helpdesk.open} helpdesk tickets awaiting response` },
    healthScore?.score >= 80 && { type: 'success' as const, message: `Institution health score: ${healthScore.score}/100 - Excellent` },
  ].filter(Boolean) as any[]

  const getOverviewWidgets = useCallback((): WidgetItem[] => [
    { id: 'stats', label: 'Statistics', component: (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Students" value={formatNumber(summary?.totalStudents || 0)} icon={Users} color="bg-blue-500" href="/students" />
        <StatCard title="Total Employees" value={formatNumber(summary?.totalEmployees || 0)} icon={Users} color="bg-green-500" href="/employees" />
        <StatCard title="Today's Attendance" value={`${summary?.todayAttendance || 0}%`} icon={CheckCircle} color="bg-purple-500" href="/attendance" />
        <StatCard title="Today's Revenue" value={formatCurrency(revenue?.today?.amount || 0)} icon={DollarSign} color="bg-amber-500" href="/collections" />
        <StatCard title="Pending Approvals" value={summary?.pendingApprovals || 0} icon={Clock} color="bg-orange-500" href="/workflow" />
        <StatCard title="Helpdesk Tickets" value={`${summary?.openTickets || 0} Open`} icon={AlertTriangle} color="bg-red-500" href="/helpdesk" />
      </div>
    )},
    { id: 'quick-actions', label: 'Quick Actions', component: (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Add Student', href: '/students/new', color: 'bg-blue-500' },
            { label: 'Create Employee', href: '/employees/new', color: 'bg-green-500' },
            { label: 'Configure Fees', href: '/fee-structure', color: 'bg-purple-500' },
            { label: 'Post Notice', href: '/announcements', color: 'bg-orange-500' },
            { label: 'Approve Requests', href: '/workflow', color: 'bg-indigo-500' },
            { label: 'Generate Report', href: '/reports', color: 'bg-pink-500' },
          ].map((action) => (
            <Link key={action.label} to={action.href} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-slate-700/50 transition-colors">
              <div className={cn('p-3 rounded-xl text-white', action.color)}><CheckCircle className="w-5 h-5" /></div>
              <span className="text-sm text-slate-300 text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    )},
    { id: 'revenue-funnel', label: 'Revenue & Admissions', component: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenue?.monthlyTrend || []} />
        <AdmissionFunnel data={admissions?.pipeline || {}} />
      </div>
    )},
    { id: 'attendance-dept-health', label: 'Attendance, Departments & Health', component: (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AttendanceChart data={attendance?.monthlyTrend || []} />
        <DepartmentDistribution data={summary?.departmentStats || []} />
        <InstitutionHealthScore score={healthScore?.score || 0} />
      </div>
    )},
    { id: 'activity-alerts', label: 'Activity, Actions & Alerts', component: (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity data={activity} />
        <PendingActionCenter data={pendingActions} />
        <SmartAlerts data={smartAlerts} />
      </div>
    )},
  ], [summary, revenue, attendance, admissions, healthScore, activity, pendingActions, smartAlerts])

  const getWidgetOrder = (tab: string): string[] => {
    if (layout[tab]) return layout[tab]
    return getOverviewWidgets().map(w => w.id)
  }

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedId(widgetId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', widgetId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return

    const currentOrder = getWidgetOrder(activeTab)
    const fromIndex = currentOrder.indexOf(draggedId)
    const toIndex = currentOrder.indexOf(targetId)
    if (fromIndex === -1 || toIndex === -1) return

    const newOrder = [...currentOrder]
    newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, draggedId)

    const newLayout = { ...layout, [activeTab]: newOrder }
    setLayout(newLayout)
    saveLayout(newLayout)
    setDraggedId(null)
  }

  const handleDragEnd = () => setDraggedId(null)

  const resetLayout = () => {
    const empty: Record<string, string[]> = {}
    setLayout(empty)
    saveLayout(empty)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const renderOverviewWidgets = () => {
    const widgets = getOverviewWidgets()
    const order = getWidgetOrder(activeTab)
    const orderedWidgets = order
      .map(id => widgets.find(w => w.id === id))
      .filter(Boolean) as WidgetItem[]

    return orderedWidgets.map((widget) => (
      <div
        key={widget.id}
        draggable={customizeMode}
        onDragStart={(e) => handleDragStart(e, widget.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, widget.id)}
        onDragEnd={handleDragEnd}
        className={cn(
          'transition-all',
          customizeMode && 'cursor-grab active:cursor-grabbing ring-2 ring-indigo-500/30 rounded-xl',
          draggedId === widget.id && 'opacity-50'
        )}
      >
        {customizeMode && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-t-xl border border-b-0 border-indigo-500/20">
            <GripVertical className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-400">{widget.label}</span>
          </div>
        )}
        {widget.component}
      </div>
    ))
  }

  return (
    <div className="space-y-6">
      <GreetingBanner />
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setCustomizeMode(!customizeMode)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors',
            customizeMode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
          )}
        >
          <Settings className="w-4 h-4" />
          {customizeMode ? 'Done' : 'Customize'}
        </button>
        {customizeMode && (
          <button onClick={resetLayout} className="flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 text-slate-300">
            <RotateCcw className="w-4 h-4" />Reset Layout
          </button>
        )}
        <button onClick={loadDashboard} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 text-slate-300">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="border-b border-slate-700">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('pb-3 text-sm font-medium border-b-2 transition-colors', activeTab === tab.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200')}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && renderOverviewWidgets()}

      {activeTab === 'finance' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Today's Collection" value={formatCurrency(revenue?.today?.amount || 0)} icon={DollarSign} color="bg-green-500" />
            <StatCard title="Monthly Revenue" value={formatCurrency(revenue?.monthly?.amount || 0)} icon={TrendingUp} color="bg-blue-500" />
            <StatCard title="Outstanding Fees" value={formatCurrency(revenue?.outstanding || 0)} icon={Clock} color="bg-orange-500" />
            <StatCard title="Collection Rate" value={`${revenue?.feeCollectionRate || 0}%`} icon={CheckCircle} color="bg-purple-500" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={revenue?.monthlyTrend || []} />
            <RevenueByTypeChart data={revenue?.byType || {}} />
          </div>
        </>
      )}

      {activeTab === 'academic' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Avg Attendance" value={`${attendance?.student?.percentage || 0}%`} icon={CheckCircle} color="bg-green-500" />
            <StatCard title="Pass Rate" value={`${academic?.examStats?.passPercentage || 0}%`} icon={GraduationCap} color="bg-blue-500" />
            <StatCard title="Total Admissions" value={formatNumber(admissions?.pipeline?.applied + admissions?.pipeline?.enrolled || 0)} icon={GraduationCap} color="bg-purple-500" />
            <StatCard title="Conversion Rate" value={`${admissions?.conversionRate || 0}%`} icon={TrendingUp} color="bg-amber-500" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttendanceChart data={attendance?.monthlyTrend || []} />
            <DepartmentDistribution data={summary?.departmentStats || []} />
          </div>
          <AdmissionFunnel data={admissions?.pipeline || {}} />
        </>
      )}

      {activeTab === 'hr' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Staff" value={formatNumber(summary?.totalEmployees || 0)} icon={Users} color="bg-blue-500" />
            <StatCard title="Faculty Attendance" value={`${attendance?.employee?.percentage || 0}%`} icon={CheckCircle} color="bg-green-500" />
            <StatCard title="Leave Requests" value={hr?.leaveStats?.pending || 0} icon={Clock} color="bg-orange-500" />
            <StatCard title="Active Employees" value={formatNumber(hr?.employeeStats?.active || 0)} icon={Users} color="bg-purple-500" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h3 className="font-semibold text-white mb-4">Leave Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { name: 'Approved', count: hr?.leaveStats?.approved || 0, fill: '#22c55e' },
                  { name: 'Pending', count: hr?.leaveStats?.pending || 0, fill: '#f59e0b' },
                  { name: 'Rejected', count: hr?.leaveStats?.rejected || 0, fill: '#ef4444' },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {[0, 1, 2].map((i) => (
                      <Cell key={i} fill={['#22c55e', '#f59e0b', '#ef4444'][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h3 className="font-semibold text-white mb-4">Department Headcount</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hr?.departmentStats || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === 'campus' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Hostel Occupancy" value={`${hostel?.occupancy?.rate || 0}%`} icon={CheckCircle} color="bg-blue-500" />
            <StatCard title="Library Books" value={formatNumber(library?.totalBooks || 0)} icon={CheckCircle} color="bg-green-500" />
            <StatCard title="Active Vehicles" value={transport?.vehicles || 0} icon={CheckCircle} color="bg-purple-500" />
            <StatCard title="Transport Students" value={formatNumber(transport?.students || 0)} icon={Users} color="bg-amber-500" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h3 className="font-semibold text-white mb-4">Hostel Occupancy</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={[
                    { name: 'Occupied', value: hostel?.occupancy?.occupied || 0 },
                    { name: 'Vacant', value: hostel?.occupancy?.vacant || 0 },
                  ]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    <Cell fill="#6366f1" />
                    <Cell fill="#334155" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h3 className="font-semibold text-white mb-4">Library Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-sm text-slate-300">Total Books</span>
                  <span className="text-sm font-semibold text-white">{formatNumber(library?.totalBooks || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-sm text-slate-300">Issued Today</span>
                  <span className="text-sm font-semibold text-blue-400">{library?.issuedToday || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-sm text-slate-300">Returned Today</span>
                  <span className="text-sm font-semibold text-green-400">{library?.returnedToday || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-sm text-slate-300">Overdue</span>
                  <span className="text-sm font-semibold text-red-400">{library?.overdue || 0}</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h3 className="font-semibold text-white mb-4">Transport Fleet</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-sm text-slate-300">Active Vehicles</span>
                  <span className="text-sm font-semibold text-white">{transport?.vehicles || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-sm text-slate-300">Total Routes</span>
                  <span className="text-sm font-semibold text-blue-400">{transport?.routes || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-sm text-slate-300">Students Enrolled</span>
                  <span className="text-sm font-semibold text-green-400">{formatNumber(transport?.students || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-sm text-slate-300">Pending Maintenance</span>
                  <span className="text-sm font-semibold text-orange-400">{transport?.maintenancePending || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

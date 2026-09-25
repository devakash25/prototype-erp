import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bus, Users, GraduationCap, MapPin, Wrench, AlertTriangle,
  RefreshCw, CheckCircle2, Clock,
  TrendingUp, FileWarning,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/StatCard'
import { GreetingBanner } from '@/components/GreetingBanner'
import api from '@/services/api'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts'

const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export function TransportDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const res = await api.get('/transport/dashboard')
      setData(res.data?.data ?? res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  const summary = data?.summary || {}
  const routeUtilization = data?.routeUtilization || []
  const driverAttendance = data?.driverAttendanceToday || []
  const recentMaintenances = data?.recentMaintenances || []
  const alerts = data?.alerts || []

  const kpiCards = [
    { title: 'Active Vehicles', value: summary.activeVehicles || 0, icon: Bus, color: 'bg-blue-500' },
    { title: 'Drivers Available', value: summary.driversAvailable || 0, icon: Users, color: 'bg-green-500' },
    { title: 'Students Using Transport', value: summary.studentsUsingTransport || 0, icon: GraduationCap, color: 'bg-purple-500' },
    { title: "Today's Routes", value: summary.totalRoutes || 0, icon: MapPin, color: 'bg-teal-500' },
    { title: 'Vehicles Under Maintenance', value: summary.maintenanceVehicles || 0, icon: Wrench, color: 'bg-orange-500' },
    { title: 'Pending Complaints', value: summary.activeComplaints || 0, icon: AlertTriangle, color: 'bg-red-500' },
    { title: 'Fleet Utilization %', value: `${summary.fleetUtilizationRate || 0}%`, icon: TrendingUp, color: 'bg-indigo-500' },
    { title: 'Driver Availability %', value: `${summary.driverAvailabilityRate || 0}%`, icon: CheckCircle2, color: 'bg-emerald-500' },
  ]

  const fleetStatusData = [
    { name: 'Active', value: summary.activeVehicles || 0 },
    { name: 'Inactive', value: summary.inactiveVehicles || 0 },
    { name: 'Maintenance', value: summary.maintenanceVehicles || 0 },
  ].filter((d) => d.value > 0)

  const quickActions = [
    { label: 'Vehicles', href: '/transport/vehicles', color: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30', icon: Bus },
    { label: 'Drivers', href: '/transport/drivers', color: 'bg-green-500/20 text-green-400 hover:bg-green-500/30', icon: Users },
    { label: 'Routes', href: '/transport/routes', color: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30', icon: MapPin },
    { label: 'Maintenance', href: '/transport/maintenance', color: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30', icon: Wrench },
  ]

  return (
    <div className="bg-slate-900 min-h-screen p-6 space-y-6">
      <GreetingBanner />
      <div className="flex items-center justify-end">
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl transition-colors',
                action.color
              )}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Fleet Status</h2>
          {fleetStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={fleetStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                >
                  {fleetStatusData.map((_: unknown, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">No fleet data</div>
          )}
        </div>

        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Route Utilization</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-700/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Route</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Vehicle</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Shift</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Departure</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Arrival</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {routeUtilization.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">
                      <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      No routes configured
                    </td>
                  </tr>
                ) : (
                  routeUtilization.map((route: any, idx: number) => (
                    <tr key={route.routeId || idx} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-white">{route.routeCode} - {route.routeName}</td>
                      <td className="px-5 py-3 text-sm text-slate-300">{route.vehicleRegistration || '—'}</td>
                      <td className="px-5 py-3 text-sm text-slate-300 capitalize">{route.shift || '—'}</td>
                      <td className="px-5 py-3 text-sm text-slate-300 text-center">
                        {route.departureTime ? new Date(route.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-300 text-center">
                        {route.arrivalTime ? new Date(route.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Driver Attendance Today</h2>
          </div>
          <div className="divide-y divide-slate-700/50 max-h-80 overflow-y-auto">
            {driverAttendance.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No attendance records today
              </div>
            ) : (
              driverAttendance.map((record: any, idx: number) => (
                <div key={record.id || idx} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-700/50 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-indigo-500/20 text-indigo-400 text-xs font-medium">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">Driver {idx + 1}</p>
                    <p className="text-xs text-slate-400">{record.notes || '—'}</p>
                  </div>
                  <span className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-full',
                    record.status === 'PRESENT'
                      ? 'bg-green-500/20 text-green-400'
                      : record.status === 'ABSENT'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-slate-700 text-slate-400'
                  )}>
                    {record.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Recent Maintenances</h2>
          </div>
          <div className="divide-y divide-slate-700/50 max-h-80 overflow-y-auto">
            {recentMaintenances.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                <Wrench className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No recent maintenance records
              </div>
            ) : (
              recentMaintenances.map((item: any, idx: number) => (
                <div key={item.id || idx} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-700/50 transition-colors">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    item.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400'
                      : item.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                  )}>
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.vehicle?.registrationNumber || 'Unknown Vehicle'}</p>
                    <p className="text-xs text-slate-400">{item.title} · {item.type?.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-full',
                      item.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400'
                        : item.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                    )}>
                      {item.status?.replace('_', ' ')}
                    </span>
                    {item.scheduledDate && (
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(item.scheduledDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-white">Alerts</h2>
          </div>
          <div className="space-y-2">
            {alerts.map((alert: any, idx: number) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  alert.type === 'error'
                    ? 'bg-red-500/10 border-red-500/30'
                    : alert.type === 'warning'
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                )}
              >
                <FileWarning className={cn(
                  'w-4 h-4 shrink-0',
                  alert.type === 'error' ? 'text-red-400'
                    : alert.type === 'warning' ? 'text-yellow-400'
                      : 'text-blue-400'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{alert.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TransportDashboard

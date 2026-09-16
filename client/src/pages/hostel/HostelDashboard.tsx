import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, BedDouble, Bed, Users, TrendingUp, AlertTriangle,
  RefreshCw, ArrowRight, LogIn, LogOut, Plus, Eye, MessageSquare,
  CalendarDays,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { GreetingBanner } from '@/components/GreetingBanner'

export function HostelDashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const [error, setError] = useState(false)

  const loadDashboard = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await api.get('/hostel/dashboard')
      setData(res.data)
    } catch (err) {
      console.error(err)
      setError(true)
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-400">Failed to load dashboard</p>
        <button onClick={loadDashboard} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const summary = data?.summary || {}
  const totalHostels = summary.totalHostels || 0
  const totalRooms = summary.totalRooms || 0
  const occupiedRooms = summary.occupiedRooms || 0
  const vacantRooms = summary.vacantRooms || 0
  const occupancyRate = summary.occupancyRate || 0
  const pendingComplaints = summary.pendingComplaints || 0

  const kpiCards = [
    { title: 'Total Hostels', value: totalHostels, icon: Building2, color: 'bg-blue-500' },
    { title: 'Total Rooms', value: totalRooms, icon: BedDouble, color: 'bg-indigo-500' },
    { title: 'Occupied Rooms', value: occupiedRooms, icon: Bed, color: 'bg-orange-500' },
    { title: 'Vacant Rooms', value: vacantRooms, icon: Bed, color: 'bg-green-500' },
    { title: 'Occupancy Rate', value: `${occupancyRate}%`, icon: TrendingUp, color: 'bg-purple-500' },
    { title: 'Pending Complaints', value: pendingComplaints, icon: AlertTriangle, color: 'bg-red-500' },
  ]

  const quickActions = [
    { label: 'Allocate Room', href: '/hostel/students', color: 'bg-green-500/10 text-green-400 hover:bg-green-500/20', icon: Plus },
    { label: 'View Students', href: '/hostel/students', color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20', icon: Eye },
    { label: 'Raise Complaint', href: '/hostel/complaints', color: 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20', icon: MessageSquare },
  ]

  const hostelStats = data?.hostelStats || []
  const recentComplaints = data?.recentComplaints || []
  const todayCheckIns = data?.todayCheckIns || []
  const todayCheckOuts = data?.todayCheckOuts || []

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'bg-red-500'
    if (rate >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-slate-900 min-h-screen p-6 space-y-6">
      <GreetingBanner />
      <div className="flex items-center justify-end">
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.title}
            className="bg-slate-800 rounded-xl border border-slate-700 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">{card.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className={cn('p-3 rounded-xl', card.color)}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Occupancy Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Room Occupancy</h2>
          {(occupiedRooms > 0 || vacantRooms > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Occupied', value: occupiedRooms },
                    { name: 'Vacant', value: vacantRooms },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                >
                  <Cell fill="#f59e0b" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">No occupancy data</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
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
      </div>

      {/* Hostel-wise Stats */}
      {hostelStats.length > 0 && (
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Hostel-wise Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hostelStats.map((hostel: any) => {
              const rate = hostel.capacity > 0 ? Math.round((hostel.occupied / hostel.capacity) * 100) : 0
              return (
                <div key={hostel.id} className="p-4 bg-slate-700/50 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{hostel.name}</h3>
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      hostel.type === 'BOYS' ? 'bg-blue-500/20 text-blue-400'
                        : hostel.type === 'GIRLS' ? 'bg-pink-500/20 text-pink-400'
                        : 'bg-purple-500/20 text-purple-400'
                    )}>
                      {hostel.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <p className="text-slate-400">Capacity</p>
                      <p className="font-semibold text-white">{hostel.capacity}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Occupied</p>
                      <p className="font-semibold text-white">{hostel.occupied}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Rate</p>
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div className={cn('h-2 rounded-full', getOccupancyColor(rate))} style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-300">{rate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Check-ins / Check-outs */}
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            <CalendarDays className="w-5 h-5 inline mr-2" />
            Today's Check-ins / Check-outs
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                <LogIn className="w-4 h-4 text-green-500" /> Check-ins
              </h3>
              {todayCheckIns.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No check-ins today</p>
              ) : (
                <div className="space-y-2">
                  {todayCheckIns.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div>
                        <p className="text-sm font-medium text-white">{item.studentName}</p>
                        <p className="text-xs text-slate-400">Room {item.roomNumber} — {item.hostelName}</p>
                      </div>
                      <span className="text-xs text-green-400">{item.time || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                <LogOut className="w-4 h-4 text-red-500" /> Check-outs
              </h3>
              {todayCheckOuts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No check-outs today</p>
              ) : (
                <div className="space-y-2">
                  {todayCheckOuts.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div>
                        <p className="text-sm font-medium text-white">{item.studentName}</p>
                        <p className="text-xs text-slate-400">Room {item.roomNumber} — {item.hostelName}</p>
                      </div>
                      <span className="text-xs text-red-400">{item.time || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Complaints</h2>
            <Link to="/hostel/complaints" className="text-sm text-indigo-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentComplaints.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No recent complaints</p>
          ) : (
            <div className="space-y-3">
              {recentComplaints.slice(0, 6).map((complaint: any) => (
                <div key={complaint.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-700">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{complaint.title}</p>
                    <p className="text-xs text-slate-400">
                      {complaint.studentName || '—'} &bull; {complaint.category || '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      complaint.priority === 'URGENT' ? 'bg-red-500/20 text-red-400'
                        : complaint.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-blue-500/20 text-blue-400'
                    )}>
                      {complaint.priority}
                    </span>
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      complaint.status === 'OPEN' ? 'bg-yellow-500/20 text-yellow-400'
                        : complaint.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-green-500/20 text-green-400'
                    )}>
                      {complaint.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HostelDashboard

import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import { GreetingBanner } from '@/components/GreetingBanner'
import {
  Users,
  MessageSquare,
  ClipboardList,
  FileCheck,
  Phone,
  RefreshCw,
  UserPlus,
  Printer,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const PIE_COLORS = ['#10b981', '#64748b', '#3b82f6']

export function ReceptionistDashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['receptionist-dashboard'],
    queryFn: async () => {
      const res = await api.get('/receptionist/dashboard')
      return res.data?.data ?? res.data
    },
  })

  const d = data?.data || {}
  const kpis = d.kpis || {}
  const recentVisitors = d.recentVisitors || d.visitors || []
  const pendingEnquiries = d.pendingEnquiries || d.enquiries || []

  const kpiCards = [
    { label: "Today's Visitors", value: kpis.todayVisitors ?? 0, icon: Users, color: 'text-blue-400 bg-blue-900/30' },
    { label: 'Pending Enquiries', value: kpis.pendingEnquiries ?? 0, icon: MessageSquare, color: 'text-orange-400 bg-orange-900/30' },
    { label: 'Pending Registrations', value: kpis.pendingRegistrations ?? 0, icon: ClipboardList, color: 'text-purple-400 bg-purple-900/30' },
    { label: 'Certificates Ready', value: kpis.certificatesReady ?? 0, icon: FileCheck, color: 'text-green-400 bg-green-900/30' },
    { label: 'Phone Calls Today', value: kpis.phoneCallsToday ?? 0, icon: Phone, color: 'text-cyan-400 bg-cyan-900/30' },
  ]

  const quickActions = [
    { label: 'Log Visitor', icon: UserPlus, href: '/receptionist/visitors', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { label: 'New Enquiry', icon: MessageSquare, href: '/receptionist/enquiries', color: 'bg-orange-600 hover:bg-orange-700 text-white' },
    { label: 'Generate Certificate', icon: Printer, href: '/receptionist/certificates', color: 'bg-green-600 hover:bg-green-700 text-white' },
  ]

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
        <p className="text-red-400 text-sm">Failed to load dashboard</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 hover:bg-slate-600">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <GreetingBanner />

      <div className="flex items-center justify-end">
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
              </div>
              <div className={cn('p-3 rounded-xl', card.color)}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className={cn(
                'flex items-center justify-center gap-2 p-4 rounded-xl text-sm font-medium transition-colors',
                action.color
              )}
            >
              <action.icon className="h-5 w-5" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Status Pie Chart */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Visitor Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Currently In', value: kpis.currentlyOnPremise ?? 0 },
                  { name: 'Checked Out', value: kpis.visitorsOut ?? 0 },
                  { name: "Today's Total", value: kpis.todayVisitors ?? 0 },
                ].filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
              >
                {[0,1,2].map((i) => (
                  <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Certificate & Call Summary Bar Chart */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Daily Activity</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'Certificates', generated: kpis.certificatesGeneratedToday ?? 0, pending: kpis.pendingCertificates ?? 0 },
              { name: 'Phone Calls', total: kpis.phoneCallsToday ?? 0, missed: kpis.missedCalls ?? 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="generated" fill="#10b981" radius={[4, 4, 0, 0]} name="Generated" />
              <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Calls" />
              <Bar dataKey="missed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Missed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Visitors */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Visitors</h2>
            <Link to="/receptionist/visitors" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-700/50 max-h-80 overflow-y-auto">
            {recentVisitors.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                No visitors today
              </div>
            ) : (
              recentVisitors.map((visitor: any) => (
                <div key={visitor.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-700/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-blue-400">
                      {visitor.visitorName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{visitor.visitorName}</p>
                    <p className="text-xs text-slate-400 truncate">{visitor.purpose} &middot; Meeting {visitor.personToMeet}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      visitor.status === 'IN' ? 'bg-green-500/15 text-green-400' : 'bg-slate-500/15 text-slate-400'
                    )}>
                      {visitor.status}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(visitor.inTime || visitor.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Enquiries */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Pending Enquiries</h2>
            <Link to="/receptionist/enquiries" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-700/50 max-h-80 overflow-y-auto">
            {pendingEnquiries.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                No pending enquiries
              </div>
            ) : (
              pendingEnquiries.map((enquiry: any) => (
                <div key={enquiry.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-700/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{enquiry.studentName || enquiry.name}</p>
                    <p className="text-xs text-slate-400 truncate">{enquiry.course || enquiry.program} &middot; {enquiry.source}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">
                      {enquiry.status || 'NEW'}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(enquiry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Today's Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Visitors IN</span>
              <span className="font-medium text-green-400">{kpis.visitorsIn ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Visitors OUT</span>
              <span className="font-medium text-slate-400">{kpis.visitorsOut ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Currently On Premise</span>
              <span className="font-medium text-blue-400">{kpis.currentlyOnPremise ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Certificate Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Generated Today</span>
              <span className="font-medium text-green-400">{kpis.certificatesGeneratedToday ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Pending Generation</span>
              <span className="font-medium text-orange-400">{kpis.pendingCertificates ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Ready for Pickup</span>
              <span className="font-medium text-blue-400">{kpis.certificatesReady ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Call Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Total Calls Today</span>
              <span className="font-medium text-blue-400">{kpis.phoneCallsToday ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Missed Calls</span>
              <span className="font-medium text-red-400">{kpis.missedCalls ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Enquiries from Calls</span>
              <span className="font-medium text-purple-400">{kpis.callEnquiries ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceptionistDashboard

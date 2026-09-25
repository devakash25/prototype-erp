import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, ClipboardList, Bell, CalendarDays, AlertTriangle,
  Workflow, Files, Clock, RefreshCw, ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/StatCard'
import { GreetingBanner } from '@/components/GreetingBanner'
import api from '@/services/api'

export function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const res = await api.get('/administrative/dashboard')
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

  const kpiCards = [
    { title: 'Pending Certificates', value: summary.pendingCertificates || 0, icon: FileText, color: 'bg-blue-500' },
    { title: 'Pending Requests', value: summary.pendingRequests || 0, icon: ClipboardList, color: 'bg-orange-500' },
    { title: 'Notices Published', value: summary.noticesThisMonth || 0, icon: Bell, color: 'bg-green-500' },
    { title: 'Meetings Today', value: summary.meetingsToday || 0, icon: CalendarDays, color: 'bg-purple-500' },
    { title: 'Pending Complaints', value: summary.pendingComplaints || 0, icon: AlertTriangle, color: 'bg-red-500' },
    { title: 'Pending Workflows', value: summary.pendingWorkflows || 0, icon: Workflow, color: 'bg-yellow-500' },
    { title: 'Documents Processed Today', value: summary.docsProcessedToday || 0, icon: Files, color: 'bg-teal-500' },
    { title: 'Avg Processing Time', value: `${summary.avgProcessingTime || 0}h`, icon: Clock, color: 'bg-indigo-500' },
  ]

  const quickActions = [
    { label: 'Certificates', href: '/administrative/certificates', color: 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50', icon: FileText },
    { label: 'Requests', href: '/administrative/requests', color: 'bg-orange-900/30 text-orange-400 hover:bg-orange-900/50', icon: ClipboardList },
    { label: 'Notices', href: '/administrative/notices', color: 'bg-green-900/30 text-green-400 hover:bg-green-900/50', icon: Bell },
    { label: 'Meetings', href: '/administrative/meetings', color: 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50', icon: CalendarDays },
  ]

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'bg-green-900/30 text-green-400'
      case 'PENDING': return 'bg-yellow-900/30 text-yellow-400'
      case 'ISSUED': return 'bg-blue-900/30 text-blue-400'
      case 'REJECTED': return 'bg-red-900/30 text-red-400'
      case 'PROCESSING': return 'bg-purple-900/30 text-purple-400'
      case 'SCHEDULED': return 'bg-teal-900/30 text-teal-400'
      case 'COMPLETED': return 'bg-green-900/30 text-green-400'
      default: return 'bg-slate-700 text-slate-400'
    }
  }

  const recentCertificates = data?.recentCertificates || []
  const recentRequests = data?.recentRequests || []
  const upcomingMeetings = data?.upcomingMeetings || []

  return (
    <div className="space-y-6">
      <GreetingBanner />
      <div className="flex items-center justify-end">
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700"
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

      <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Certificates</h2>
            <Link to="/administrative/certificates" className="text-sm text-indigo-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentCertificates.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No recent certificates</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase">Student</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase">Type</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-slate-400 uppercase">Status</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {recentCertificates.slice(0, 5).map((cert: any) => (
                    <tr key={cert.id} className="hover:bg-slate-700/50">
                      <td className="px-3 py-3 text-sm font-medium text-white">{cert.student?.fullName || '—'}</td>
                      <td className="px-3 py-3 text-sm text-slate-300">{cert.type}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getStatusBadge(cert.status))}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-400">
                        {cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Requests</h2>
            <Link to="/administrative/requests" className="text-sm text-indigo-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentRequests.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No recent requests</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase">Student</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-slate-400 uppercase">Title</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-slate-400 uppercase">Status</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-slate-400 uppercase">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {recentRequests.slice(0, 5).map((req: any) => (
                    <tr key={req.id} className="hover:bg-slate-700/50">
                      <td className="px-3 py-3 text-sm font-medium text-white">{req.student?.fullName || '—'}</td>
                      <td className="px-3 py-3 text-sm text-slate-300">{req.title}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getStatusBadge(req.status))}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          req.priority === 'URGENT' ? 'bg-red-900/30 text-red-400'
                            : req.priority === 'HIGH' ? 'bg-yellow-900/30 text-yellow-400'
                            : req.priority === 'NORMAL' ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-slate-700 text-slate-400'
                        )}>
                          {req.priority}
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

      <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Upcoming Meetings</h2>
          <Link to="/administrative/meetings" className="text-sm text-indigo-400 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {upcomingMeetings.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No upcoming meetings</p>
        ) : (
          <div className="space-y-3">
            {upcomingMeetings.slice(0, 5).map((meeting: any) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-900/30 flex items-center justify-center">
                    <CalendarDays className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{meeting.title}</p>
                    <p className="text-xs text-slate-400">{meeting.type} &bull; {meeting.location || '—'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {meeting.date ? new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {meeting.time || ''} {meeting.endTime ? `- ${meeting.endTime}` : ''}
                  </p>
                  <span className={cn('inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full', getStatusBadge(meeting.status))}>
                    {meeting.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

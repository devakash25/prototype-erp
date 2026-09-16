import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, FileText, Clock, CheckCircle2, AlertTriangle,
  Target, Eye, Phone, RefreshCw, Activity,
  ArrowRight, UserPlus, ClipboardCheck, Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/services/api'
import { GreetingBanner } from '@/components/GreetingBanner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

export function AdmissionDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [funnel, setFunnel] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        api.get('/admission/kpis'),
        api.get('/admission/funnel'),
        api.get('/admission/activity?limit=15'),
      ])
      const get = (i: number) => results[i].status === 'fulfilled' ? (results[i] as PromiseFulfilledResult<any>).value.data.data : null
      setKpis(get(0))
      setFunnel(get(1) || [])
      setActivity(get(2) || [])
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

  const kpiCards = [
    { title: "Today's Enquiries", value: kpis?.todayEnquiries || 0, icon: Users, color: 'bg-blue-500' },
    { title: 'New Applications', value: kpis?.newApplications || 0, icon: FileText, color: 'bg-green-500' },
    { title: 'Pending Verification', value: kpis?.pendingVerification || 0, icon: Clock, color: 'bg-orange-500' },
    { title: 'Admissions Approved', value: kpis?.admissionsApproved || 0, icon: CheckCircle2, color: 'bg-emerald-500' },
    { title: 'Incomplete Documents', value: kpis?.incompleteDocuments || 0, icon: AlertTriangle, color: 'bg-red-500' },
    { title: 'Admission Target', value: kpis?.admissionTarget || 0, icon: Target, color: 'bg-purple-500' },
    { title: 'Under Review', value: kpis?.underReview || 0, icon: Eye, color: 'bg-yellow-500' },
    { title: 'Follow-ups Pending', value: kpis?.followupsPending || 0, icon: Phone, color: 'bg-teal-500' },
  ]

  const funnelData = Array.isArray(funnel)
    ? funnel.map((item: any) => ({
        stage: item.stage,
        count: item.count,
      }))
    : []

  const funnelColors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']

  const quickActions = [
    { label: 'Register Enquiry', href: '/admission/new', color: 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/20', icon: UserPlus },
    { label: 'Create Application', href: '/admission/new', color: 'bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/20', icon: FileText },
    { label: 'Verify Documents', href: '/admission/applications', color: 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 border border-orange-500/20', icon: ClipboardCheck },
    { label: 'Follow-ups', href: '/admission/follow-ups', color: 'bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/20', icon: Bell },
  ]

  return (
    <div className="space-y-6">
      <GreetingBanner />
      <div className="flex items-center justify-end">
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white hover:bg-slate-600"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.title}
            className="bg-slate-800 rounded-xl border border-slate-700 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{card.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', card.color)}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
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

      {/* Funnel & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admission Funnel */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Admission Funnel</h2>
            <span className="text-xs text-slate-400">This month</span>
          </div>
          {funnelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {funnelData.map((_, index) => (
                    <Cell key={index} fill={funnelColors[index % funnelColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <p>No funnel data available</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="divide-y divide-slate-700/50 max-h-80 overflow-y-auto">
            {activity.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                <Activity className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No recent activity
              </div>
            ) : (
              activity.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-700/50">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-indigo-500/15 text-indigo-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-100 truncate">{item.description}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Application Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Total Applications</span>
              <span className="font-medium text-white">{kpis?.totalApplications || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Approved</span>
              <span className="font-medium text-green-400">{kpis?.admissionsApproved || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Rejected</span>
              <span className="font-medium text-red-400">{kpis?.rejected || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Enrolled</span>
              <span className="font-medium text-blue-400">{kpis?.enrolled || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Source Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Website</span>
              <span className="font-medium text-blue-400">{kpis?.sourceWebsite || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Walk-in</span>
              <span className="font-medium text-green-400">{kpis?.sourceWalkin || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Referral</span>
              <span className="font-medium text-purple-400">{kpis?.sourceReferral || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Social Media</span>
              <span className="font-medium text-orange-400">{kpis?.sourceSocial || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Pending Actions</h2>
          <div className="space-y-3">
            {(kpis?.pendingVerification || 0) > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-100">Pending Verification</span>
                </div>
                <span className="text-lg font-bold text-orange-400">{kpis.pendingVerification}</span>
              </div>
            )}
            {(kpis?.incompleteDocuments || 0) > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-100">Incomplete Documents</span>
                </div>
                <span className="text-lg font-bold text-red-400">{kpis.incompleteDocuments}</span>
              </div>
            )}
            {(kpis?.followupsPending || 0) > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-teal-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-100">Follow-ups Pending</span>
                </div>
                <span className="text-lg font-bold text-teal-400">{kpis.followupsPending}</span>
              </div>
            )}
            {(kpis?.pendingVerification || 0) === 0 && (kpis?.incompleteDocuments || 0) === 0 && (kpis?.followupsPending || 0) === 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400 font-medium">All clear - no pending actions</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdmissionDashboard

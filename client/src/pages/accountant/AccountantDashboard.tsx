import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  IndianRupee, TrendingUp, Clock, Users, CreditCard, Wallet,
  RefreshCw, CheckCircle2, XCircle,
  Activity, Receipt,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { StatCard } from '@/components/StatCard'
import api from '@/services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

export function AccountantDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [revenueByType, setRevenueByType] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        api.get('/accountant/kpis'),
        api.get('/accountant/revenue-by-type'),
        api.get('/accountant/activity?limit=15'),
      ])
      const get = (i: number) => results[i].status === 'fulfilled' ? (results[i] as PromiseFulfilledResult<any>).value.data.data : null
      setKpis(get(0))
      setRevenueByType(get(1))
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
    { title: "Today's Collection", value: formatCurrency(kpis?.todayCollection || 0), icon: IndianRupee, color: 'bg-green-500' },
    { title: 'Monthly Revenue', value: formatCurrency(kpis?.monthlyRevenue || 0), icon: TrendingUp, color: 'bg-blue-500' },
    { title: 'Pending Fees', value: formatCurrency(kpis?.pendingFees || 0), icon: Clock, color: 'bg-orange-500' },
    { title: 'Students with Dues', value: kpis?.studentsPending || 0, icon: Users, color: 'bg-red-500' },
    { title: 'Online Payments', value: kpis?.onlinePayments || 0, icon: CreditCard, color: 'bg-purple-500' },
    { title: 'Cash Counter', value: kpis?.cashCounter || 0, icon: Wallet, color: 'bg-teal-500' },
    { title: 'Refund Requests', value: kpis?.refundRequests || 0, icon: RefreshCw, color: 'bg-yellow-500' },
    { title: 'Failed Payments', value: kpis?.failedPayments || 0, icon: XCircle, color: 'bg-red-600' },
  ]

  const chartData = Array.isArray(revenueByType)
    ? revenueByType.map((item: any) => ({
        type: item.feeType,
        amount: item.collected,
      })).sort((a, b) => b.amount - a.amount)
    : []

  const quickActions = [
    { label: 'Collect Fees', href: '/accountant/collections', color: 'bg-green-500/15 text-green-400 hover:bg-green-500/25', icon: IndianRupee },
    { label: 'Student Ledger', href: '/accountant/ledger', color: 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25', icon: Receipt },
    { label: 'Refund Requests', href: '/accountant/refunds', color: 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/25', icon: RefreshCw },
    { label: 'Reports', href: '/accountant/reports', color: 'bg-purple-500/15 text-purple-400 hover:bg-purple-500/25', icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Accountant Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Fee collection & financial overview</p>
        </div>
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 hover:bg-slate-600"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
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

      {/* Revenue Chart & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Fee Type */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Revenue by Fee Type</h2>
            <span className="text-xs text-slate-400">This year</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 100000).toFixed(1)}L`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <p>No revenue data available</p>
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
                <Activity className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                No recent activity
              </div>
            ) : (
              activity.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-700/50">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-blue-500/15 text-blue-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.description}</p>
                    {item.amount && <p className="text-xs text-slate-400">{formatCurrency(item.amount)}</p>}
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
          <h2 className="text-lg font-semibold text-white mb-4">Collection Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Today</span>
              <span className="font-medium text-green-400">{formatCurrency(kpis?.todayCollection || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">This Week</span>
              <span className="font-medium text-white">{formatCurrency(kpis?.weekCollection || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">This Month</span>
              <span className="font-medium text-white">{formatCurrency(kpis?.monthlyRevenue || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Collection Rate</span>
              <span className="font-medium text-blue-400">{kpis?.collectionRate || 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Payment Methods</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Online</span>
              <span className="font-medium text-blue-400">{kpis?.onlinePayments || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Cash</span>
              <span className="font-medium text-green-400">{kpis?.cashCounter || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Cheque</span>
              <span className="font-medium text-purple-400">{kpis?.chequePayments || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Failed</span>
              <span className="font-medium text-red-400">{kpis?.failedPayments || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Pending Actions</h2>
          </div>
          <div className="space-y-3">
            {(kpis?.refundRequests || 0) > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span className="text-sm font-medium text-white">Refund Requests</span>
                </div>
                <span className="text-lg font-bold text-yellow-400">{kpis.refundRequests}</span>
              </div>
            )}
            {(kpis?.failedPayments || 0) > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-sm font-medium text-white">Failed Payments</span>
                </div>
                <span className="text-lg font-bold text-red-400">{kpis.failedPayments}</span>
              </div>
            )}
            {(kpis?.studentsPending || 0) > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                    <Users className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="text-sm font-medium text-white">Students with Dues</span>
                </div>
                <span className="text-lg font-bold text-orange-400">{kpis.studentsPending}</span>
              </div>
            )}
            {(kpis?.refundRequests || 0) === 0 && (kpis?.failedPayments || 0) === 0 && (kpis?.studentsPending || 0) === 0 && (
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

export default AccountantDashboard

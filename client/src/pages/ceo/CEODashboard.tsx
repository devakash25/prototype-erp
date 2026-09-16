import { useQuery } from '@tanstack/react-query'
import {
  Users, UserCheck, DollarSign, CreditCard, Crown, Star,
  RefreshCw, TrendingUp, TrendingDown, BarChart3, Shield,
  Zap, BookOpen, Bus, Building, Briefcase, GraduationCap,
  HeartPulse, Library, Settings,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import api from '@/services/api'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function CEODashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['ceo-dashboard-stats'],
    queryFn: () => api.get('/ceo/dashboard-stats').then((res) => res.data),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    )
  }

  const users = stats?.users
  const revenue = stats?.revenue
  const plan = stats?.activePlan

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">CEO Dashboard</h1>
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700">
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />Refresh
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">Total Users</p>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{users?.totalUsers || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Across all roles</p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">Active Users</p>
            <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{users?.activeUsers || 0}</p>
          <p className="text-xs text-slate-400 mt-1">{users?.inactiveUsers || 0} inactive</p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">Total Revenue</p>
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(revenue?.total || 0)}</p>
          <p className="text-xs text-slate-400 mt-1">{formatCurrency(revenue?.paid || 0)} paid</p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">Unpaid</p>
            <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(revenue?.unpaid || 0)}</p>
          <p className="text-xs text-slate-400 mt-1">Outstanding dues</p>
        </div>
      </div>

      {/* Active Plan & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Plan */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Active Plan</h2>
          </div>
          {plan ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500/15">
                  {plan.planType === 'pro' ? <Crown className="w-6 h-6 text-white" /> : <Star className="w-6 h-6 text-white" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 capitalize">{plan.planType} plan</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  <Zap className="w-3 h-3" /> Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Monthly Price</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(plan.monthlyPrice)}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Features</p>
                  <p className="text-lg font-bold text-white">{plan.featureCount} enabled</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Roles</p>
                  <p className="text-lg font-bold text-white">{plan.enabledRoles}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Status</p>
                  <p className="text-lg font-bold text-green-400">Running</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">No active plan</p>
              <p className="text-xs text-slate-500 mt-1">Go to Plan & Subscription to activate one</p>
            </div>
          )}
        </div>

        {/* ERP System Status */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center">
              <Settings className="w-5 h-5 text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-white">System Status</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-green-400">ERP is Active</p>
                  <p className="text-xs text-slate-400 mt-0.5">All systems operational</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-xs text-slate-400">Database</p>
                </div>
                <p className="text-sm font-medium text-green-400">Connected</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-xs text-slate-400">API Server</p>
                </div>
                <p className="text-sm font-medium text-green-400">Running</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-xs text-slate-400">Authentication</p>
                </div>
                <p className="text-sm font-medium text-green-400">Active</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-xs text-slate-400">File Storage</p>
                </div>
                <p className="text-sm font-medium text-green-400">Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users by Role */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Users by Role</h2>
          <span className="text-sm text-slate-400 ml-auto">{users?.totalUsers || 0} total</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {users?.roleBreakdown?.map((item: any) => {
            const Icon = ROLE_ICONS[item.role] || Users
            const color = ROLE_COLORS[item.role] || 'from-indigo-500 to-slate-600'
            const percentage = users.totalUsers > 0 ? ((item.count / users.totalUsers) * 100).toFixed(1) : '0'

            return (
              <div key={item.role} className="bg-slate-700/40 rounded-xl p-4 hover:bg-slate-700/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.role}</p>
                    <p className="text-xs text-slate-400">{percentage}% of total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{item.count}</p>
                  </div>
                </div>
                <div className="mt-3 w-full h-1.5 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${color} rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
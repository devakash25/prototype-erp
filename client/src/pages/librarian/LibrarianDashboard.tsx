import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen, BookCheck, AlertTriangle, IndianRupee, Users,
  RefreshCw, Plus, Clock, RotateCcw, BarChart3, Layers,
} from 'lucide-react'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { GreetingBanner } from '@/components/GreetingBanner'

const categoryColor = (idx: number) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500',
    'bg-pink-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-rose-500',
    'bg-teal-500', 'bg-orange-500',
  ]
  return colors[idx % colors.length]
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function LibrarianDashboard() {
  const { user } = useAuthStore()

  const { data: dashboardRes, isLoading, refetch } = useQuery({
    queryKey: ['librarian-dashboard'],
    queryFn: () => api.get('/librarian/dashboard'),
  })

  const data = dashboardRes?.data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  const kpis = [
    { label: 'Total Books', value: data?.totalBooks ?? 0, icon: BookOpen, bg: 'bg-gradient-to-br from-blue-500/10 to-blue-500/10 border border-blue-500/30', labelColor: 'text-blue-400', iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400' },
    { label: 'Available Copies', value: data?.availableCopies ?? 0, icon: BookCheck, bg: 'bg-gradient-to-br from-green-500/10 to-green-500/10 border border-green-500/30', labelColor: 'text-green-400', iconBg: 'bg-green-500/15', iconColor: 'text-green-400' },
    { label: 'Issued Books', value: data?.issuedBooks ?? 0, icon: Layers, bg: 'bg-gradient-to-br from-purple-500/10 to-purple-500/10 border border-purple-500/30', labelColor: 'text-purple-400', iconBg: 'bg-purple-500/15', iconColor: 'text-purple-400' },
    { label: 'Overdue Books', value: data?.overdueBooks ?? 0, icon: AlertTriangle, bg: 'bg-gradient-to-br from-red-500/10 to-red-500/10 border border-red-500/30', labelColor: 'text-red-400', iconBg: 'bg-red-500/15', iconColor: 'text-red-400' },
    { label: 'Pending Fines', value: `\u20B9${(data?.pendingFines ?? 0).toLocaleString('en-IN')}`, icon: IndianRupee, bg: 'bg-gradient-to-br from-amber-500/10 to-amber-500/10 border border-amber-500/30', labelColor: 'text-amber-400', iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400' },
    { label: 'Active Members', value: data?.activeMembers ?? 0, icon: Users, bg: 'bg-gradient-to-br from-cyan-500/10 to-cyan-500/10 border border-cyan-500/30', labelColor: 'text-cyan-400', iconBg: 'bg-cyan-500/15', iconColor: 'text-cyan-400' },
  ]

  const categoryBreakdown = data?.categoryBreakdown || []
  const recentIssues = data?.recentIssues || []
  const todaySummary = data?.todaySummary || { issues: 0, returns: 0 }
  const maxCategoryCount = Math.max(...categoryBreakdown.map((c: any) => c.count || 0), 1)

  const quickActions = [
    { label: 'Issue Book', href: '/librarian/issue', icon: BookOpen, color: 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25' },
    { label: 'Return Book', href: '/librarian/returns', icon: RotateCcw, color: 'bg-green-500/15 text-green-400 hover:bg-green-500/25' },
    { label: 'Add Book', href: '/librarian/books', icon: Plus, color: 'bg-purple-500/15 text-purple-400 hover:bg-purple-500/25' },
  ]

  return (
    <div className="min-h-screen p-6 space-y-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={cn('rounded-xl p-5 hover:shadow-md transition-shadow', kpi.bg)}
          >
            <div className="flex items-center justify-between">
              <p className={cn('text-sm font-medium', kpi.labelColor)}>{kpi.label}</p>
              <div className={cn('p-2 rounded-lg', kpi.iconBg)}>
                <kpi.icon className={cn('w-4 h-4', kpi.iconColor)} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 mt-3">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
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
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Category Breakdown
          </h2>
          {categoryBreakdown.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 text-slate-600" />
              <p>No category data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((cat: any, idx: number) => {
                const pct = Math.max(((cat.count || 0) / maxCategoryCount) * 100, 2)
                return (
                  <div key={cat.category || idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 font-medium">{cat.category}</span>
                      <span className="text-slate-400">{cat.count || 0} books</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2.5">
                      <div
                        className={cn('h-2.5 rounded-full transition-all', categoryColor(idx))}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Today's Summary
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-500/15 border border-blue-500/30 rounded-xl p-5 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <p className="text-3xl font-bold text-blue-400">{todaySummary.issues}</p>
              <p className="text-sm text-blue-400/70 mt-1">Books Issued</p>
            </div>
            <div className="bg-green-500/15 border border-green-500/30 rounded-xl p-5 text-center">
              <RotateCcw className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <p className="text-3xl font-bold text-green-400">{todaySummary.returns}</p>
              <p className="text-sm text-green-400/70 mt-1">Books Returned</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Recent Issues</h2>
        </div>
        {recentIssues.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <BookOpen className="h-10 w-10 mx-auto mb-2 text-slate-600" />
            <p>No recent issues</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-700/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Book</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Member</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Issue Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Due Date</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {recentIssues.slice(0, 10).map((issue: any) => (
                  <tr key={issue.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{issue.book?.title || issue.bookTitle || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{issue.member?.name || issue.memberName || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{formatDate(issue.issueDate)}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{formatDate(issue.dueDate)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full',
                        issue.status === 'RETURNED' ? 'bg-green-500/15 text-green-400'
                          : issue.status === 'OVERDUE' ? 'bg-red-500/15 text-red-400'
                          : 'bg-blue-500/15 text-blue-400'
                      )}>
                        {issue.status}
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
  )
}

export default LibrarianDashboard

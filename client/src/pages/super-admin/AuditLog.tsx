import { useState, useCallback } from 'react'
import {
  Clock, User, Filter, Download, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Eye, LogIn, LogOut, Activity,
} from 'lucide-react'
import { cn, formatDateTime, exportToCSV } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'

const ACTION_TYPES = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW'] as const

const actionConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  CREATE: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  UPDATE: { icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100' },
  DELETE: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  LOGIN: { icon: LogIn, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  LOGOUT: { icon: LogOut, color: 'text-gray-600', bg: 'bg-gray-100' },
  VIEW: { icon: Eye, color: 'text-purple-600', bg: 'bg-purple-100' },
}

const MODULES = ['ALL', 'ADMISSIONS', 'ATTENDANCE', 'FEE', 'EXAMINATION', 'HOSTEL', 'LIBRARY', 'TRANSPORT', 'HELPDESK', 'ANNOUNCEMENTS', 'EMPLOYEES', 'STUDENTS', 'AUTH', 'SYSTEM'] as const

export function AuditLog() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [moduleFilter, setModuleFilter] = useState('ALL')

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams()
    params.set('limit', '100')
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    if (actionFilter !== 'ALL') params.set('action', actionFilter)
    if (moduleFilter !== 'ALL') params.set('module', moduleFilter)
    return `/audit-logs?${params.toString()}`
  }, [fromDate, toDate, actionFilter, moduleFilter])

  const { data, loading, refetch } = useApi(buildUrl(), [fromDate, toDate, actionFilter, moduleFilter])

  const items = data?.items || []
  const stats = data?.stats || { total: 0, today: 0, activeUsers: 0, failedLogins: 0 }

  const handleExport = () => {
    if (!items.length) return
    const rows = items.map((item: any) => ({
      Timestamp: formatDateTime(item.timestamp),
      User: item.user?.fullName || item.user?.email || 'Unknown',
      Action: item.action,
      Module: item.module,
      Details: item.details || '',
      'IP Address': item.ipAddress || '',
    }))
    exportToCSV(rows, `audit-log-${new Date().toISOString().split('T')[0]}`)
  }

  const getActionBadge = (action: string) => {
    const config = actionConfig[action] || { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100' }
    const Icon = config.icon
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
        <Icon className="w-3.5 h-3.5" />
        {action}
      </span>
    )
  }

  if (loading && !items.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading audit logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500">Track all system activities and user actions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={!items.length}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Download className="w-4 h-4" />Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Activities</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
              <p className="text-xs text-gray-500">Today's Activities</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
              <p className="text-xs text-gray-500">Active Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.failedLogins}</p>
              <p className="text-xs text-gray-500">Failed Logins</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Action Type</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ACTION_TYPES.map((a) => (
                <option key={a} value={a}>{a === 'ALL' ? 'All Actions' : a}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Module</label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {MODULES.map((m) => (
                <option key={m} value={m}>{m === 'ALL' ? 'All Modules' : m.charAt(0) + m.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Module</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                    No audit logs found for the selected filters.
                  </td>
                </tr>
              ) : (
                items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {formatDateTime(item.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.user?.fullName || 'Unknown'}</p>
                        {item.user?.email && (
                          <p className="text-xs text-gray-500">{item.user.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getActionBadge(item.action)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.module || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" title={item.details}>
                      {item.details || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                      {item.ipAddress || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AuditLog

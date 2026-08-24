import { Activity, AlertTriangle, CheckCircle, XCircle, Info, DollarSign, Calendar, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

const activityColors: Record<string, string> = {
  success: 'bg-green-100 text-green-600',
  finance: 'bg-blue-100 text-blue-600',
  info: 'bg-purple-100 text-purple-600',
  warning: 'bg-orange-100 text-orange-600',
  error: 'bg-red-100 text-red-600',
  default: 'bg-gray-100 text-gray-600',
}

const alertIcons: Record<string, any> = {
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  success: CheckCircle,
}

const alertColors: Record<string, string> = {
  warning: 'border-l-yellow-500 bg-yellow-50',
  error: 'border-l-red-500 bg-red-50',
  info: 'border-l-blue-500 bg-blue-50',
  success: 'border-l-green-500 bg-green-50',
}

interface ActivityItem {
  id: string
  action: string
  entity: string
  createdAt: string
  user?: { fullName: string }
}

interface RecentActivityProps {
  data?: ActivityItem[]
}

export function RecentActivity({ data = [] }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Live Activity Feed</h3>
      </div>
      <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
        {data.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">No recent activity</div>
        ) : (
          data.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', activityColors[activity.entity?.toLowerCase()] || activityColors.default)}>
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.user?.fullName || 'System'}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {new Date(activity.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

interface PendingAction {
  title: string
  count: number
  type: string
  href: string
  color: string
  bg: string
}

interface PendingActionCenterProps {
  data?: PendingAction[]
}

const pendingIcons: Record<string, any> = {
  admissions: CheckCircle,
  fees: DollarSign,
  leave: Calendar,
  refunds: DollarSign,
  documents: FileText,
  helpdesk: AlertTriangle,
  workflow: FileText,
}

export function PendingActionCenter({ data = [] }: PendingActionCenterProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Pending Action Center</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {data.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">No pending actions</div>
        ) : (
          data.map((action, i) => {
            const Icon = pendingIcons[action.type] || CheckCircle
            return (
              <Link key={i} to={action.href} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', action.bg)}>
                  <Icon className={cn('w-4 h-4', action.color)} />
                </div>
                <span className="text-sm text-gray-700 flex-1">{action.title}</span>
                <span className="text-xs text-gray-400">View</span>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

interface SmartAlert {
  type: 'warning' | 'error' | 'info' | 'success'
  message: string
}

interface SmartAlertsProps {
  data?: SmartAlert[]
}

export function SmartAlerts({ data = [] }: SmartAlertsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Smart Alerts</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {data.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">No alerts</div>
        ) : (
          data.map((alert, i) => {
            const Icon = alertIcons[alert.type] || Info
            return (
              <div key={i} className={cn('flex items-center gap-3 px-5 py-3 border-l-4', alertColors[alert.type] || alertColors.info)}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-sm text-gray-700">{alert.message}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

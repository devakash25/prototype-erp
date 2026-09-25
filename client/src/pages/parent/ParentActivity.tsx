import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import {
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  FileText,
  IndianRupee,
  MessageSquare,
  Clock,
  User,
  Award,
  Calendar,
} from 'lucide-react'

function getActivityIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'attendance':
      return { icon: CheckCircle2, color: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' }
    case 'assignment':
      return { icon: FileText, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' }
    case 'exam':
      return { icon: Award, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400' }
    case 'fee':
      return { icon: IndianRupee, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400' }
    case 'remark':
      return { icon: MessageSquare, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30 dark:text-cyan-400' }
    case 'library':
      return { icon: BookOpen, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400' }
    case 'event':
      return { icon: Calendar, color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400' }
    default:
      return { icon: Clock, color: 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400' }
  }
}

function getDateGroup(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - 7)

  if (date >= today) return 'Today'
  if (date >= yesterday) return 'Yesterday'
  if (date >= weekStart) return 'This Week'
  return 'Earlier'
}

export function ParentActivity() {
  const [searchParams] = useSearchParams()
  const childId = searchParams.get('childId') || ''

  const { data: activityData, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-activity', childId],
    queryFn: async () => {
      const res = await api.get(`/parent/activity?childId=${childId}`)
      return res.data?.data ?? res.data
    },
    enabled: !!childId,
  })

  if (!childId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-lg text-gray-500 dark:text-gray-400">Select a child to view activity</p>
        </div>
      </div>
    )
  }

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
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600 dark:text-gray-400">Failed to load activity</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const activities = activityData?.activities || []

  // Group by date
  const grouped: Record<string, any[]> = {}
  activities.forEach((activity: any) => {
    const group = getDateGroup(activity.timestamp || activity.createdAt)
    if (!grouped[group]) grouped[group] = []
    grouped[group].push(activity)
  })

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Earlier']
  const sortedGroups = groupOrder.filter((g) => grouped[g]?.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Timeline</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Chronological feed of student activities</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center py-16">
          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-lg text-gray-500 dark:text-gray-400">No activities recorded yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedGroups.map((group) => (
            <div key={group}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {group}
                </h2>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="space-y-3">
                {grouped[group].map((activity: any, idx: number) => {
                  const { icon: ActivityIcon, color } = getActivityIcon(activity.type)
                  const timestamp = activity.timestamp || activity.createdAt
                  const timeStr = timestamp
                    ? new Date(timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''

                  return (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg shrink-0 ${color}`}>
                          <ActivityIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 dark:text-white">{activity.title}</h3>
                            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-2">{timeStr}</span>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activity.description}</p>
                          )}
                          {activity.type && (
                            <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full capitalize">
                              {activity.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

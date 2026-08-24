import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { Clock, LogIn, LogOut, AlertTriangle, CheckCircle } from 'lucide-react'

export function HostelActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['hostel-activities'],
    queryFn: () => api.get('/hostel/activities').then(r => r.data),
  })

  const iconMap: any = { 'check-in': LogIn, 'check-out': LogOut, 'complaint': AlertTriangle, 'resolved': CheckCircle, 'allocation': Clock }
  const colorMap: any = { 'check-in': 'text-green-600 bg-green-100 dark:bg-green-900/30', 'check-out': 'text-red-600 bg-red-100 dark:bg-red-900/30', 'complaint': 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', 'resolved': 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', 'allocation': 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' }

  const groupByDate = (items: any[]) => {
    const groups: Record<string, any[]> = {}
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    const weekAgo = new Date(Date.now() - 7 * 86400000)
    items.forEach((item: any) => {
      const d = new Date(item.createdAt).toDateString()
      let label = 'Earlier'
      if (d === today) label = 'Today'
      else if (d === yesterday) label = 'Yesterday'
      else if (new Date(d) > weekAgo) label = 'This Week'
      if (!groups[label]) groups[label] = []
      groups[label].push(item)
    })
    return groups
  }

  const grouped = groupByDate(activities || [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><Clock className="w-6 h-6" /> Activity Timeline</h1>

      {isLoading ? <p className="text-gray-400">Loading...</p> : (activities || []).length === 0 ? (
        <p className="text-gray-400 text-center py-8">No activities found</p>
      ) : (
        Object.entries(grouped).map(([label, items]) => (
          <div key={label}>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{label}</h3>
            <div className="space-y-3 ml-4 border-l-2 dark:border-gray-700 pl-4">
              {items.map((a: any, i: number) => {
                const type = a.type || 'allocation'
                const Icon = iconMap[type] || Clock
                return (
                  <div key={i} className="relative">
                    <div className={`absolute -left-[21px] w-4 h-4 rounded-full flex items-center justify-center ${colorMap[type] || 'bg-gray-100'}`}>
                      <Icon className="w-2.5 h-2.5" />
                    </div>
                    <div className="p-3 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium dark:text-white">{a.title || a.action || 'Activity'}</p>
                        <span className="text-xs text-gray-400">{a.createdAt ? new Date(a.createdAt).toLocaleTimeString() : ''}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{a.description || a.details || ''}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

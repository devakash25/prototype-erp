import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { BarChart3 } from 'lucide-react'

export function HostelAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['hostel-analytics'],
    queryFn: () => api.get('/hostel/analytics').then(r => r.data),
  })

  if (isLoading) return <p className="text-gray-400 p-8">Loading analytics...</p>

  const maxOcc = Math.max(...(analytics?.occupancyByHostel?.map((h: any) => h.capacity) || [1]))
  const maxComplaints = Math.max(...(analytics?.complaintsByCategory?.map((c: any) => c.count) || [1]))

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><BarChart3 className="w-6 h-6" /> Hostel Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-medium dark:text-white mb-4">Occupancy by Hostel</h3>
          <div className="space-y-4">
            {(analytics?.occupancyByHostel || []).map((h: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="dark:text-gray-300">{h.name}</span>
                  <span className="dark:text-gray-400">{h.occupied}/{h.capacity} ({Math.round((h.occupied / h.capacity) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className={`rounded-full h-3 ${(h.occupied / h.capacity) > 0.9 ? 'bg-red-500' : (h.occupied / h.capacity) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${(h.occupied / h.capacity) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-medium dark:text-white mb-4">Complaints by Category</h3>
          <div className="flex items-end gap-2 h-40">
            {(analytics?.complaintsByCategory || []).map((c: any, i: number) => {
              const colors = ['bg-red-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-pink-500', 'bg-teal-500']
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs dark:text-gray-400">{c.count}</span>
                  <div className={`w-full ${colors[i % colors.length]} rounded-t`} style={{ height: `${(c.count / maxComplaints) * 100}%`, minHeight: '4px' }} />
                  <span className="text-[10px] dark:text-gray-500 capitalize">{c.category}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-medium dark:text-white mb-4">Complaints Trend</h3>
          <div className="flex items-end gap-2 h-40">
            {(analytics?.complaintsByMonth || []).map((m: any, i: number) => {
              const max = Math.max(...(analytics?.complaintsByMonth?.map((x: any) => x.count) || [1]))
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs dark:text-gray-400">{m.count}</span>
                  <div className="w-full bg-orange-500 rounded-t" style={{ height: `${(m.count / max) * 100}%`, minHeight: '4px' }} />
                  <span className="text-[10px] dark:text-gray-500">{m.month}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-medium dark:text-white mb-4">Check-in / Check-out Trend</h3>
          <div className="flex items-end gap-1 h-40">
            {(analytics?.checkInCheckOutTrend || []).slice(-14).map((d: any, i: number) => {
              const max = Math.max(...(analytics?.checkInCheckOutTrend?.map((x: any) => Math.max(x.checkIns, x.checkOuts)) || [1]))
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full flex gap-0.5 items-end" style={{ height: '100%' }}>
                    <div className="flex-1 bg-green-500 rounded-t" style={{ height: `${(d.checkIns / max) * 100}%`, minHeight: '2px' }} />
                    <div className="flex-1 bg-red-500 rounded-t" style={{ height: `${(d.checkOuts / max) * 100}%`, minHeight: '2px' }} />
                  </div>
                  <span className="text-[9px] dark:text-gray-500">{d.date?.slice(5)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 mt-2 text-xs"><span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded" /> Check-ins</span><span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded" /> Check-outs</span></div>
        </div>
      </div>
    </div>
  )
}

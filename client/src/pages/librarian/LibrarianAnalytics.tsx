import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { BarChart3 } from 'lucide-react'

export function LibrarianAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['lib-analytics'],
    queryFn: () => api.get('/librarian/analytics').then(r => r.data),
  })

  if (isLoading) return <p className="text-gray-400 p-8">Loading analytics...</p>

  const maxIssues = Math.max(...(analytics?.issuesByMonth?.map((m: any) => m.count) || [1]))
  const maxReturns = Math.max(...(analytics?.returnsByMonth?.map((m: any) => m.count) || [1]))

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><BarChart3 className="w-6 h-6" /> Library Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-medium dark:text-white mb-4">Issues by Month</h3>
          <div className="flex items-end gap-2 h-40">
            {(analytics?.issuesByMonth || []).map((m: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs dark:text-gray-400">{m.count}</span>
                <div className="w-full bg-indigo-500 rounded-t" style={{ height: `${(m.count / maxIssues) * 100}%`, minHeight: '4px' }} />
                <span className="text-[10px] dark:text-gray-500">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-medium dark:text-white mb-4">Returns by Month</h3>
          <div className="flex items-end gap-2 h-40">
            {(analytics?.returnsByMonth || []).map((m: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs dark:text-gray-400">{m.count}</span>
                <div className="w-full bg-green-500 rounded-t" style={{ height: `${(m.count / maxReturns) * 100}%`, minHeight: '4px' }} />
                <span className="text-[10px] dark:text-gray-500">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-medium dark:text-white mb-4">Popular Books</h3>
          <div className="space-y-2">
            {(analytics?.popularBooks || []).slice(0, 10).map((b: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-5">{i + 1}.</span>
                <div className="flex-1">
                  <p className="text-sm dark:text-white">{b.title}</p>
                  <p className="text-xs text-gray-500">{b.author}</p>
                </div>
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">{b.issueCount} issues</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-medium dark:text-white mb-4">Category Distribution</h3>
          <div className="space-y-3">
            {(analytics?.categoryDistribution || []).map((c: any, i: number) => {
              const maxCount = Math.max(...(analytics?.categoryDistribution?.map((x: any) => x.count) || [1]))
              const colors = ['bg-indigo-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500', 'bg-red-500']
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="dark:text-gray-300">{c.category}</span>
                    <span className="dark:text-gray-400">{c.count} books</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className={`${colors[i % colors.length]} rounded-full h-2`} style={{ width: `${(c.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

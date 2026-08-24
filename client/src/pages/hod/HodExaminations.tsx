import { useApi } from '@/hooks/useApi'
import { RefreshCw, Award, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HodExaminations() {
  const { data, loading, error, refetch } = useApi<any>('/hod/examinations')
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-4"><p className="text-red-500">{error}</p><button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button></div>
  const d = data || {}
  const stats = [
    { label: 'Active Exams', value: d.active || 0, icon: Clock, color: 'blue' },
    { label: 'Upcoming', value: d.upcoming || 0, icon: TrendingUp, color: 'yellow' },
    { label: 'Completed', value: d.completed || 0, icon: Award, color: 'green' },
    { label: 'Pass Rate', value: `${d.passRate || 0}%`, icon: TrendingUp, color: 'purple' },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Examinations</h1><p className="text-gray-500 text-sm">Department examination status</p></div>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2"><div className={cn('p-2 rounded-lg', s.color === 'blue' ? 'bg-blue-50' : s.color === 'yellow' ? 'bg-yellow-50' : s.color === 'green' ? 'bg-green-50' : 'bg-purple-50')}><s.icon className={cn('w-5 h-5', s.color === 'blue' ? 'text-blue-600' : s.color === 'yellow' ? 'text-yellow-600' : s.color === 'green' ? 'text-green-600' : 'text-purple-600')} /></div><p className="text-sm text-gray-500">{s.label}</p></div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200"><h2 className="font-semibold text-gray-900">Exam List</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50"><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Results</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pass Rate</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {(d.exams || []).map((e: any) => {
                const pr = e.totalResults > 0 ? Math.round((e.passedResults / e.totalResults) * 100) : 0
                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.name}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700">{e.type}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(e.startDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(e.endDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{e.totalResults}</td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden"><div className={cn('h-full rounded-full', pr >= 60 ? 'bg-green-500' : 'bg-red-500')} style={{ width: `${pr}%` }} /></div><span className="text-sm font-medium">{pr}%</span></div></td>
                  </tr>
                )
              })}
              {(!d.exams || d.exams.length === 0) && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No exams found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

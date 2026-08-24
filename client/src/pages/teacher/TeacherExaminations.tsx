import { useApi } from '@/hooks/useApi'
import { RefreshCw, Award, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TeacherExaminations() {
  const { data, loading, error, refetch } = useApi<any[]>('/teacher/examinations')
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-4"><p className="text-red-500">{error}</p><button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button></div>
  const exams = data || []
  const totalEntered = exams.reduce((s: number, e: any) => s + e.entered, 0)
  const totalPending = exams.reduce((s: number, e: any) => s + e.pending, 0)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Examinations</h1><p className="text-gray-500 text-sm">Exam status for assigned subjects</p></div>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5"><p className="text-sm text-gray-500">Total Exams</p><p className="text-2xl font-bold text-gray-900">{exams.length}</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><p className="text-sm text-gray-500">Entered</p><p className="text-2xl font-bold text-green-600">{totalEntered}</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-amber-600">{totalPending}</p></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50"><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entered</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pass Rate</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {exams.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.name}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700">{e.type}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(e.startDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(e.endDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-green-600 font-medium">{e.entered}</td>
                  <td className="px-6 py-4 text-sm text-amber-600 font-medium">{e.pending}</td>
                  <td className="px-6 py-4"><span className={cn('text-sm font-medium', e.passRate >= 60 ? 'text-green-600' : 'text-red-600')}>{e.passRate}%</span></td>
                </tr>
              ))}
              {exams.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No exams found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

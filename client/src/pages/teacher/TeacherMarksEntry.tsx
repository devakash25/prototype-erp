import { useApi } from '@/hooks/useApi'
import { RefreshCw, ClipboardCheck, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TeacherMarksEntry() {
  const { data, loading, error, refetch } = useApi<any[]>('/teacher/marks-entry')
  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-4"><p className="text-red-500">{error}</p><button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button></div>
  const exams = data || []
  const totalEntries = exams.reduce((s: number, e: any) => s + e.totalResults, 0)
  const entered = exams.reduce((s: number, e: any) => s + e.entered, 0)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Marks Entry</h1><p className="text-gray-500 text-sm">Monitor marks entry progress</p></div>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5"><p className="text-sm text-gray-500">Total Exams</p><p className="text-2xl font-bold text-gray-900">{exams.length}</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><p className="text-sm text-gray-500">Entries Completed</p><p className="text-2xl font-bold text-green-600">{entered}</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><p className="text-sm text-gray-500">Pending Entries</p><p className="text-2xl font-bold text-red-600">{totalEntries - entered}</p></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {exams.map((e: any) => (
            <div key={e.id} className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <div><p className="font-medium text-gray-900">{e.name}</p><p className="text-xs text-gray-500">{e.entered}/{e.totalResults} entries</p></div>
                <span className={cn('text-sm font-semibold', e.entryRate === 100 ? 'text-green-600' : 'text-amber-600')}>{e.entryRate}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full', e.entryRate === 100 ? 'bg-green-500' : e.entryRate >= 50 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${e.entryRate}%` }} />
              </div>
            </div>
          ))}
          {exams.length === 0 && <div className="px-6 py-12 text-center text-gray-500 flex flex-col items-center gap-2"><AlertCircle className="w-8 h-8" /><p>No exams found</p></div>}
        </div>
      </div>
    </div>
  )
}

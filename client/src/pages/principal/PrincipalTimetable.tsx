import { RefreshCw, Clock, AlertCircle } from 'lucide-react'
import { useApi } from '@/hooks/useApi'

export function PrincipalTimetable() {
  const { data, loading, error, refetch } = useApi('/principal/timetable')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-slate-400">{error}</p>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Timetable</h1>
          <p className="text-slate-400 text-sm">Today's class schedule & room utilization</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Today's Schedule ({data?.totalEntries || 0} entries)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 font-medium text-slate-400">Time</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Class</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Teacher</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Room</th>
              </tr>
            </thead>
            <tbody>
              {(data?.entries || []).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Clock className="w-10 h-10 text-slate-600" />
                      <p className="text-slate-500">No timetable entries for today</p>
                    </div>
                  </td>
                </tr>
              )}
              {(data?.entries || []).map((e: any, i: number) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-4 text-slate-400">
                    {e.startTime} - {e.endTime}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">{e.className}</td>
                  <td className="py-3 px-4 text-slate-400">{e.subject?.name || '—'}</td>
                  <td className="py-3 px-4 text-slate-400">{e.employee?.user?.fullName || '—'}</td>
                  <td className="py-3 px-4 text-slate-400">{e.room || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

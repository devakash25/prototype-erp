import { RefreshCw, Building2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'

export function PrincipalDepartments() {
  const { data: departments, loading, error, refetch } = useApi('/principal/departments')

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
          <h1 className="text-2xl font-bold text-white">Departments</h1>
          <p className="text-slate-400 text-sm">Department-wise attendance & faculty overview</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(departments || []).length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 gap-4">
            <Building2 className="w-12 h-12 text-slate-600" />
            <p className="text-slate-500">No departments found</p>
          </div>
        )}
        {(departments || []).map((d: any) => (
          <div
            key={d.id}
            className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors"
          >
            <h3 className="font-semibold text-white mb-1">{d.name}</h3>
            <p className="text-xs text-slate-500 mb-3">{d.code}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-lg font-bold text-white">{d.students}</p>
                <p className="text-xs text-indigo-400">Students</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-lg font-bold text-white">{d.faculty}</p>
                <p className="text-xs text-green-400">Faculty</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Attendance</span>
                <span className="font-medium text-white">{d.attendanceRate}%</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    d.attendanceRate >= 75 ? 'bg-green-500' : 'bg-red-500'
                  )}
                  style={{ width: `${d.attendanceRate}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

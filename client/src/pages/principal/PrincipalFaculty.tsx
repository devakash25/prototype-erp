import { RefreshCw, Users, CheckCircle, AlertTriangle, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function PrincipalFaculty() {
  const { data: faculty, loading, error, refetch } = useApi('/principal/faculty')

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

  const chartData = (faculty?.faculty || []).map((f: any) => ({
    name: f.name?.split(' ')[0] || 'N/A',
    score: f.performanceScore || 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Faculty Status</h1>
          <p className="text-slate-400 text-sm">Daily faculty attendance & workload</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{faculty?.total || 0}</p>
              <p className="text-xs text-slate-500">Total Faculty</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{faculty?.present || 0}</p>
              <p className="text-xs text-slate-500">Present</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{faculty?.absent || 0}</p>
              <p className="text-xs text-slate-500">Absent</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{faculty?.onLeave || 0}</p>
              <p className="text-xs text-slate-500">On Leave</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Performance Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">All Faculty</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 font-medium text-slate-400">Name</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Designation</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Today</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Classes</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Leaves</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Score</th>
              </tr>
            </thead>
            <tbody>
              {(faculty?.faculty || []).length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No faculty found</td>
                </tr>
              )}
              {(faculty?.faculty || []).map((f: any, i: number) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-4 font-medium text-white">{f.name}</td>
                  <td className="py-3 px-4 text-slate-400">{f.designation}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        f.todayStatus === 'PRESENT'
                          ? 'bg-green-500/20 text-green-400'
                          : f.todayStatus === 'ABSENT'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      )}
                    >
                      {f.todayStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400">{f.classesToday}</td>
                  <td className="py-3 px-4 text-center">
                    {f.pendingLeaves > 0 ? (
                      <span className="text-orange-400 font-medium">{f.pendingLeaves}</span>
                    ) : (
                      <span className="text-slate-500">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-white">{f.performanceScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { RefreshCw, Star, TrendingUp, AlertCircle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function PrincipalPerformance() {
  const { data: faculty, loading, error, refetch } = useApi<any>('/principal/faculty')

  const sortedFaculty = [...(faculty?.faculty || [])].sort(
    (a: any, b: any) => b.performanceScore - a.performanceScore
  )

  const barData = sortedFaculty.map((f: any) => ({
    name: f.name.split(' ').slice(0, 2).join(' '),
    score: f.performanceScore || 0,
  }))

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
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-slate-400 text-sm">{error}</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4" />Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Faculty Performance</h1>
          <p className="text-slate-400 text-sm">Performance scores & comparison across departments</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {barData.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Performance Comparison</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc' }}
                formatter={(value: number) => [`${value}%`, 'Score']}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {barData.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Performance Rankings</h2>
        <div className="space-y-3">
          {sortedFaculty.map((f: any, i: number) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
              <span className="text-lg font-bold text-slate-500 w-6 text-center">{i + 1}</span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                {f.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{f.name}</p>
                <p className="text-xs text-slate-500">{f.designation}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-indigo-400">{f.performanceScore}%</p>
                <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${f.performanceScore}%` }} />
                </div>
              </div>
            </div>
          ))}
          {sortedFaculty.length === 0 && (
            <p className="text-center text-slate-500 py-8">No faculty data available</p>
          )}
        </div>
      </div>
    </div>
  )
}

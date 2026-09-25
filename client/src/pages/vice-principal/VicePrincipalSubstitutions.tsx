import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import {
  RefreshCw,
  ArrowLeftRight,
  UserX,
  Calendar,
  BookOpen,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function VicePrincipalSubstitutions() {
  const [searchParams] = useSearchParams()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vice-principal-substitutions'],
    queryFn: async () => {
      const res = await api.get('/vice-principal/substitutions')
      return res.data?.data ?? res.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-400">Failed to load substitution data</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const d = data || {}
  const substitutions = d.substitutions || d || []
  const summary = d.summary || {}

  const todayCount = summary.todaySubstitutions ?? substitutions.filter((s: any) => {
    if (!s.date) return false
    const today = new Date().toISOString().split('T')[0]
    return s.date.startsWith(today)
  }).length

  const totalThisWeek = summary.thisWeekSubstitutions ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Teacher Substitutions</h1>
          <p className="text-slate-400 text-sm">Track and manage teacher substitution assignments</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-900/30 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-400">{todayCount}</p>
              <p className="text-xs text-slate-400">Today's Substitutions</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{totalThisWeek}</p>
              <p className="text-xs text-slate-400">This Week</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-900/30 flex items-center justify-center">
              <UserX className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400">{substitutions.length}</p>
              <p className="text-xs text-slate-400">Total Records</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-cyan-400" /> Substitution Records
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 font-medium text-slate-400">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Absent Teacher</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Substitute Teacher</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-slate-400">Class</th>
                <th className="text-center py-3 px-4 font-medium text-slate-400">Period</th>
              </tr>
            </thead>
            <tbody>
              {substitutions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No substitution records found
                  </td>
                </tr>
              ) : (
                substitutions.map((sub: any, idx: number) => (
                  <tr key={sub.id || idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {sub.date ? new Date(sub.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {sub.absentTeacher || sub.absentTeacherName || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {sub.substituteTeacher || sub.substituteTeacherName || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        {sub.subject || sub.subjectName || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {sub.className || sub.class?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 bg-slate-700 rounded-full text-xs font-medium text-slate-300">
                        {sub.period ?? '—'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default VicePrincipalSubstitutions

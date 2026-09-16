import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  AlertCircle,
  Trophy,
  Medal,
  Award,
  TrendingUp,
} from 'lucide-react'

export function ExamControllerMeritList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['exam-controller-merit-list'],
    queryFn: async () => {
      const res = await api.get('/exam-controller/merit-list')
      return res.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-300">Failed to load merit list</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const meritList = data?.data || data || []

  const topper = meritList[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Merit List</h1>
          <p className="text-slate-400 text-sm">Top performing students ranked by total marks</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Topper Highlight */}
      {topper && (
        <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-yellow-500/10 rounded-2xl border border-yellow-500/30 p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-yellow-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                <span className="text-sm font-bold text-black">#1</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-yellow-400 font-medium mb-1">Top Ranker</p>
              <h2 className="text-2xl font-bold text-white">{topper.studentName || topper.name || '—'}</h2>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-slate-300">{topper.className || toper.class || '—'}</span>
                <span className="text-slate-600">|</span>
                <span className="text-sm text-slate-300">Roll: {topper.rollNumber || topper.enrollmentNumber || '—'}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-yellow-400">{topper.totalMarks || topper.marks || 0}</p>
              <p className="text-sm text-slate-400">Total Marks</p>
              <p className="text-lg font-semibold text-green-400 mt-1">{topper.percentage || 0}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Trophy className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Students</p>
              <p className="text-2xl font-bold text-white">{meritList.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Average Percentage</p>
              <p className="text-2xl font-bold text-white">
                {meritList.length > 0
                  ? Math.round(meritList.reduce((s: number, m: any) => s + (m.percentage || 0), 0) / meritList.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Award className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Highest Percentage</p>
              <p className="text-2xl font-bold text-white">
                {topper?.percentage || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Merit List Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase w-20">Rank</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Student Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Roll Number</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Class</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Total Marks</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {meritList.map((student: any, idx: number) => {
                const rank = student.rank || idx + 1
                const pct = student.percentage || 0
                return (
                  <tr
                    key={student.id || idx}
                    className={cn(
                      'hover:bg-slate-700/50 transition-colors',
                      rank === 1 && 'bg-yellow-500/5',
                      rank === 2 && 'bg-slate-400/5',
                      rank === 3 && 'bg-orange-500/5'
                    )}
                  >
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center">
                        {rank <= 3 ? (
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center',
                              rank === 1 && 'bg-yellow-500',
                              rank === 2 && 'bg-slate-400',
                              rank === 3 && 'bg-orange-500'
                            )}
                          >
                            <span className="text-sm font-bold text-black">{rank}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-slate-400">{rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {rank <= 3 && (
                          <Medal
                            className={cn(
                              'h-4 w-4',
                              rank === 1 && 'text-yellow-400',
                              rank === 2 && 'text-slate-400',
                              rank === 3 && 'text-orange-400'
                            )}
                          />
                        )}
                        <span className="text-sm font-medium text-white">
                          {student.studentName || student.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300">
                      {student.rollNumber || student.enrollmentNumber || '—'}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300">
                      {student.className || student.class || '—'}
                    </td>
                    <td className="px-4 py-4 text-sm text-white text-center font-semibold">
                      {student.totalMarks || student.marks || 0}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            )}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            pct >= 80 ? 'text-green-400' : pct >= 60 ? 'text-yellow-400' : 'text-red-400'
                          )}
                        >
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {meritList.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Trophy className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                    No merit list available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

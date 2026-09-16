import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw, AlertCircle, FileText, CalendarDays, BookOpen,
  CheckCircle2, Clock, MapPin, ChevronUp, ChevronDown,
} from 'lucide-react'

export function StudentExams() {
  const { data: exams, loading, error, refetch } = useApi<any[]>('/student/examinations')
  const [expandedExam, setExpandedExam] = useState<number | null>(null)

  const toggleExam = (idx: number) => {
    setExpandedExam(prev => (prev === idx ? null : idx))
  }

  const getExamStatus = (exam: any) => {
    const now = new Date()
    const start = new Date(exam.startDate)
    const end = new Date(exam.endDate)
    if (now > end) return { label: 'Completed', color: 'text-slate-400', bg: 'bg-slate-500/15' }
    if (now >= start && now <= end) return { label: 'Ongoing', color: 'text-green-400', bg: 'bg-green-500/15' }
    return { label: 'Upcoming', color: 'text-blue-400', bg: 'bg-blue-500/15' }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-300">Failed to load examinations</p>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Examinations</h1>
          <p className="text-slate-400 text-sm">View exam schedule and details</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="space-y-3">
                <div className="h-5 w-3/4 bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : !exams?.length ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 text-center py-16 text-slate-400">
          <FileText className="h-12 w-12 mx-auto mb-3 text-slate-600" />
          <p className="text-lg">No examinations found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam: any, idx: number) => {
            const isExpanded = expandedExam === idx
            const status = getExamStatus(exam)

            return (
              <div key={exam.id || idx} className={cn(
                'bg-slate-800 rounded-xl border shadow-sm overflow-hidden transition-all duration-300',
                isExpanded ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : 'border-slate-700 hover:border-slate-600'
              )}>
                <button
                  onClick={() => toggleExam(idx)}
                  className="w-full p-5 text-left flex items-center gap-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold',
                      exam.type === 'INTERNAL' && 'bg-blue-500/15 text-blue-400',
                      exam.type === 'MIDTERM' && 'bg-amber-500/15 text-amber-400',
                      exam.type === 'EXTERNAL' && 'bg-purple-500/15 text-purple-400',
                      exam.type === 'FINAL' && 'bg-red-500/15 text-red-400',
                      !['INTERNAL', 'MIDTERM', 'EXTERNAL', 'FINAL'].includes(exam.type) && 'bg-slate-500/15 text-slate-400',
                    )}>
                      {exam.type?.slice(0, 2) || 'EX'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white text-lg">{exam.name}</h3>
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', status.bg, status.color)}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
                        exam.type === 'INTERNAL' && 'bg-blue-500/10 text-blue-400',
                        exam.type === 'MIDTERM' && 'bg-amber-500/10 text-amber-400',
                        exam.type === 'EXTERNAL' && 'bg-purple-500/10 text-purple-400',
                        exam.type === 'FINAL' && 'bg-red-500/10 text-red-400',
                      )}>
                        {exam.type}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(exam.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {' — '}
                        {new Date(exam.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      {exam.result && (
                        <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Result Published
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-400">Max Marks</p>
                      <p className="text-sm font-semibold text-white">{exam.totalMarks}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-700 bg-slate-900/50">
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <BookOpen className="h-4 w-4" />
                          <span>{exam.subjects?.length || 0} subjects</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>Passing: {exam.passingMarks}/{exam.totalMarks}</span>
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-700 bg-slate-700/50">
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">#</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Subject</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Code</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Max Marks</th>
                              {exam.result && <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Marks</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                            {exam.subjects?.map((s: any, sIdx: number) => (
                              <tr key={sIdx} className="hover:bg-slate-700/50">
                                <td className="px-4 py-3 text-sm text-slate-400 font-medium">{sIdx + 1}</td>
                                <td className="px-4 py-3 text-sm font-medium text-white">{s.name}</td>
                                <td className="px-4 py-3 text-sm text-slate-400">{s.code}</td>
                                <td className="px-4 py-3 text-sm text-slate-400 text-center">{s.marks}</td>
                                {exam.result && (
                                  <td className="px-4 py-3 text-sm text-center">
                                    <span className={cn('font-semibold', exam.result.isPassed ? 'text-green-400' : 'text-red-400')}>
                                      {exam.result.marksObtained ?? '—'}
                                    </span>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

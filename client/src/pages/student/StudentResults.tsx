import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw, AlertCircle, BarChart3, ChevronDown, ChevronUp,
  Download, FileText, CheckCircle2, XCircle,
} from 'lucide-react'

export function StudentResults() {
  const { data: apiData, loading, error, refetch } = useApi<any>('/student/results')
  const [expandedExam, setExpandedExam] = useState<number | null>(null)

  const results = apiData?.exams || []
  const cgpa = apiData?.cgpa || 0

  const toggleExam = (idx: number) => {
    setExpandedExam(prev => (prev === idx ? null : idx))
  }

  const getPercentage = (marks: number, total: number) => {
    if (!total) return 0
    return Math.round((marks / total) * 100)
  }

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A+', color: 'text-emerald-400', bg: 'bg-emerald-500/15' }
    if (pct >= 80) return { grade: 'A', color: 'text-green-400', bg: 'bg-green-500/15' }
    if (pct >= 70) return { grade: 'B+', color: 'text-blue-400', bg: 'bg-blue-500/15' }
    if (pct >= 60) return { grade: 'B', color: 'text-indigo-400', bg: 'bg-indigo-500/15' }
    if (pct >= 50) return { grade: 'C', color: 'text-yellow-400', bg: 'bg-yellow-500/15' }
    if (pct >= 40) return { grade: 'D', color: 'text-orange-400', bg: 'bg-orange-500/15' }
    return { grade: 'F', color: 'text-red-400', bg: 'bg-red-500/15' }
  }

  const downloadReportCard = (result: any, e: React.MouseEvent) => {
    e.stopPropagation()
    const totalMarks = result.totalMarks ?? 0
    const maxTotal = result.totalMax ?? 0
    const pct = getPercentage(totalMarks, maxTotal)

    let reportText = `REPORT CARD\n${'='.repeat(40)}\n`
    reportText += `Exam: ${result.name}\n`
    if (result.type) reportText += `Type: ${result.type}\n`
    reportText += `${'='.repeat(40)}\n\n`
    reportText += `${'Subject'.padEnd(20)} ${'Max'.padStart(5)} ${'Obtained'.padStart(9)} ${'Pct'.padStart(6)} ${'Grade'.padStart(6)}\n`
    reportText += `${'-'.repeat(50)}\n`

    result.subjects?.forEach((sub: any) => {
      const subPct = getPercentage(sub.marks ?? 0, sub.totalMarks ?? 0)
      const { grade } = getGrade(subPct)
      reportText += `${(sub.subject || sub.name || '').padEnd(20)} ${String(sub.totalMarks ?? 0).padStart(5)} ${String(sub.marks ?? 0).padStart(9)} ${(subPct + '%').padStart(6)} ${grade.padStart(6)}\n`
    })

    reportText += `${'-'.repeat(50)}\n`
    reportText += `${'TOTAL'.padEnd(20)} ${String(maxTotal).padStart(5)} ${String(totalMarks).padStart(9)} ${(pct + '%').padStart(6)}\n`
    reportText += `\nOverall: ${pct}%\n`
    if (cgpa) reportText += `CGPA: ${cgpa}\n`

    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-card-${(result.name || 'exam').replace(/\s+/g, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-300">Failed to load results</p>
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
          <h1 className="text-2xl font-bold text-white">Results</h1>
          <p className="text-slate-400 text-sm">Click an exam to view your report card</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {cgpa > 0 && (
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 p-5">
          <p className="text-sm text-slate-400">Cumulative GPA</p>
          <p className="text-3xl font-bold text-white">{cgpa}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="space-y-3">
                <div className="h-5 w-1/3 bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : !results.length ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 text-center py-16 text-slate-400">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 text-slate-600" />
          <p className="text-lg">No results available yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result: any, idx: number) => {
            const isExpanded = expandedExam === idx
            const totalMarks = result.totalMarks ?? 0
            const maxTotal = result.totalMax ?? 0
            const pct = getPercentage(totalMarks, maxTotal)
            const { grade, color, bg } = getGrade(pct)

            return (
              <div key={result.id || idx} className={cn(
                'bg-slate-800 rounded-xl border shadow-sm overflow-hidden transition-all duration-300',
                isExpanded ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : 'border-slate-700 hover:border-slate-600'
              )}>
                <button
                  onClick={() => toggleExam(idx)}
                  className="w-full p-5 text-left flex items-center gap-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center', bg)}>
                      <span className={cn('text-xl font-bold', color)}>{grade}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-lg">{result.name}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      {result.type && (
                        <span className="text-xs font-medium text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full capitalize">{result.type}</span>
                      )}
                      {result.subjects?.length > 0 && (
                        <span className="text-sm text-slate-400">• {result.subjects.length} subjects</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-slate-400">Score</p>
                      <p className={cn('text-lg font-bold', color)}>{totalMarks}/{maxTotal}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-slate-400">Percent</p>
                      <p className={cn('text-lg font-bold', color)}>{pct}%</p>
                    </div>
                    <button
                      onClick={(e) => downloadReportCard(result, e)}
                      className="p-2 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors"
                      title="Download Report Card"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && result.subjects?.length > 0 && (
                  <div className="border-t border-slate-700 bg-slate-900/50">
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-4 w-4 text-indigo-400" />
                        <h4 className="font-semibold text-slate-200">Report Card — {result.name}</h4>
                      </div>

                      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-700 bg-slate-700/50">
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">#</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Subject</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Max</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Obtained</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Grade</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                            {result.subjects.map((sub: any, sIdx: number) => {
                              const subPct = getPercentage(sub.marks ?? 0, sub.totalMarks ?? 0)
                              const subGrade = getGrade(subPct)
                              return (
                                <tr key={sIdx} className="hover:bg-slate-700/50">
                                  <td className="px-4 py-3 text-sm text-slate-400 font-medium">{sIdx + 1}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-white">{sub.subject || sub.name}</td>
                                  <td className="px-4 py-3 text-sm text-slate-400 text-center">{sub.totalMarks}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold',
                                      sub.isPassed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                    )}>
                                      {sub.marks}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold', subGrade.bg, subGrade.color)}>
                                      {subGrade.grade}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {sub.isPassed ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/15 text-green-400">
                                        <CheckCircle2 className="h-3 w-3" /> Pass
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/15 text-red-400">
                                        <XCircle className="h-3 w-3" /> Fail
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-3 bg-indigo-500/10 rounded-xl p-4 flex items-center justify-between border border-indigo-500/20">
                        <div>
                          <p className="text-sm font-medium text-indigo-400">Total Marks</p>
                          <p className="text-2xl font-bold text-white">{totalMarks} <span className="text-base font-normal text-slate-400">/ {maxTotal}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-indigo-400">Overall Percentage</p>
                          <p className={cn('text-2xl font-bold', color)}>{pct}%</p>
                        </div>
                        <button
                          onClick={(e) => downloadReportCard(result, e)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                        >
                          <Download className="h-4 w-4" /> Download
                        </button>
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

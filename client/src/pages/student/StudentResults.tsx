import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  AlertCircle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

const DUMMY_RESULTS = [
  {
    id: '1',
    examName: 'Unit Test 1',
    examType: 'INTERNAL',
    date: '2026-06-15',
    totalMarks: 300,
    totalMax: 500,
    percentage: 78,
    passed: true,
    subjects: [
      { subject: 'Mathematics', code: 'MATH101', marks: 85, totalMarks: 100, isPassed: true, grade: 'A' },
      { subject: 'Physics', code: 'PHY101', marks: 72, totalMarks: 100, isPassed: true, grade: 'B+' },
      { subject: 'Chemistry', code: 'CHEM101', marks: 68, totalMarks: 100, isPassed: true, grade: 'B+' },
      { subject: 'English', code: 'ENG101', marks: 42, totalMarks: 100, isPassed: true, grade: 'B' },
      { subject: 'Computer Science', code: 'CS101', marks: 33, totalMarks: 100, isPassed: true, grade: 'A+' },
    ],
  },
  {
    id: '2',
    examName: 'Mid Semester Examination',
    examType: 'MIDTERM',
    date: '2026-07-20',
    totalMarks: 410,
    totalMax: 500,
    percentage: 82,
    passed: true,
    subjects: [
      { subject: 'Mathematics', code: 'MATH101', marks: 90, totalMarks: 100, isPassed: true, grade: 'A+' },
      { subject: 'Physics', code: 'PHY101', marks: 82, totalMarks: 100, isPassed: true, grade: 'A' },
      { subject: 'Chemistry', code: 'CHEM101', marks: 78, totalMarks: 100, isPassed: true, grade: 'A' },
      { subject: 'English', code: 'ENG101', marks: 80, totalMarks: 100, isPassed: true, grade: 'A' },
      { subject: 'Computer Science', code: 'CS101', marks: 80, totalMarks: 100, isPassed: true, grade: 'A' },
    ],
  },
  {
    id: '3',
    examName: 'Pre-Final Examination',
    examType: 'EXTERNAL',
    date: '2026-08-05',
    totalMarks: 435,
    totalMax: 500,
    percentage: 87,
    passed: true,
    subjects: [
      { subject: 'Mathematics', code: 'MATH101', marks: 92, totalMarks: 100, isPassed: true, grade: 'A+' },
      { subject: 'Physics', code: 'PHY101', marks: 88, totalMarks: 100, isPassed: true, grade: 'A+' },
      { subject: 'Chemistry', code: 'CHEM101', marks: 85, totalMarks: 100, isPassed: true, grade: 'A' },
      { subject: 'English', code: 'ENG101', marks: 82, totalMarks: 100, isPassed: true, grade: 'A' },
      { subject: 'Computer Science', code: 'CS101', marks: 88, totalMarks: 100, isPassed: true, grade: 'A+' },
    ],
  },
]

export function StudentResults() {
  const [results, setResults] = useState<any[]>(DUMMY_RESULTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedExam, setExpandedExam] = useState<number | null>(null)

  const toggleExam = (idx: number) => {
    setExpandedExam(prev => (prev === idx ? null : idx))
  }

  const getPercentage = (marks: number, total: number) => {
    if (!total) return 0
    return Math.round((marks / total) * 100)
  }

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A+', color: 'text-emerald-600', bg: 'bg-emerald-50' }
    if (pct >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' }
    if (pct >= 70) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (pct >= 60) return { grade: 'B', color: 'text-indigo-600', bg: 'bg-indigo-50' }
    if (pct >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    if (pct >= 40) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const downloadReportCard = (result: any, e: React.MouseEvent) => {
    e.stopPropagation()
    const totalMarks = result.subjects?.reduce((sum: number, s: any) => sum + (s.marks ?? 0), 0) ?? 0
    const maxTotal = result.subjects?.reduce((sum: number, s: any) => sum + (s.totalMarks ?? 0), 0) ?? 0
    const pct = getPercentage(totalMarks, maxTotal)

    let reportText = `REPORT CARD\n`
    reportText += `${'='.repeat(40)}\n`
    reportText += `Exam: ${result.examName}\n`
    if (result.examType) reportText += `Type: ${result.examType}\n`
    if (result.date) reportText += `Date: ${new Date(result.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n`
    reportText += `${'='.repeat(40)}\n\n`
    reportText += `${'Subject'.padEnd(20)} ${'Max'.padStart(5)} ${'Obtained'.padStart(9)} ${'Pct'.padStart(6)} ${'Grade'.padStart(6)}\n`
    reportText += `${'-'.repeat(50)}\n`

    result.subjects?.forEach((sub: any) => {
      const subPct = getPercentage(sub.marks ?? 0, sub.totalMarks ?? 0)
      const { grade } = getGrade(subPct)
      reportText += `${sub.subject.padEnd(20)} ${String(sub.totalMarks ?? 0).padStart(5)} ${String(sub.marks ?? 0).padStart(9)} ${(subPct + '%').padStart(6)} ${grade.padStart(6)}\n`
    })

    reportText += `${'-'.repeat(50)}\n`
    reportText += `${'TOTAL'.padEnd(20)} ${String(maxTotal).padStart(5)} ${String(totalMarks).padStart(9)} ${(pct + '%').padStart(6)}\n`
    reportText += `\nOverall: ${pct}%\n`

    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-card-${result.examName?.replace(/\s+/g, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const refetch = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600">Failed to load results</p>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results</h1>
          <p className="text-gray-500 text-sm">Click an exam to view your report card</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="space-y-3">
                <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : !results.length ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm text-center py-16 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg">No results available yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result: any, idx: number) => {
            const isExpanded = expandedExam === idx
            const totalMarks = result.subjects?.reduce((sum: number, s: any) => sum + (s.marks ?? 0), 0) ?? 0
            const maxTotal = result.subjects?.reduce((sum: number, s: any) => sum + (s.totalMarks ?? 0), 0) ?? 0
            const pct = getPercentage(totalMarks, maxTotal)
            const { grade, color, bg } = getGrade(pct)

            return (
              <div key={idx} className={cn(
                'bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-300',
                isExpanded ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-200 hover:border-gray-300'
              )}>
                {/* Exam Header - Clickable */}
                <button
                  onClick={() => toggleExam(idx)}
                  className="w-full p-5 text-left flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center', bg)}>
                      <span className={cn('text-xl font-bold', color)}>{grade}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg">{result.examName}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      {result.examType && (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">{result.examType}</span>
                      )}
                      {result.date && (
                        <span className="text-sm text-gray-500">
                          {new Date(result.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {result.subjects?.length > 0 && (
                        <span className="text-sm text-gray-400">• {result.subjects.length} subjects</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-gray-500">Score</p>
                      <p className={cn('text-lg font-bold', color)}>{totalMarks}/{maxTotal}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-gray-500">Percent</p>
                      <p className={cn('text-lg font-bold', color)}>{pct}%</p>
                    </div>
                    <button
                      onClick={(e) => downloadReportCard(result, e)}
                      className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors"
                      title="Download Report Card"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Report Card */}
                {isExpanded && result.subjects?.length > 0 && (
                  <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
                    <div className="p-5">
                      {/* Report Card Header */}
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        <h4 className="font-semibold text-gray-800">Report Card — {result.examName}</h4>
                      </div>

                      {/* Subject Table */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Marks</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Percentage</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {result.subjects.map((sub: any, sIdx: number) => {
                              const subPct = getPercentage(sub.marks ?? 0, sub.totalMarks ?? 0)
                              const subGrade = getGrade(subPct)
                              return (
                                <tr key={sIdx} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-4 py-3 text-sm text-gray-400 font-medium">{sIdx + 1}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{sub.subject}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{sub.totalMarks}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={cn(
                                      'inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold',
                                      sub.isPassed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    )}>
                                      {sub.marks}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={cn('text-sm font-bold', subGrade.color)}>{subPct}%</span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold', subGrade.bg, subGrade.color)}>
                                      {subGrade.grade}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {sub.isPassed ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                        <CheckCircle2 className="h-3 w-3" /> Pass
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
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

                      {/* Total Row */}
                      <div className="mt-3 bg-indigo-50 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-700">Total Marks</p>
                          <p className="text-2xl font-bold text-indigo-900">{totalMarks} <span className="text-base font-normal text-indigo-500">/ {maxTotal}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-indigo-700">Overall Percentage</p>
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

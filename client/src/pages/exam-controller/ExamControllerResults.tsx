import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Upload,
  Users,
  FileText,
  ChevronDown,
} from 'lucide-react'

export function ExamControllerResults() {
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [selectedExamId, setSelectedExamId] = useState(searchParams.get('examId') || '')

  const { data: examsData, isLoading: examsLoading } = useQuery({
    queryKey: ['exam-controller-exams-list'],
    queryFn: async () => {
      const res = await api.get('/exam-controller/exams')
      return res.data?.data ?? res.data
    },
  })

  const { data: resultsData, isLoading: resultsLoading, error: resultsError, refetch } = useQuery({
    queryKey: ['exam-controller-results', selectedExamId],
    queryFn: async () => {
      const params = selectedExamId ? `?examId=${selectedExamId}` : ''
      const res = await api.get(`/exam-controller/results${params}`)
      return res.data?.data ?? res.data
    },
    enabled: true,
  })

  const publishMutation = useMutation({
    mutationFn: async (examId: string) => {
      const res = await api.post('/exam-controller/results/publish', { examId })
      return res.data?.data ?? res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-controller-results'] })
      queryClient.invalidateQueries({ queryKey: ['exam-controller-dashboard'] })
    },
  })

  if (resultsLoading || examsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (resultsError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-300">Failed to load results</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const exams = examsData?.data || examsData || []
  const results = resultsData?.data || resultsData || []
  const selectedExam = exams.find((e: any) => e.id === selectedExamId)

  const resultsByExam = selectedExamId
    ? results
    : results.reduce((acc: Record<string, any[]>, r: any) => {
        const key = r.examId || r.exam?.id || 'unknown'
        if (!acc[key]) acc[key] = []
        acc[key].push(r)
        return acc
      }, {} as Record<string, any[]>)

  const examGroups = selectedExamId
    ? [{ examId: selectedExamId, examName: selectedExam?.name || 'Selected Exam', results }]
    : Object.entries(resultsByExam).map(([examId, examResults]) => {
        const firstResult = examResults[0] as any
        return {
          examId,
          examName: firstResult?.exam?.name || exams.find((e: any) => e.id === examId)?.name || examId,
          results: examResults,
        }
      })

  const totalResults = results.length
  const publishedExams = exams.filter((e: any) => e.status === 'PUBLISHED').length
  const averageScore = totalResults > 0
    ? Math.round(results.reduce((s: number, r: any) => s + ((r.marksObtained / r.totalMarks) * 100 || 0), 0) / totalResults)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Results Management</h1>
          <p className="text-slate-400 text-sm">View and publish exam results</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700"
        >
          <RefreshCw className={cn('w-4 h-4', resultsLoading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Filters & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="appearance-none pl-3 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Exams</option>
            {exams.map((exam: any) => (
              <option key={exam.id} value={exam.id}>{exam.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-300">Total: <span className="font-semibold text-white">{totalResults}</span></span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-sm text-slate-300">Published: <span className="font-semibold text-white">{publishedExams}</span></span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
            <FileText className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-slate-300">Avg: <span className="font-semibold text-white">{averageScore}%</span></span>
          </div>
        </div>
      </div>

      {/* Results by Exam */}
      {examGroups.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">No results available</p>
          <p className="text-sm text-slate-500 mt-1">Select an exam to view results</p>
        </div>
      ) : (
        <div className="space-y-4">
          {examGroups.map((group) => {
            const isPublished = exams.find((e: any) => e.id === group.examId)?.status === 'PUBLISHED'
            return (
              <div key={group.examId} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-slate-700">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{group.examName}</h3>
                    <p className="text-sm text-slate-400">{group.results.length} student results</p>
                  </div>
                  <button
                    onClick={() => publishMutation.mutate(group.examId)}
                    disabled={isPublished || publishMutation.isPending}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isPublished
                        ? 'bg-green-900/30 text-green-400 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    )}
                  >
                    {isPublished ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Published
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" /> Publish Results
                      </>
                    )}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Roll No</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Student</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Subject</th>
                        <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Marks Obtained</th>
                        <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Max Marks</th>
                        <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Percentage</th>
                        <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {group.results.map((result: any, idx: number) => {
                        const pct = result.totalMarks > 0
                          ? Math.round((result.marksObtained / result.totalMarks) * 100)
                          : 0
                        const passed = pct >= 33
                        return (
                          <tr key={result.id || idx} className="hover:bg-slate-700/50">
                            <td className="px-5 py-3 text-sm text-slate-300">{result.student?.rollNumber || result.rollNumber || '—'}</td>
                            <td className="px-5 py-3 text-sm font-medium text-white">
                              {result.student?.fullName || result.studentName || '—'}
                            </td>
                            <td className="px-5 py-3 text-sm text-slate-300">{result.subject?.name || result.subjectName || '—'}</td>
                            <td className="px-5 py-3 text-sm text-white text-center font-medium">{result.marksObtained}</td>
                            <td className="px-5 py-3 text-sm text-slate-300 text-center">{result.totalMarks}</td>
                            <td className="px-5 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className={cn('h-full rounded-full', pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
                                </div>
                                <span className={cn('text-sm font-semibold', pct >= 60 ? 'text-green-400' : pct >= 33 ? 'text-yellow-400' : 'text-red-400')}>
                                  {pct}%
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span
                                className={cn(
                                  'px-2 py-1 text-xs font-medium rounded-full',
                                  passed ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                                )}
                              >
                                {passed ? 'PASS' : 'FAIL'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ExamControllerResults

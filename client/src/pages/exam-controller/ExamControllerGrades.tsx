import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  AlertCircle,
  Calculator,
  ChevronDown,
  BarChart3,
  Award,
  TrendingUp,
} from 'lucide-react'

export function ExamControllerGrades() {
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [selectedExamId, setSelectedExamId] = useState(searchParams.get('examId') || '')

  const { data: examsData, isLoading: examsLoading } = useQuery({
    queryKey: ['exam-controller-grades-exams'],
    queryFn: async () => {
      const res = await api.get('/exam-controller/exams')
      return res.data?.data ?? res.data
    },
  })

  const { data: gradesData, isLoading: gradesLoading, error: gradesError, refetch } = useQuery({
    queryKey: ['exam-controller-grades', selectedExamId],
    queryFn: async () => {
      const params = selectedExamId ? `?examId=${selectedExamId}` : ''
      const res = await api.get(`/exam-controller/calculate-grades${params}`)
      return res.data?.data ?? res.data
    },
    enabled: true,
  })

  const calculateGradesMutation = useMutation({
    mutationFn: async (examId: string) => {
      const res = await api.post('/exam-controller/calculate-grades', { examId })
      return res.data?.data ?? res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-controller-grades'] })
      queryClient.invalidateQueries({ queryKey: ['exam-controller-dashboard'] })
    },
  })

  if (gradesLoading || examsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (gradesError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-300">Failed to load grades</p>
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
  const gradeData = gradesData?.data || gradesData || {}

  const gradeDistribution = gradeData.distribution || gradeData.gradeDistribution || []
  const gradeSummary = gradeData.summary || {}
  const studentGrades = gradeData.students || gradeData.studentGrades || []

  const maxCount = gradeDistribution.length > 0
    ? Math.max(...gradeDistribution.map((g: any) => g.count || 0), 1)
    : 1

  const totalStudents = gradeDistribution.reduce((s: number, g: any) => s + (g.count || 0), 0)

  const gradeColors: Record<string, string> = {
    'A+': 'bg-green-500',
    'A': 'bg-green-400',
    'B+': 'bg-blue-500',
    'B': 'bg-blue-400',
    'C+': 'bg-yellow-500',
    'C': 'bg-yellow-400',
    'D': 'bg-orange-500',
    'E': 'bg-red-400',
    'F': 'bg-red-500',
  }

  const gradeTextColors: Record<string, string> = {
    'A+': 'text-green-400',
    'A': 'text-green-400',
    'B+': 'text-blue-400',
    'B': 'text-blue-400',
    'C+': 'text-yellow-400',
    'C': 'text-yellow-400',
    'D': 'text-orange-400',
    'E': 'text-red-400',
    'F': 'text-red-500',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Grade Calculation</h1>
          <p className="text-slate-400 text-sm">Calculate and view grade distribution for exams</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700"
          >
            <RefreshCw className={cn('w-4 h-4', gradesLoading && 'animate-spin')} /> Refresh
          </button>
          <button
            onClick={() => selectedExamId && calculateGradesMutation.mutate(selectedExamId)}
            disabled={!selectedExamId || calculateGradesMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Calculator className="h-4 w-4" />
            {calculateGradesMutation.isPending ? 'Calculating...' : 'Calculate Grades'}
          </button>
        </div>
      </div>

      {/* Exam Selector */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="appearance-none pl-3 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an exam</option>
            {exams.map((exam: any) => (
              <option key={exam.id} value={exam.id}>{exam.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        {gradeSummary.totalStudents && (
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
              <Award className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-slate-300">Students: <span className="font-semibold text-white">{gradeSummary.totalStudents}</span></span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-300">Pass Rate: <span className="font-semibold text-white">{gradeSummary.passRate ?? 0}%</span></span>
            </div>
          </div>
        )}
      </div>

      {!selectedExamId ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <Calculator className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">Select an exam to view grade distribution</p>
        </div>
      ) : (
        <>
          {/* Grade Distribution Chart (bar chart using divs) */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Grade Distribution</h2>
            </div>

            {gradeDistribution.length === 0 ? (
              <p className="text-slate-400 text-center py-12">No grade data available. Click "Calculate Grades" first.</p>
            ) : (
              <div className="space-y-4">
                {/* Y-axis labels + bars */}
                <div className="flex items-end gap-3 h-64">
                  {gradeDistribution.map((grade: any) => {
                    const count = grade.count || 0
                    const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0
                    const gradeLabel = grade.grade || grade.label || '—'
                    const barColor = gradeColors[gradeLabel] || 'bg-slate-500'
                    const textColor = gradeTextColors[gradeLabel] || 'text-slate-400'

                    return (
                      <div key={gradeLabel} className="flex-1 flex flex-col items-center justify-end h-full">
                        <span className="text-xs text-slate-400 mb-1">{count}</span>
                        <div
                          className={cn('w-full rounded-t-lg transition-all duration-500', barColor)}
                          style={{ height: `${Math.max(heightPercent, 2)}%` }}
                        />
                        <span className={cn('text-sm font-semibold mt-2', textColor)}>{gradeLabel}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-700">
                  <span className="text-xs text-slate-400">Total Students: {totalStudents}</span>
                </div>
              </div>
            )}
          </div>

          {/* Grade Summary Cards */}
          {gradeDistribution.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {gradeDistribution.map((grade: any) => {
                const gradeLabel = grade.grade || grade.label || '—'
                const count = grade.count || 0
                const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0
                const textColor = gradeTextColors[gradeLabel] || 'text-slate-400'
                const bgColor = gradeColors[gradeLabel] || 'bg-slate-500'

                return (
                  <div key={gradeLabel} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn('w-3 h-3 rounded-full', bgColor)} />
                      <span className={cn('text-lg font-bold', textColor)}>{gradeLabel}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{count}</p>
                    <p className="text-xs text-slate-400">{percentage}% of students</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Student Grades Table */}
          {studentGrades.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-5 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">Student Grades</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Student</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Roll No</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Class</th>
                      <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Marks</th>
                      <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Percentage</th>
                      <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {studentGrades.map((student: any, idx: number) => {
                      const pct = student.percentage || 0
                      const gradeLabel = student.grade || '—'
                      return (
                        <tr key={student.id || idx} className="hover:bg-slate-700/50">
                          <td className="px-5 py-3 text-sm font-medium text-white">
                            {student.studentName || student.name || '—'}
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-300">
                            {student.rollNumber || student.enrollmentNumber || '—'}
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-300">
                            {student.className || student.class || '—'}
                          </td>
                          <td className="px-5 py-3 text-sm text-white text-center font-medium">
                            {student.marksObtained ?? student.marks ?? 0}/{student.totalMarks ?? 0}
                          </td>
                          <td className="px-5 py-3 text-center">
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
                              <span className={cn('text-sm font-semibold', pct >= 60 ? 'text-green-400' : 'text-red-400')}>
                                {pct}%
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={cn('text-sm font-bold', gradeTextColors[gradeLabel] || 'text-slate-400')}>
                              {gradeLabel}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ExamControllerGrades

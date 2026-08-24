import { useState, useEffect } from 'react'
import { RefreshCw, FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/services/api'

export function DirectorExaminations() {
  const [exams, setExams] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadExams() }, [])

  const loadExams = async () => {
    setLoading(true)
    try {
      const res = await api.get('/director/examinations')
      setExams(res.data.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examination Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Exam schedules, completion rates & results analysis</p>
        </div>
        <button onClick={loadExams} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-blue-700">{exams?.total || 0}</p><p className="text-xs text-gray-500">Total Exams</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-green-700">{exams?.completed || 0}</p><p className="text-xs text-gray-500">Completed</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div><p className="text-2xl font-bold text-yellow-700">{exams?.pending || 0}</p><p className="text-xs text-gray-500">Upcoming</p></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Completion Rate</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-gray-900">{exams?.completionRate || 0}%</span>
          </div>
          <div className="mt-3 w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-green-500" style={{ width: `${exams?.completionRate || 0}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pass Rate</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-indigo-600">{exams?.passRate || 0}%</span>
          </div>
          <div className="mt-3 w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${exams?.passRate || 0}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Average Marks</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-gray-900">{exams?.avgMarks || 0}</span>
            <span className="text-sm text-gray-500 mb-1">/ 100</span>
          </div>
          <div className="mt-3 w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-blue-500" style={{ width: `${exams?.avgMarks || 0}%` }} />
          </div>
        </div>
      </div>

      {/* Visual Gauge */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Overall Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="85" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                <circle cx="100" cy="100" r="85" fill="none" stroke={exams?.passRate >= 60 ? '#22c55e' : '#ef4444'} strokeWidth="12" strokeDasharray={`${(exams?.passRate || 0) * 5.34} 534`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{exams?.passRate || 0}%</span>
                <span className="text-sm text-gray-500">Pass Rate</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Completion: {exams?.completionRate || 0}%</p>
                <p className="text-xs text-green-600">{exams?.completed || 0} of {exams?.total || 0} exams completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Average Marks: {exams?.avgMarks || 0}/100</p>
                <p className="text-xs text-blue-600">Institution-wide average performance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

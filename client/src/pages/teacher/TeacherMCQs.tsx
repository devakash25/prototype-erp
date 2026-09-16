import { useState, useEffect, useCallback } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  Plus,
  FileText,
  BarChart3,
  Send,
  Archive,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Users,
  Percent,
  Timer,
  BookOpen,
  Filter,
  X,
  Search,
} from 'lucide-react'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

type View = 'list' | 'create' | 'analytics'
type SubTab = 'draft' | 'published' | 'archived'

interface Test {
  id: string
  title: string
  chapter: string | null
  totalQuestions: number
  totalMarks: number
  duration: number
  status: string
  startTime: string
  endTime: string
  course: { name: string; code: string }
  subject: { name: string; code: string }
  _count: { submissions: number; questions: number }
}

interface Question {
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  marks: number
}

interface Analytics {
  test: { id: string; title: string; totalQuestions: number; totalMarks: number; duration: number; status: string }
  summary: {
    totalSubmissions: number
    avgScore: number
    highestScore: number
    lowestScore: number
    avgTime: number
    passRate: number
  }
  questionAnalytics: Array<{
    questionId: string
    question: string
    correctAnswer: string
    totalAnswers: number
    correctRate: number
    optionCounts: { A: number; B: number; C: number; D: number }
  }>
  submissions: Array<{
    studentId: string
    studentName: string
    score: number
    total: number
    percentage: number
    timeTaken: number | null
    submittedAt: string
  }>
}

interface ClassOption {
  id: string
  name: string
  code: string
}

interface SubjectOption {
  id: string
  name: string
  code: string
}

const emptyQuestion: Question = { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: 1 }

export function TeacherMCQs() {
  const [view, setView] = useState<View>('list')
  const [subTab, setSubTab] = useState<SubTab>('published')
  const [searchQuery, setSearchQuery] = useState('')
  const [testAnalyticsMap, setTestAnalyticsMap] = useState<Record<string, Analytics>>({})

  const { data: tests, loading: testsLoading, error: testsError, refetch: refetchTests } = useApi<Test[]>(
    `/mcq/teacher/tests?status=${subTab.toUpperCase()}`,
    [subTab]
  )

  // Fetch analytics for each test
  useEffect(() => {
    if (tests) {
      const analyticsMap: Record<string, Analytics> = {}
      tests.forEach(test => {
        analyticsMap[test.id] = {
          test: { id: test.id, title: test.title, totalQuestions: test._count.questions, totalMarks: test.totalMarks, duration: test.duration, status: test.status },
          summary: {
            totalSubmissions: test._count.submissions,
            avgScore: 0, // would need additional API
            highestScore: 0,
            lowestScore: 0,
            avgTime: 0,
            passRate: 0
          },
          questionAnalytics: [], // would need additional API
          submissions: [] // would need additional API
        }
      })
      setTestAnalyticsMap(analyticsMap)
    }
  }, [tests])

  const filteredTests = (tests ?? []).filter((t) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return t.title.toLowerCase().includes(q) || t.subject.name.toLowerCase().includes(q) || t.course.name.toLowerCase().includes(q)
  })

  if (view === 'create') return <CreateTestView onBack={() => { setView('list'); refetchTests() }} />
  if (view === 'analytics') {
    const test = tests?.find(t => t.status === 'published')
    if (!test) return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-slate-500 mb-4" />
        <p className="text-slate-400">No published tests yet</p>
        <p className="text-slate-500 text-sm">Create or publish a test to see analytics</p>
      </div>
    )
    const testAnalytics = testAnalyticsMap || {}
    const summary = testAnalytics[test.id] || {}
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
        <h2 className="text-xl font-semibold text-white mb-6">Analytics: {test.title}</h2>
        {Object.keys(testAnalytics).length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-400">Total Submissions</p>
              <p className="text-3xl font-bold text-white">{summary.summary?.totalSubmissions || 0}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Avg Score</p>
              <p className="text-3xl font-bold text-white">{summary.summary?.avgScore?.toFixed(1) || 0}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Pass Rate</p>
              <p className="text-3xl font-bold text-white">{summary.summary?.passRate?.toFixed(1) || 0}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Highest Score</p>
              <p className="text-3xl font-bold text-white">{summary.summary?.highestScore?.toFixed(1) || 0}</p>
            </div>
          </div>
        )}
        {Object.keys(testAnalytics).length > 0 && testAnalytics[test.id] && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Question Analysis</h3>
            <BarChart data={(summary.questionAnalytics || []).map((q: any) => ({ name: q.question.slice(0, 20), correctRate: q.correctRate }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="correctRate" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </div>
        )}
        {summary.summary?.totalSubmissions > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Student Submissions</h3>
            <BarChart data={summary.submissions?.map((s: any) => ({ name: s.studentName.slice(0, 15), percentage: s.percentage }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="percentage" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">MCQ Tests</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage multiple choice assessments</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} /> Create Test
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {(['draft', 'published', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              subTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Search tests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
      </div>

      {/* Test list */}
      {testsLoading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : testsError ? (
        <div className="text-center py-12 text-red-500">{testsError}</div>
      ) : filteredTests.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No tests found</p>
          <p className="text-sm mt-1">Create your first MCQ test</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredTests.map((test) => (
            <TestCard key={test.id} test={test} onRefresh={refetchTests} onViewAnalytics={() => {}} />
          ))}
        </div>
      )}
    </div>
  )
}

function TestCard({ test, onRefresh, onViewAnalytics }: { test: Test; onRefresh: () => void; onViewAnalytics: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-yellow-100 text-yellow-700',
    PUBLISHED: 'bg-green-100 text-green-700',
    ARCHIVED: 'bg-slate-100 text-slate-600',
  }

  const handlePublish = async () => {
    setLoading(true)
    try {
      await api.post(`/mcq/${test.id}/publish`)
      onRefresh()
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Failed to publish')
    }
    setLoading(false)
  }

  const handleArchive = async () => {
    if (!confirm('Archive this test?')) return
    setLoading(true)
    try {
      await api.post(`/mcq/${test.id}/archive`)
      onRefresh()
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Failed')
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('Permanently delete this test?')) return
    setLoading(true)
    try {
      await api.delete(`/mcq/${test.id}`)
      onRefresh()
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Failed')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <FileText size={18} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 truncate">{test.title}</h3>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColors[test.status])}>
                {test.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span>{test.subject.name}</span>
              <span className="text-slate-300">|</span>
              <span>{test.course.name}</span>
              <span className="text-slate-300">|</span>
              <span>{test.totalQuestions} questions</span>
              <span className="text-slate-300">|</span>
              <span>{test.duration} min</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <p className="text-sm font-semibold text-slate-900">{test._count.submissions}</p>
            <p className="text-xs text-slate-500">submissions</p>
          </div>
          {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-4 bg-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
            <Clock size={14} />
            <span>
              {new Date(test.startTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              {' → '}
              {new Date(test.endTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex gap-2">
            {test.status === 'DRAFT' && (
              <button
                onClick={handlePublish}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                <Send size={14} /> Publish
              </button>
            )}
            {test.status === 'PUBLISHED' && (
              <button
                onClick={handleArchive}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-300 disabled:opacity-50"
              >
                <Archive size={14} /> Archive
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 disabled:opacity-50"
            >
              <Trash2 size={14} /> Delete
            </button>
            {test._count.submissions > 0 && (
              <button
                onClick={onViewAnalytics}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 ml-auto"
              >
                <BarChart3 size={14} /> Analytics
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================
// CREATE TEST VIEW
// =============================================

function CreateTestView({ onBack }: { onBack: () => void }) {
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [form, setForm] = useState({
    classId: '',
    subjectId: '',
    title: '',
    chapter: '',
    instructions: '',
    duration: 30,
    startTime: '',
    endTime: '',
    allowReattempt: false,
    randomizeQuestions: false,
    randomizeOptions: false,
  })
  const [questions, setQuestions] = useState<Question[]>([{ ...emptyQuestion }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Load classes on mount
  useEffect(() => {
    api.get('/courses?isActive=true').then((res) => {
      const data = res.data.data || res.data
      setClasses(Array.isArray(data) ? data.map((c: any) => ({ id: c.id, name: c.name, code: c.code })) : [])
    }).catch(() => {})
  }, [])

  // Load subjects when class changes
  useEffect(() => {
    if (!form.classId) { setSubjects([]); return }
    api.get(`/subjects?courseId=${form.classId}&isActive=true`).then((res) => {
      const data = res.data.data || res.data
      setSubjects(Array.isArray(data) ? data.map((s: any) => ({ id: s.id, name: s.name, code: s.code })) : [])
    }).catch(() => {})
  }, [form.classId])

  const addQuestion = () => setQuestions([...questions, { ...emptyQuestion }])
  const removeQuestion = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i))
  const updateQuestion = (i: number, field: keyof Question, value: string | number) => {
    setQuestions(questions.map((q, idx) => idx === i ? { ...q, [field]: value } : q))
  }

  const handleSubmit = async () => {
    if (!form.classId || !form.subjectId || !form.title || !form.startTime || !form.endTime) {
      setError('Please fill all required fields')
      return
    }
    const validQuestions = questions.filter((q) => q.question.trim() && q.optionA.trim() && q.optionB.trim() && q.optionC.trim() && q.optionD.trim())
    if (validQuestions.length === 0) {
      setError('Add at least one complete question')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await api.post('/mcq/create', {
        ...form,
        questions: validQuestions,
      })
      setSuccess(true)
      setTimeout(() => onBack(), 1500)
    } catch (e: any) {
      setError(e.response?.data?.error?.message || 'Failed to create test')
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <CheckCircle2 size={48} className="mx-auto text-green-500 mb-3" />
          <h2 className="text-lg font-semibold text-slate-900">Test Created Successfully!</h2>
          <p className="text-sm text-slate-500 mt-1">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Create MCQ Test</h1>
          <p className="text-sm text-slate-500">{questions.length} questions • {questions.reduce((s, q) => s + (q.marks || 1), 0)} marks</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Basic info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2"><BookOpen size={16} /> Test Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Class *</label>
            <select
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value, subjectId: '' })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
            <select
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              disabled={!form.classId}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Chapter 3 - Data Structures Quiz"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chapter</label>
            <input
              type="text"
              value={form.chapter}
              onChange={(e) => setForm({ ...form, chapter: e.target.value })}
              placeholder="e.g. Trees and Graphs"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes) *</label>
            <input
              type="number"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 30 })}
              min={1}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time *</label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Time *</label>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Instructions</label>
          <textarea
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            placeholder="Optional instructions for students..."
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.allowReattempt} onChange={(e) => setForm({ ...form, allowReattempt: e.target.checked })} className="rounded" />
            Allow reattempt
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.randomizeQuestions} onChange={(e) => setForm({ ...form, randomizeQuestions: e.target.checked })} className="rounded" />
            Randomize questions
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.randomizeOptions} onChange={(e) => setForm({ ...form, randomizeOptions: e.target.checked })} className="rounded" />
            Randomize options
          </label>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Questions ({questions.length})</h2>
          <button onClick={addQuestion} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
            <Plus size={14} /> Add Question
          </button>
        </div>

        {questions.map((q, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Question {i + 1} *</label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(i, 'question', e.target.value)}
                  placeholder="Enter question..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <label className="text-xs text-slate-500">Marks:</label>
                <input
                  type="number"
                  value={q.marks}
                  onChange={(e) => updateQuestion(i, 'marks', parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-14 border border-slate-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(i)} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${i}`}
                    checked={q.correctAnswer === opt}
                    onChange={() => updateQuestion(i, 'correctAnswer', opt)}
                    className="accent-green-600"
                  />
                  <label className="text-xs font-medium text-slate-500 w-5">{opt}.</label>
                  <input
                    type="text"
                    value={q[opt === 'A' ? 'optionA' : opt === 'B' ? 'optionB' : opt === 'C' ? 'optionC' : 'optionD']}
                    onChange={(e) => updateQuestion(i, opt === 'A' ? 'optionA' : opt === 'B' ? 'optionB' : opt === 'C' ? 'optionC' : 'optionD', e.target.value)}
                    placeholder={`Option ${opt}`}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pb-8">
        <button onClick={onBack} className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Test'}
        </button>
      </div>
    </div>
  )
}

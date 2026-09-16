import { useState, useEffect, useCallback, useRef } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  FileText,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Timer,
  Trophy,
  BarChart3,
  History,
  BookOpen,
  Send,
} from 'lucide-react'

type View = 'list' | 'test' | 'result'

interface AvailableTest {
  id: string
  title: string
  chapter: string | null
  instructions: string | null
  totalQuestions: number
  totalMarks: number
  duration: number
  startTime: string
  endTime: string
  subject: { name: string; code: string }
  teacher: { user: { fullName: string } }
}

interface HistoryItem {
  id: string
  testId: string
  score: number
  total: number
  percentage: number
  timeTaken: number | null
  submittedAt: string
  test: {
    title: string
    totalQuestions: number
    duration: number
    subject: { name: string }
    teacher: { user: { fullName: string } }
  }
}

interface TestQuestion {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  marks: number
  sortOrder: number
}

interface TestInfo {
  id: string
  title: string
  chapter: string | null
  instructions: string | null
  duration: number
  totalQuestions: number
  totalMarks: number
  endTime: string
}

export function StudentMCQs() {
  const [view, setView] = useState<View>('list')
  const [subTab, setSubTab] = useState<'available' | 'history'>('available')
  const [activeTest, setActiveTest] = useState<{ test: TestInfo; questions: TestQuestion[] } | null>(null)
  const [result, setResult] = useState<any>(null)

  const { data: availableTests, loading: availLoading, refetch: refetchAvail } = useApi<AvailableTest[]>('/mcq/student/available')
  const { data: history, loading: histLoading, refetch: refetchHist } = useApi<HistoryItem[]>('/mcq/student/history')

  const handleStartTest = async (testId: string) => {
    try {
      const res = await api.get(`/mcq/student/start/${testId}`)
      const data = res.data.data
      if (data.existingSubmission) {
        // Show previous result
        setResult(data.existingSubmission)
        setView('result')
        return
      }
      setActiveTest(data)
      setView('test')
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Failed to start test')
    }
  }

  const handleSubmitTest = (resultData: any) => {
    setResult(resultData)
    setView('result')
    refetchAvail()
    refetchHist()
  }

  if (view === 'test' && activeTest) {
    return <TestInterface test={activeTest.test} questions={activeTest.questions} onSubmit={handleSubmitTest} onBack={() => setView('list')} />
  }

  if (view === 'result' && result) {
    return <TestResult result={result} onBack={() => { setView('list'); setResult(null) }} />
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">MCQ Tests</h1>
        <p className="text-sm text-slate-400 mt-1">Take tests and view your results</p>
      </div>

      <div className="flex gap-1 bg-slate-800 p-1 rounded-lg w-fit border border-slate-700">
        {(['available', 'history'] as const).map((tab) => (
          <button key={tab} onClick={() => setSubTab(tab)}
            className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              subTab === tab ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            )}>
            {tab === 'available' ? 'Available Now' : 'My History'}
          </button>
        ))}
      </div>

      {subTab === 'available' ? (
        availLoading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : (availableTests ?? []).length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Play size={48} className="mx-auto mb-3 text-slate-600" />
            <p className="font-medium">No tests available right now</p>
            <p className="text-sm mt-1">Check back later for new tests</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {availableTests!.map((test) => (
              <AvailableTestCard key={test.id} test={test} onStart={() => handleStartTest(test.id)} />
            ))}
          </div>
        )
      ) : (
        histLoading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : (history ?? []).length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <History size={48} className="mx-auto mb-3 text-slate-600" />
            <p className="font-medium">No test history yet</p>
            <p className="text-sm mt-1">Take your first test to see results here</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {history!.map((h) => (
              <HistoryCard key={h.id} item={h} />
            ))}
          </div>
        )
      )}
    </div>
  )
}

function AvailableTestCard({ test, onStart }: { test: AvailableTest; onStart: () => void }) {
  const now = new Date()
  const end = new Date(test.endTime)
  const minsLeft = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 60000))

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
            <FileText size={18} className="text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{test.title}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="text-indigo-400 font-medium">{test.subject.name}</span>
              <span className="text-slate-600">|</span>
              <span>{test.teacher.user.fullName}</span>
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-xs font-medium">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
        </span>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1"><BookOpen size={12} /> {test.totalQuestions} questions</span>
        <span className="flex items-center gap-1"><BarChart3 size={12} /> {test.totalMarks} marks</span>
        <span className="flex items-center gap-1"><Timer size={12} /> {test.duration} min</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {minsLeft} min left</span>
      </div>
      {test.instructions && <p className="mt-2 text-xs text-slate-500 italic line-clamp-1">{test.instructions}</p>}
      <div className="mt-3 flex justify-end">
        <button onClick={onStart} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Play size={14} /> Start Test
        </button>
      </div>
    </div>
  )
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const passed = item.percentage >= 40
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', passed ? 'bg-green-500/10' : 'bg-red-500/10')}>
            {passed ? <CheckCircle2 size={18} className="text-green-400" /> : <AlertCircle size={18} className="text-red-400" />}
          </div>
          <div>
            <h3 className="font-semibold text-white">{item.test.title}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>{item.test.subject.name}</span>
              <span className="text-slate-600">|</span>
              <span>{new Date(item.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={cn('text-lg font-bold', passed ? 'text-green-400' : 'text-red-400')}>{item.percentage}%</p>
          <p className="text-xs text-slate-400">{item.score}/{item.total}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
        {item.timeTaken && <span className="flex items-center gap-1"><Timer size={12} /> {Math.floor(item.timeTaken / 60)}m {item.timeTaken % 60}s</span>}
        <span className={cn('font-medium', passed ? 'text-green-400' : 'text-red-400')}>{passed ? 'Passed' : 'Failed'}</span>
      </div>
    </div>
  )
}

// =============================================
// TEST INTERFACE (TIMER + QUESTIONS)
// =============================================

function TestInterface({ test, questions, onSubmit, onBack }: { test: TestInfo; questions: TestQuestion[]; onSubmit: (r: any) => void; onBack: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const [timeLeft, setTimeLeft] = useState(test.duration * 60)
  const [submitting, setSubmitting] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const startTimeRef = useRef(Date.now())
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { if (timerRef.current) clearInterval(timerRef.current); handleSubmit(true); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSelect = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return
    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitting(true)
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const answerArray = Object.entries(answers).map(([questionId, selectedOption]) => ({ questionId, selectedOption }))
    try {
      const res = await api.post('/mcq/student/submit', { testId: test.id, answers: answerArray, timeTaken })
      onSubmit(res.data.data)
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Failed to submit')
      setSubmitting(false)
    }
  }

  const answeredCount = Object.keys(answers).length
  const current = questions[currentQ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="sticky top-0 z-10 bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-slate-700 rounded-lg text-slate-400">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="font-semibold text-white text-sm">{test.title}</h2>
            <p className="text-xs text-slate-400">{answeredCount}/{questions.length} answered</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-bold',
            timeLeft <= 60 ? 'bg-red-500/10 text-red-400 animate-pulse' : timeLeft <= 300 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-slate-700 text-slate-300'
          )}>
            <Timer size={14} /> {formatTime(timeLeft)}
          </div>
          <button onClick={() => setConfirmSubmit(true)} disabled={answeredCount === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            <Send size={14} /> Submit
          </button>
        </div>
      </div>

      <div className="flex gap-4 mt-4 px-4">
        <div className="w-48 shrink-0">
          <p className="text-xs font-medium text-slate-400 mb-2">Questions</p>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q, i) => (
              <button key={q.id} onClick={() => setCurrentQ(i)}
                className={cn('w-9 h-9 rounded-lg text-xs font-medium transition-colors',
                  i === currentQ ? 'bg-blue-600 text-white' : answers[q.id] ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                )}>
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/10" /> Answered</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-700" /> Unanswered</span>
          </div>
        </div>

        <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400">Question {currentQ + 1} of {questions.length}</span>
            <span className="text-xs text-slate-500">{current.marks} mark{current.marks > 1 ? 's' : ''}</span>
          </div>
          <p className="text-white font-medium mb-4">{current.question}</p>
          <div className="space-y-2">
            {(['A', 'B', 'C', 'D'] as const).map((opt) => {
              const optionKey = `option${opt}` as keyof TestQuestion
              const selected = answers[current.id] === opt
              return (
                <button key={opt} onClick={() => handleSelect(current.id, opt)}
                  className={cn('w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all text-sm',
                    selected ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30' : 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
                  )}>
                  <span className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    selected ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                  )}>{opt}</span>
                  <span className="text-slate-300">{current[optionKey]}</span>
                </button>
              )
            })}
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
              className="px-3 py-1.5 text-sm text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-50">← Previous</button>
            <button onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))} disabled={currentQ === questions.length - 1}
              className="px-3 py-1.5 text-sm text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-50">Next →</button>
          </div>
        </div>
      </div>

      {confirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-white">Submit Test?</h3>
            <p className="text-sm text-slate-400 mt-2">
              You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.
              {answeredCount < questions.length && (
                <span className="block mt-1 text-orange-400">{questions.length - answeredCount} question{questions.length - answeredCount > 1 ? 's' : ''} unanswered!</span>
              )}
            </p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setConfirmSubmit(false)} className="flex-1 px-3 py-2 text-sm text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-700">Continue Test</button>
              <button onClick={() => handleSubmit()} disabled={submitting} className="flex-1 px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================
// TEST RESULT VIEW
// =============================================

function TestResult({ result, onBack }: { result: any; onBack: () => void }) {
  const passed = result.percentage >= 40

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className={cn('text-center py-8 rounded-xl border-2', passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20')}>
        <Trophy size={48} className={cn('mx-auto mb-3', passed ? 'text-green-400' : 'text-red-400')} />
        <h2 className="text-3xl font-bold text-white">{result.percentage}%</h2>
        <p className={cn('text-lg font-medium mt-1', passed ? 'text-green-400' : 'text-red-400')}>
          {passed ? 'Congratulations! You Passed' : 'Keep Practicing'}
        </p>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-400">
          <span>Score: <strong className="text-white">{result.score}/{result.total}</strong></span>
          {result.timeTaken && <span>Time: <strong className="text-white">{Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</strong></span>}
        </div>
      </div>

      {result.questions && (
        <div className="space-y-3">
          <h3 className="font-semibold text-white">Detailed Review</h3>
          {result.questions.map((q: any, i: number) => (
            <div key={i} className={cn('bg-slate-800 border rounded-xl p-4', q.isCorrect ? 'border-green-500/20' : 'border-red-500/20')}>
              <div className="flex items-start gap-3">
                <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                  q.isCorrect ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                )}>{q.isCorrect ? '✓' : '✗'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Q{i + 1}. {q.question}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                      const isCorrect = q.correctAnswer === opt
                      const isSelected = q.selectedOption === opt
                      return (
                        <span key={opt} className={cn('px-2 py-1 rounded-md border',
                          isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-400 font-medium' :
                          isSelected ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                          'bg-slate-700/50 border-slate-700 text-slate-400'
                        )}>
                          {opt}. {q[`option${opt}` as keyof typeof q]}
                          {isSelected && !isCorrect && ' (your answer)'}
                          {isCorrect && ' ✓'}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center pb-8">
        <button onClick={onBack} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Back to Tests</button>
      </div>
    </div>
  )
}

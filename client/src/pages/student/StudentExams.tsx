import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  AlertCircle,
  FileText,
  CalendarDays,
  BookOpen,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'

const DUMMY_EXAMS = [
  {
    id: '1',
    name: 'Unit Test 1',
    type: 'INTERNAL',
    startDate: '2026-06-10',
    endDate: '2026-06-14',
    resultPublished: true,
    totalMarks: 100,
    passingMarks: 40,
    venue: 'Room 301, Block A',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'],
    schedule: [
      { subject: 'Mathematics', date: '2026-06-10', time: '09:00 AM - 12:00 PM', venue: 'Room 301' },
      { subject: 'Physics', date: '2026-06-11', time: '09:00 AM - 12:00 PM', venue: 'Room 302' },
      { subject: 'Chemistry', date: '2026-06-12', time: '09:00 AM - 12:00 PM', venue: 'Room 303' },
      { subject: 'English', date: '2026-06-13', time: '10:00 AM - 01:00 PM', venue: 'Room 301' },
      { subject: 'Computer Science', date: '2026-06-14', time: '09:00 AM - 11:00 AM', venue: 'Lab 2' },
    ],
  },
  {
    id: '2',
    name: 'Mid Semester Examination',
    type: 'MIDTERM',
    startDate: '2026-07-15',
    endDate: '2026-07-22',
    resultPublished: true,
    totalMarks: 100,
    passingMarks: 40,
    venue: 'Main Exam Hall',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'],
    schedule: [
      { subject: 'Mathematics', date: '2026-07-15', time: '09:00 AM - 12:30 PM', venue: 'Exam Hall A' },
      { subject: 'Physics', date: '2026-07-17', time: '09:00 AM - 12:30 PM', venue: 'Exam Hall A' },
      { subject: 'Chemistry', date: '2026-07-19', time: '09:00 AM - 12:30 PM', venue: 'Exam Hall B' },
      { subject: 'English', date: '2026-07-21', time: '10:00 AM - 01:00 PM', venue: 'Exam Hall A' },
      { subject: 'Computer Science', date: '2026-07-22', time: '09:00 AM - 12:00 PM', venue: 'Lab 3' },
    ],
  },
  {
    id: '3',
    name: 'Pre-Final Examination',
    type: 'EXTERNAL',
    startDate: '2026-08-01',
    endDate: '2026-08-08',
    resultPublished: true,
    totalMarks: 100,
    passingMarks: 40,
    venue: 'Main Exam Hall',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'],
    schedule: [
      { subject: 'Mathematics', date: '2026-08-01', time: '09:00 AM - 12:30 PM', venue: 'Exam Hall A' },
      { subject: 'Physics', date: '2026-08-03', time: '09:00 AM - 12:30 PM', venue: 'Exam Hall B' },
      { subject: 'Chemistry', date: '2026-08-05', time: '09:00 AM - 12:30 PM', venue: 'Exam Hall A' },
      { subject: 'English', date: '2026-08-07', time: '10:00 AM - 01:00 PM', venue: 'Exam Hall C' },
      { subject: 'Computer Science', date: '2026-08-08', time: '09:00 AM - 12:00 PM', venue: 'Lab 2' },
    ],
  },
  {
    id: '4',
    name: 'Final Examination',
    type: 'FINAL',
    startDate: '2026-09-15',
    endDate: '2026-09-25',
    resultPublished: false,
    totalMarks: 100,
    passingMarks: 40,
    venue: 'Main Exam Hall',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'],
    schedule: [
      { subject: 'Mathematics', date: '2026-09-15', time: '09:00 AM - 12:30 PM', venue: 'Exam Hall A' },
      { subject: 'Physics', date: '2026-09-17', time: '09:00 AM - 12:30 PM', venue: 'Exam Hall B' },
      { subject: 'Chemistry', date: '2026-09-19', time: '09:00 AM - 12:30 PM', venue: 'Exam Hall A' },
      { subject: 'English', date: '2026-09-22', time: '10:00 AM - 01:00 PM', venue: 'Exam Hall C' },
      { subject: 'Computer Science', date: '2026-09-25', time: '09:00 AM - 12:00 PM', venue: 'Lab 2' },
    ],
  },
]

export function StudentExams() {
  const [exams, setExams] = useState<any[]>(DUMMY_EXAMS)
  const [loading, setLoading] = useState(false)
  const [error] = useState<string | null>(null)
  const [expandedExam, setExpandedExam] = useState<number | null>(null)

  const toggleExam = (idx: number) => {
    setExpandedExam(prev => (prev === idx ? null : idx))
  }

  const getExamStatus = (exam: any) => {
    const now = new Date()
    const start = new Date(exam.startDate)
    const end = new Date(exam.endDate)
    if (now > end) return { label: 'Completed', color: 'text-gray-500', bg: 'bg-gray-100' }
    if (now >= start && now <= end) return { label: 'Ongoing', color: 'text-green-600', bg: 'bg-green-100' }
    return { label: 'Upcoming', color: 'text-blue-600', bg: 'bg-blue-100' }
  }

  const refetch = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600">Failed to load examinations</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Examinations</h1>
          <p className="text-gray-500 text-sm">View exam schedule and details</p>
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
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : !exams.length ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm text-center py-16 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg">No examinations found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam: any, idx: number) => {
            const isExpanded = expandedExam === idx
            const status = getExamStatus(exam)

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
                    <div className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold',
                      exam.type === 'INTERNAL' && 'bg-blue-100 text-blue-700',
                      exam.type === 'MIDTERM' && 'bg-amber-100 text-amber-700',
                      exam.type === 'EXTERNAL' && 'bg-purple-100 text-purple-700',
                      exam.type === 'FINAL' && 'bg-red-100 text-red-700',
                      !['INTERNAL', 'MIDTERM', 'EXTERNAL', 'FINAL'].includes(exam.type) && 'bg-gray-100 text-gray-700',
                    )}>
                      {exam.type?.slice(0, 2) || 'EX'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{exam.name}</h3>
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', status.bg, status.color)}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
                        exam.type === 'INTERNAL' && 'bg-blue-50 text-blue-600',
                        exam.type === 'MIDTERM' && 'bg-amber-50 text-amber-600',
                        exam.type === 'EXTERNAL' && 'bg-purple-50 text-purple-600',
                        exam.type === 'FINAL' && 'bg-red-50 text-red-600',
                      )}>
                        {exam.type}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(exam.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {' — '}
                        {new Date(exam.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      {exam.resultPublished && (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Result Published
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-500">Max Marks</p>
                      <p className="text-sm font-semibold text-gray-900">{exam.totalMarks}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Schedule */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
                    <div className="p-5">
                      {/* Exam Info */}
                      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{exam.venue}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span>{exam.subjects?.length} subjects</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>Passing: {exam.passingMarks}/{exam.totalMarks}</span>
                        </div>
                      </div>

                      {/* Schedule Table */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Venue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {exam.schedule?.map((s: any, sIdx: number) => {
                              const examDate = new Date(s.date)
                              const isToday = examDate.toDateString() === new Date().toDateString()
                              return (
                                <tr key={sIdx} className={cn('hover:bg-gray-50/50 transition-colors', isToday && 'bg-indigo-50/50')}>
                                  <td className="px-4 py-3 text-sm text-gray-400 font-medium">{sIdx + 1}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.subject}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {examDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    {isToday && <span className="ml-2 text-xs font-medium text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">Today</span>}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{s.time}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{s.venue}</td>
                                </tr>
                              )
                            })}
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

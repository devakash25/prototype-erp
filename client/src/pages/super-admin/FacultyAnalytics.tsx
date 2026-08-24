import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, UserCheck, Calendar, Clock, Download } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn, exportToCSV } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { StatsSkeleton, ChartSkeleton } from '@/components/LoadingSkeleton'

export function FacultyAnalytics() {
  const [view, setView] = useState<'overview' | 'attendance' | 'workload' | 'feedback'>('overview')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const statsUrl = `/analytics/faculty/stats${fromDate ? `?from=${fromDate}&to=${toDate}` : ''}`
  const { data: stats, loading } = useApi(statsUrl, [fromDate, toDate])
  const { data: deptData } = useApi('/analytics/faculty/departments')
  const { data: leaveTrend } = useApi('/analytics/faculty/leave-trend')
  const { data: workload } = useApi('/analytics/faculty/workload')
  const { data: feedback } = useApi('/analytics/faculty/feedback')
  const { data: hiringTrend } = useApi('/analytics/faculty/hiring-trend')

  const s = stats || { total: 0, present: 0, onLeave: 0, avgStudentFeedback: 0 }

  const handleExport = () => {
    if (workload && workload.length) {
      exportToCSV(workload.map((w: any) => ({ name: w.name, classes: w.classes, assignments: w.assignments })), 'faculty_workload')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Faculty Analytics</h1></div>
        <StatsSkeleton count={4} />
        <ChartSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Faculty Analytics</h1><p className="text-sm text-gray-500">Teaching staff performance and workload</p></div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Download className="w-4 h-4" />Export CSV
          </button>
          {(['overview', 'attendance', 'workload', 'feedback'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', view === v ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
          ))}
        </div>
      </div>

      <DateRangeFilter fromDate={fromDate} toDate={toDate} onFromDateChange={setFromDate} onToDateChange={setToDate} onClear={() => { setFromDate(''); setToDate('') }} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-gray-900">{s.total}</p><p className="text-xs text-gray-500">Total Faculty</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><UserCheck className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold text-green-600">{s.present}</p><p className="text-xs text-gray-500">Present Today</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><Calendar className="w-5 h-5 text-orange-600" /></div><div><p className="text-2xl font-bold text-orange-600">{s.onLeave}</p><p className="text-xs text-gray-500">On Leave</p></div></div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><Award className="w-5 h-5 text-purple-600" /></div><div><p className="text-2xl font-bold text-purple-600">{s.avgStudentFeedback}</p><p className="text-xs text-gray-500">Avg Feedback</p></div></div></div>
      </div>
      {view === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Department Distribution</h3>
            <ResponsiveContainer width="100%" height={300}><BarChart data={deptData || []} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis type="number" tick={{ fontSize: 12 }} /><YAxis type="category" dataKey="dept" tick={{ fontSize: 11 }} width={120} /><Tooltip /><Legend /><Bar dataKey="count" fill="#6366f1" name="Total" radius={[0, 4, 4, 0]} /><Bar dataKey="present" fill="#10b981" name="Present" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Student Feedback Distribution</h3>
            <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={feedback || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count">{(feedback || []).map((_: any, i: number) => <Cell key={i} fill={['#10b981', '#6366f1', '#f59e0b', '#f97316', '#ef4444'][i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Hiring & Attrition Trend</h3>
            <ResponsiveContainer width="100%" height={250}><BarChart data={hiringTrend || []}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="joining" fill="#10b981" name="Joining" radius={[4, 4, 0, 0]} /><Bar dataKey="leaving" fill="#ef4444" name="Leaving" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Teaching Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><span className="text-sm text-gray-600">Total Faculty</span><span className="text-lg font-bold text-indigo-600">{s.total}</span></div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><span className="text-sm text-gray-600">Present Today</span><span className="text-lg font-bold text-green-600">{s.present}</span></div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><span className="text-sm text-gray-600">On Leave</span><span className="text-lg font-bold text-orange-600">{s.onLeave}</span></div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><span className="text-sm text-gray-600">Avg Feedback</span><span className="text-lg font-bold text-purple-600">{s.avgStudentFeedback}</span></div>
            </div>
          </div>
        </div>
      )}
      {view === 'attendance' && <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Faculty Leave Trend</h3><ResponsiveContainer width="100%" height={350}><BarChart data={leaveTrend || []}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="casual" fill="#6366f1" name="Casual" radius={[4, 4, 0, 0]} /><Bar dataKey="sick" fill="#f59e0b" name="Sick" radius={[4, 4, 0, 0]} /><Bar dataKey="earned" fill="#10b981" name="Earned" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}
      {view === 'workload' && <div className="bg-white rounded-xl border border-gray-200"><div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Faculty Workload</h3></div><div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Faculty</th><th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Classes/Week</th><th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Assignments</th></tr></thead><tbody className="divide-y divide-gray-100">{(workload || []).map((fac: any, i: number) => <tr key={i} className="hover:bg-gray-50"><td className="px-5 py-4 text-sm font-medium text-gray-900">{fac.name}</td><td className="px-5 py-4 text-sm text-gray-600">{fac.classes}</td><td className="px-5 py-4 text-sm text-gray-600">{fac.assignments}</td></tr>)}</tbody></table></div></div>}
      {view === 'feedback' && <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Student Feedback Ratings</h3><div className="space-y-3">{(feedback || []).map((item: any, i: number) => <div key={i} className="flex items-center gap-4"><span className="text-sm text-gray-600 w-16">{item.rating}</span><div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full flex items-center justify-end pr-2" style={{ width: `${(item.count / Math.max(...(feedback || []).map((f: any) => f.count || 1))) * 100}%`, backgroundColor: item.color }}><span className="text-xs text-white font-medium">{item.count}</span></div></div></div>)}</div></div>}
    </div>
  )
}

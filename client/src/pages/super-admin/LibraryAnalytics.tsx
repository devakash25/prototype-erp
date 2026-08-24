import { useState } from 'react'
import { BookOpen, Book, AlertTriangle, DollarSign, Download } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency, formatNumber, exportToCSV } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { StatsSkeleton } from '@/components/LoadingSkeleton'

export function LibraryAnalytics() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const dateParams = new URLSearchParams()
  if (fromDate) dateParams.append('from', fromDate)
  if (toDate) dateParams.append('to', toDate)
  const queryString = dateParams.toString()
  const apiUrl = `/analytics/library/stats${queryString ? `?${queryString}` : ''}`

  const { data: stats, loading } = useApi(apiUrl)
  const { data: categories } = useApi('/analytics/library/categories')
  const { data: issueTrend } = useApi('/analytics/library/issue-trend')
  const { data: mostRead } = useApi('/analytics/library/most-read')
  const s = stats || { totalBooks: 0, issued: 0, overdue: 0, pendingFines: 0 }

  const handleExportCSV = () => {
    const data = (mostRead || []).map((book: any) => ({
      Rank: book.rank,
      Title: book.title,
      Author: book.author,
      Issues: book.issues,
    }))
    exportToCSV(data, 'library-most-read')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Library Analytics</h1>
          <p className="text-sm text-gray-500">Books, issues, fines, and inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter fromDate={fromDate} toDate={toDate} onFromDateChange={setFromDate} onToDateChange={setToDate} />
          <button onClick={handleExportCSV} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><BookOpen className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-gray-900">{formatNumber(s.totalBooks)}</p><p className="text-xs text-gray-500">Total Books</p></div></div></div>
            <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Book className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold text-green-600">{formatNumber(s.issued)}</p><p className="text-xs text-gray-500">Currently Issued</p></div></div></div>
            <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div><div><p className="text-2xl font-bold text-red-600">{s.overdue}</p><p className="text-xs text-gray-500">Overdue</p></div></div></div>
            <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><DollarSign className="w-5 h-5 text-orange-600" /></div><div><p className="text-2xl font-bold text-orange-600">{formatCurrency(s.pendingFines)}</p><p className="text-xs text-gray-500">Pending Fines</p></div></div></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Books by Category</h3><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={categories || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="books">{(categories || []).map((_: any, i: number) => <Cell key={i} fill={['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f59e0b'][i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
            <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="font-semibold text-gray-900 mb-4">Issue & Return Trend</h3><ResponsiveContainer width="100%" height={280}><BarChart data={issueTrend || []}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="issued" fill="#6366f1" name="Issued" radius={[4, 4, 0, 0]} /><Bar dataKey="returned" fill="#10b981" name="Returned" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Most Read Books</h3></div>
            <div className="divide-y divide-gray-100">
              {(mostRead || []).map((book: any) => (
                <div key={book.rank} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center"><span className="text-sm font-bold text-indigo-600">{book.rank}</span></div>
                  <div className="flex-1"><p className="text-sm font-medium text-gray-900">{book.title}</p><p className="text-xs text-gray-500">by {book.author}</p></div>
                  <span className="text-sm text-gray-600">{book.issues} issues</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

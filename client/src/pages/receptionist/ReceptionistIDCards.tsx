import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  CreditCard,
  Search,
  RefreshCw,
  Printer,
  User,
  AlertCircle,
} from 'lucide-react'

export function ReceptionistIDCards() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''

  const { data: cardsData, isLoading, error, refetch } = useQuery({
    queryKey: ['receptionist-id-cards', search],
    queryFn: async () => {
      const res = await api.get('/receptionist/id-cards', { params: { search } })
      return res.data
    },
  })

  const students = cardsData?.data?.students || cardsData?.data || cardsData || []

  const handlePrint = (student: any) => {
    alert(
      `Print ID Card\n\n` +
      `Name: ${student.name || student.firstName}\n` +
      `Roll No: ${student.rollNumber || student.admissionNumber || 'N/A'}\n` +
      `Class: ${student.className || student.class || 'N/A'}\n` +
      `Department: ${student.department || 'N/A'}\n\n` +
      `Print functionality will be implemented with PDF generation.`
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6" /> ID Card Management
          </h1>
          <p className="text-slate-400 text-sm">Generate and print student ID cards</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll number, or class..."
            value={search}
            onChange={(e) => setSearchParams({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">Failed to load student data.</p>
          <button onClick={() => refetch()} className="text-sm text-red-400 underline hover:text-red-300">
            Retry
          </button>
        </div>
      )}

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-700 rounded w-24 mb-2" />
                  <div className="h-3 bg-slate-700 rounded w-32 mb-1" />
                  <div className="h-3 bg-slate-700 rounded w-20" />
                </div>
              </div>
            </div>
          ))
        ) : students.length === 0 ? (
          <div className="col-span-full bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-500" />
            <p className="text-slate-300 text-lg">No students found</p>
            <p className="text-slate-500 text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          students.map((student: any) => (
            <div
              key={student.id}
              className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-indigo-500/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Photo Placeholder */}
                <div className="w-16 h-16 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center shrink-0 overflow-hidden">
                  {student.photo || student.photoUrl ? (
                    <img
                      src={student.photo || student.photoUrl}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-500" />
                  )}
                </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">
                    {student.name || student.firstName}
                    {student.lastName ? ` ${student.lastName}` : ''}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Roll No: {student.rollNumber || student.admissionNumber || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-400">
                    Class: {student.className || student.class || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-400">
                    Dept: {student.department || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Print Button */}
              <div className="mt-4 pt-3 border-t border-slate-700">
                <button
                  onClick={() => handlePrint(student)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600/15 text-indigo-400 rounded-lg hover:bg-indigo-600/25 text-sm font-medium transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print ID Card
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ReceptionistIDCards

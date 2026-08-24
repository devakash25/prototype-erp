import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw, Users, CheckCircle, XCircle, Clock, Award, BookOpen,
} from 'lucide-react'

export function HodFaculty() {
  const { data: facultyData, loading, error, refetch } = useApi<any>('/hod/faculty')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  const facultyList = facultyData?.faculty || []
  const presentToday = facultyList.filter((f: any) => f.todayStatus === 'present').length
  const absentToday = facultyList.filter((f: any) => f.todayStatus === 'absent').length
  const onLeave = facultyList.filter((f: any) => f.todayStatus === 'leave').length

  const summaryCards = [
    { label: 'Total Faculty', value: facultyData?.totalFaculty || facultyList.length, icon: Users, color: 'bg-blue-50 border-blue-100', iconColor: 'text-blue-600' },
    { label: 'Present Today', value: presentToday, icon: CheckCircle, color: 'bg-green-50 border-green-100', iconColor: 'text-green-600' },
    { label: 'Absent', value: absentToday, icon: XCircle, color: 'bg-red-50 border-red-100', iconColor: 'text-red-600' },
    { label: 'On Leave', value: onLeave, icon: Clock, color: 'bg-amber-50 border-amber-100', iconColor: 'text-amber-600' },
  ]

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      leave: 'bg-amber-100 text-amber-800',
    }
    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', styles[status] || 'bg-gray-100 text-gray-800')}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty List</h1>
          <p className="text-gray-500 text-sm mt-1">Department faculty members & today's status</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={cn('rounded-xl border p-5', card.color)}>
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg bg-white flex items-center justify-center', card.iconColor)}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Faculty</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Designation</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Qualification</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Experience</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Today Status</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Pending Leaves</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Classes Today</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Performance</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No faculty members found
                  </td>
                </tr>
              )}
              {facultyList.map((f: any, i: number) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700">
                        {f.name?.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <span className="font-medium text-gray-900">{f.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{f.designation}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{f.qualification || '-'}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{f.experience || '-'}</td>
                  <td className="py-3 px-4 text-center">{statusBadge(f.todayStatus)}</td>
                  <td className="py-3 px-4 text-center">
                    {f.pendingLeaves > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {f.pendingLeaves}
                      </span>
                    ) : (
                      <span className="text-gray-500">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">{f.classesToday || 0}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      'text-sm font-medium',
                      f.performanceScore >= 75 ? 'text-green-600' :
                      f.performanceScore >= 50 ? 'text-amber-600' :
                      'text-red-600'
                    )}>
                      {f.performanceScore || 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

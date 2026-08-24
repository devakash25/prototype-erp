import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw, Users, TrendingUp, BarChart3,
} from 'lucide-react'

export function HodFacultyWorkload() {
  const { data: workload, loading, error, refetch } = useApi<any>('/hod/faculty/workload')

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

  const facultyList = workload?.faculty || []
  const avgUtilization = facultyList.length > 0
    ? Math.round(facultyList.reduce((sum: number, f: any) => sum + (f.utilization || 0), 0) / facultyList.length)
    : 0

  const getUtilizationColor = (pct: number) => {
    if (pct < 50) return 'bg-red-500'
    if (pct <= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getUtilizationTextColor = (pct: number) => {
    if (pct < 50) return 'text-red-600'
    if (pct <= 80) return 'text-amber-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Workload</h1>
          <p className="text-gray-500 text-sm mt-1">Workload distribution across department faculty</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{workload?.totalFaculty || facultyList.length}</p>
              <p className="text-xs text-gray-500">Total Faculty</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className={cn('text-2xl font-bold', getUtilizationTextColor(avgUtilization))}>{avgUtilization}%</p>
              <p className="text-xs text-gray-500">Average Utilization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workload Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Workload Distribution</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Faculty Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Designation</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Subjects</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Classes/Week</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Hours/Week</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No workload data available
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
                  <td className="py-3 px-4 text-center text-gray-700">{f.subjects || 0}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{f.classesPerWeek || 0}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{f.hoursPerWeek || 0}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', getUtilizationColor(f.utilization || 0))}
                          style={{ width: `${Math.min(f.utilization || 0, 100)}%` }}
                        />
                      </div>
                      <span className={cn('text-sm font-medium w-12 text-right', getUtilizationTextColor(f.utilization || 0))}>
                        {f.utilization || 0}%
                      </span>
                    </div>
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

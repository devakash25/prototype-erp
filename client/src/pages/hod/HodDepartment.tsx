import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw, Building2, BookOpen, Users, GraduationCap, ChevronRight,
} from 'lucide-react'

export function HodDepartment() {
  const { data: department, loading, error, refetch } = useApi<any>('/hod/department')

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

  if (!department) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">No department data available</p>
      </div>
    )
  }

  const stats = [
    { label: 'Courses', value: department.courses || 0, icon: BookOpen, color: 'bg-blue-50 border-blue-100', iconColor: 'text-blue-600' },
    { label: 'Subjects', value: department.subjects || 0, icon: GraduationCap, color: 'bg-purple-50 border-purple-100', iconColor: 'text-purple-600' },
    { label: 'Students', value: department.students || 0, icon: Users, color: 'bg-green-50 border-green-100', iconColor: 'text-green-600' },
    { label: 'Faculty', value: department.faculty || 0, icon: Users, color: 'bg-amber-50 border-amber-100', iconColor: 'text-amber-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Your department details and structure</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Department Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-7 h-7 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{department.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Code: {department.code}</p>
            {department.description && (
              <p className="text-sm text-gray-600 mt-2">{department.description}</p>
            )}
            {department.head && (
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">Head:</span> {department.head}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={cn('rounded-xl border p-5', stat.color)}>
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg bg-white flex items-center justify-center', stat.iconColor)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course List */}
      {department.courseList?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Courses</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Course Name</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Subjects</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Duration</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Students</th>
                </tr>
              </thead>
              <tbody>
                {department.courseList.map((course: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="font-medium text-gray-900">{course.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">{course.subjectCount || 0}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{course.duration || '-'}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{course.students || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

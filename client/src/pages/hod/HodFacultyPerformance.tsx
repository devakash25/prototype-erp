import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw, Star, Award, TrendingUp, Users,
} from 'lucide-react'

export function HodFacultyPerformance() {
  const { data: performanceData, loading, error, refetch } = useApi<any>('/hod/faculty/performance')

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

  const facultyList = performanceData?.faculty || []
  const topPerformers = performanceData?.topPerformers || facultyList.filter((f: any) => (f.averageRating || 0) >= 4).slice(0, 5)

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating || 0)
    const hasHalf = (rating || 0) - fullStars >= 0.5
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-4 h-4',
              star <= fullStars ? 'text-amber-400 fill-amber-400' :
              star === fullStars + 1 && hasHalf ? 'text-amber-400 fill-amber-200' :
              'text-gray-200'
            )}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">{(rating || 0).toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Performance</h1>
          <p className="text-gray-500 text-sm mt-1">Rankings based on ratings and review scores</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Top Performers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPerformers.map((f: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-500">{f.designation}</p>
                  <div className="mt-1">{renderStars(f.averageRating)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Rankings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">#</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Designation</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Avg Rating</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Reviews</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Classes/Week</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No performance data available
                  </td>
                </tr>
              )}
              {facultyList.map((f: any, i: number) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-500">{i + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white',
                        i < 3 ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-indigo-100 text-indigo-700'
                      )}>
                        {f.name?.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <span className="font-medium text-gray-900">{f.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{f.designation}</td>
                  <td className="py-3 px-4 text-center">{renderStars(f.averageRating)}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{f.reviewCount || 0}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{f.classesPerWeek || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

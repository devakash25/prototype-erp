import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import {
  RefreshCw,
  User,
  GraduationCap,
  Users,
  Heart,
  BookOpen,
  Loader2,
  AlertCircle,
} from 'lucide-react'

export function ParentChildren() {
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeChildId = searchParams.get('childId') || ''

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-children'],
    queryFn: async () => {
      const res = await api.get('/parent/children')
      return res.data?.data ?? res.data
    },
  })

  const children = data?.children || data || []

  const handleSelectChild = (childId: string) => {
    setSearchParams({ childId })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-400">Failed to load children data</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-gray-400">
        <User className="h-12 w-12" />
        <p className="text-lg">No children linked to your account</p>
        <p className="text-sm">Contact administration to link your children</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Children</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Overview of all your children
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {children.map((child: any) => (
          <div
            key={child.id}
            onClick={() => handleSelectChild(child.id)}
            className={`bg-white dark:bg-gray-800 rounded-xl border p-6 shadow-sm cursor-pointer transition-all hover:shadow-md ${
              activeChildId === child.id
                ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                {child.fullName?.[0] || child.name?.[0] || '?'}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {child.fullName || child.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Roll No: {child.rollNumber || '—'}
                </p>
              </div>
              {activeChildId === child.id && (
                <span className="ml-auto px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  Active
                </span>
              )}
            </div>

            <div className="space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  {child.class?.name || child.class || '—'} — Section {child.section || '—'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  {child.department?.name || child.department || '—'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  Blood Group: {child.bloodGroup || '—'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  Coordinator: {child.coordinator?.fullName || child.coordinator || '—'}
                </span>
              </div>
              {child.mentor && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Mentor: {child.mentor?.fullName || child.mentor}
                  </span>
                </div>
              )}
              {child.academicSession && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Session: {child.academicSession}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

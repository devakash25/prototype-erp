import { useApi } from '@/hooks/useApi'
import { RefreshCw, FileText, CheckCircle, BookOpen, Clock } from 'lucide-react'

export function HodLMS() {
  const { data, loading, error, refetch } = useApi<any>('/hod/lms')

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
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Retry
        </button>
      </div>
    )
  }

  const stats = [
    {
      label: 'Assignments',
      value: data?.assignments || 0,
      icon: FileText,
      color: 'blue',
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      valueText: 'text-blue-700',
    },
    {
      label: 'Submissions',
      value: data?.submissions || 0,
      icon: CheckCircle,
      color: 'green',
      bg: 'bg-green-100',
      text: 'text-green-600',
      valueText: 'text-green-700',
    },
    {
      label: 'Study Materials',
      value: data?.materials || data?.studyMaterials || 0,
      icon: BookOpen,
      color: 'purple',
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      valueText: 'text-purple-700',
    },
    {
      label: 'Pending Evaluations',
      value: data?.pendingEvaluation || data?.pendingEvaluations || 0,
      icon: Clock,
      color: 'amber',
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      valueText: 'text-amber-700',
    },
  ]

  const breakdown = data?.breakdown || data?.recent || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Management</h1>
          <p className="text-gray-500 text-sm">Assignments, materials & evaluation progress</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.text}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${stat.valueText}`}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {Array.isArray(breakdown) && breakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Breakdown</h2>
          <div className="space-y-3">
            {breakdown.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-sm font-medium text-gray-900">{item.name || item.subject || item.title}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {item.count !== undefined && (
                    <span className="text-gray-600">{item.count} items</span>
                  )}
                  {item.pending !== undefined && (
                    <span className="text-amber-600">{item.pending} pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(breakdown) && breakdown.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No breakdown data available</p>
        </div>
      )}
    </div>
  )
}

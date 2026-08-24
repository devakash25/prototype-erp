import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  FileText,
  Video,
  StickyNote,
  Book,
  Download,
  Search,
  Filter,
} from 'lucide-react'

const typeConfig: Record<string, { icon: any; color: string }> = {
  PDF: { icon: FileText, color: 'text-red-600 bg-red-50' },
  VIDEO: { icon: Video, color: 'text-blue-600 bg-blue-50' },
  NOTE: { icon: StickyNote, color: 'text-yellow-600 bg-yellow-50' },
  BOOK: { icon: Book, color: 'text-green-600 bg-green-50' },
}

export function StudentMaterials() {
  const [subjectFilter, setSubjectFilter] = useState('all')
  const { data: materials, loading, error, refetch } = useApi<any[]>('/student/study-materials')

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
        <p className="text-red-500">{error}</p>
        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
          Retry
        </button>
      </div>
    )
  }

  const items = materials || []
  const subjects = [...new Set(items.map((m: any) => m.subject?.name).filter(Boolean))]
  const filtered = subjectFilter === 'all' ? items : items.filter((m: any) => m.subject?.name === subjectFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
          <p className="text-gray-500 text-sm">Access your course materials and resources</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Filter by subject:</span>
          </div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} materials</span>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Search className="w-12 h-12 mb-3 text-gray-300" />
            <p>No study materials found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Uploaded</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((mat: any, idx: number) => {
                  const cfg = typeConfig[mat.type] || typeConfig.PDF
                  const Icon = cfg.icon
                  return (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">{mat.title}</p>
                        {mat.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{mat.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{mat.subject?.name || '—'}</p>
                          <p className="text-xs text-gray-500">{mat.subject?.code || ''}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full', cfg.color)}>
                          <Icon className="w-3 h-3" />
                          {mat.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {mat.createdAt
                          ? new Date(mat.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {mat.fileUrl ? (
                          <a
                            href={mat.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

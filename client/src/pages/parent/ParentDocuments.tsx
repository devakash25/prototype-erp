import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import {
  RefreshCw,
  Download,
  FileText,
  CreditCard,
  Award,
  BookOpen,
  GraduationCap,
  FileCheck,
  AlertCircle,
  FolderOpen,
  File,
} from 'lucide-react'

const documentCategories = [
  { id: 'admission', label: 'Admission Letter', icon: FileText, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  { id: 'id-card', label: 'ID Card', icon: CreditCard, color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  { id: 'fee-receipts', label: 'Fee Receipts', icon: FileCheck, color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
  { id: 'report-cards', label: 'Report Cards', icon: BookOpen, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  { id: 'bonafide', label: 'Bonafide Certificate', icon: Award, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { id: 'character', label: 'Character Certificate', icon: Award, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  { id: 'transfer', label: 'Transfer Certificate', icon: FileText, color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  { id: 'transcripts', label: 'Academic Transcripts', icon: GraduationCap, color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
]

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ParentDocuments() {
  const [searchParams] = useSearchParams()
  const childId = searchParams.get('childId') || ''

  const { data: documentsData, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-documents', childId],
    queryFn: async () => {
      const res = await api.get(`/parent/documents?childId=${childId}`)
      return res.data
    },
    enabled: !!childId,
  })

  if (!childId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-lg text-gray-500 dark:text-gray-400">Select a child to view documents</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600 dark:text-gray-400">Failed to load documents</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const documents = documentsData?.documents || []
  const studentInfo = documentsData?.studentInfo || {}

  const handleDownload = (doc: any) => {
    if (doc.fileUrl || doc.url) {
      const link = window.document.createElement('a')
      link.href = doc.fileUrl || doc.url
      link.target = '_blank'
      link.download = doc.name || 'document'
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
    } else {
      window.alert('Document file not available for download.')
    }
  }

  const getDocsByCategory = (categoryId: string) => {
    return documents.filter((d: any) => d.category === categoryId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Digital Document Vault</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Access and download institutional documents</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Student Info */}
      {studentInfo.name && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Student Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Name</p>
              <p className="font-medium text-gray-900 dark:text-white">{studentInfo.name}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Admission No</p>
              <p className="font-medium text-gray-900 dark:text-white">{studentInfo.admissionNumber}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Class</p>
              <p className="font-medium text-gray-900 dark:text-white">{studentInfo.className}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Section</p>
              <p className="font-medium text-gray-900 dark:text-white">{studentInfo.section}</p>
            </div>
          </div>
        </div>
      )}

      {/* Document Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {documentCategories.map((cat) => {
          const catDocs = getDocsByCategory(cat.id)
          const CatIcon = cat.icon
          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg shrink-0 ${cat.color}`}>
                  <CatIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">{cat.label}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {catDocs.length} document{catDocs.length !== 1 ? 's' : ''} available
                  </p>
                  {catDocs.length > 0 ? (
                    <div className="space-y-2">
                      {catDocs.map((doc: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-750 rounded-lg">
                          <div className="flex items-center gap-2 min-w-0">
                            <File className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{doc.name}</p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(doc.date)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded shrink-0"
                          >
                            <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownload({ name: cat.label, category: cat.id })}
                      className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* All Documents Table */}
      {documents.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Documents</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Document</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {documents.map((doc: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{doc.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{doc.category?.replace('-', ' ')}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(doc.date)}</td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          <strong>Note:</strong> Documents are generated based on institutional records.
          If you need corrections, please submit a request through the complaint system.
        </p>
      </div>
    </div>
  )
}

import { useApi } from '@/hooks/useApi'
import { RefreshCw, Download, FileText, CreditCard, Award, BookOpen, GraduationCap, FileCheck } from 'lucide-react'

const documentTypes = [
  { id: 'admission', label: 'Admission Letter', icon: FileText, color: 'bg-blue-50 text-blue-600' },
  { id: 'id-card', label: 'Student ID Card', icon: CreditCard, color: 'bg-green-50 text-green-600' },
  { id: 'bonafide', label: 'Bonafide Certificate', icon: Award, color: 'bg-purple-50 text-purple-600' },
  { id: 'character', label: 'Character Certificate', icon: BookOpen, color: 'bg-amber-50 text-amber-600' },
  { id: 'transcript', label: 'Academic Transcript', icon: GraduationCap, color: 'bg-indigo-50 text-indigo-600' },
  { id: 'receipts', label: 'Fee Receipts', icon: FileCheck, color: 'bg-teal-50 text-teal-600' },
]

export function StudentDocuments() {
  const { data: profile, loading, error, refetch } = useApi<any>('/student/profile')

  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-4"><p className="text-red-500">{error}</p><button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button></div>

  const p = profile || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Digital Documents</h1>
        <p className="text-gray-500 text-sm">Access and download your institutional documents</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Student Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><p className="text-gray-500">Name</p><p className="font-medium text-gray-900">{p.personal?.name}</p></div>
          <div><p className="text-gray-500">Admission No</p><p className="font-medium text-gray-900">{p.personal?.admissionNumber}</p></div>
          <div><p className="text-gray-500">Course</p><p className="font-medium text-gray-900">{p.academic?.course}</p></div>
          <div><p className="text-gray-500">Department</p><p className="font-medium text-gray-900">{p.academic?.department}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentTypes.map((doc) => (
          <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${doc.color}`}>
                <doc.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{doc.label}</h3>
                <p className="text-xs text-gray-500 mb-3">
                  {doc.id === 'admission' && `Admission letter for ${p.academic?.course || 'your course'}`}
                  {doc.id === 'id-card' && `Student ID: ${p.personal?.admissionNumber || 'N/A'}`}
                  {doc.id === 'bonafide' && 'Certificate of enrollment'}
                  {doc.id === 'character' && 'Character and conduct certificate'}
                  {doc.id === 'transcript' && 'Academic records and grades'}
                  {doc.id === 'receipts' && 'Fee payment receipts'}
                </p>
                <button className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                  <Download className="w-3.5 h-3.5" />Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-700">
          <strong>Note:</strong> Documents are generated based on your institutional records.
          If you need corrections, please submit a request through the Helpdesk.
        </p>
      </div>
    </div>
  )
}

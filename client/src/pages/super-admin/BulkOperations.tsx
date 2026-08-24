import { useState, useRef } from 'react'
import { Upload, Download, FileText, Users, GraduationCap, DollarSign, CheckCircle, RefreshCw, AlertTriangle, File, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/services/api'

const importTypes = [
  { key: 'students', label: 'Students', icon: GraduationCap, color: 'bg-blue-100 text-blue-600', accept: '.csv' },
  { key: 'faculty', label: 'Faculty/Staff', icon: Users, color: 'bg-purple-100 text-purple-600', accept: '.csv' },
  { key: 'fee-assignments', label: 'Fee Assignments', icon: DollarSign, color: 'bg-green-100 text-green-600', accept: '.csv' },
  { key: 'announcements', label: 'Announcements', icon: FileText, color: 'bg-amber-100 text-amber-600', accept: '.csv' },
]

const exportTypes = [
  { key: 'students', label: 'Student List', icon: GraduationCap, color: 'bg-blue-100 text-blue-600', description: 'All or filtered students' },
  { key: 'faculty', label: 'Faculty List', icon: Users, color: 'bg-purple-100 text-purple-600', description: 'All faculty and staff' },
  { key: 'fee-collection', label: 'Fee Collection Data', icon: DollarSign, color: 'bg-green-100 text-green-600', description: 'Payment records and summaries' },
  { key: 'attendance', label: 'Attendance Records', icon: FileText, color: 'bg-amber-100 text-amber-600', description: 'Student attendance logs' },
  { key: 'exam-results', label: 'Exam Results', icon: File, color: 'bg-red-100 text-red-600', description: 'All exam scores and grades' },
]

interface ImportState {
  file: File | null
  uploading: boolean
  progress: number
  result: { success: boolean; message: string } | null
}

interface ExportState {
  format: 'csv' | 'xlsx'
  exporting: boolean
}

export function BulkOperations() {
  const [importStates, setImportStates] = useState<Record<string, ImportState>>({})
  const [exportStates, setExportStates] = useState<Record<string, ExportState>>({
    students: { format: 'csv', exporting: false },
    faculty: { format: 'csv', exporting: false },
    'fee-collection': { format: 'csv', exporting: false },
    attendance: { format: 'csv', exporting: false },
    'exam-results': { format: 'csv', exporting: false },
  })
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleFileSelect = (type: string, file: File | null) => {
    setImportStates((prev) => ({
      ...prev,
      [type]: { ...prev[type], file, uploading: false, progress: 0, result: null },
    }))
  }

  const handleUpload = async (type: string) => {
    const state = importStates[type]
    if (!state?.file) return

    setImportStates((prev) => ({
      ...prev,
      [type]: { ...prev[type], uploading: true, progress: 0, result: null },
    }))

    try {
      const formData = new FormData()
      formData.append('file', state.file)

      await api.post(`/bulk/import/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          const progress = event.total ? Math.round((event.loaded * 100) / event.total) : 0
          setImportStates((prev) => ({
            ...prev,
            [type]: { ...prev[type], progress },
          }))
        },
      })

      setImportStates((prev) => ({
        ...prev,
        [type]: { file: null, uploading: false, progress: 100, result: { success: true, message: 'Import completed successfully' } },
      }))

      if (fileInputRefs.current[type]) {
        fileInputRefs.current[type]!.value = ''
      }
    } catch (err: any) {
      setImportStates((prev) => ({
        ...prev,
        [type]: { ...prev[type], uploading: false, progress: 0, result: { success: false, message: err.response?.data?.error?.message || 'Import failed' } },
      }))
    }
  }

  const handleDownloadTemplate = async (type: string) => {
    try {
      const response = await api.get(`/bulk/template/${type}`, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${type}_template.csv`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to download template')
    }
  }

  const handleExport = async (type: string) => {
    const state = exportStates[type]
    if (!state) return

    setExportStates((prev) => ({
      ...prev,
      [type]: { ...prev[type], exporting: true },
    }))

    try {
      const response = await api.get(`/bulk/export/${type}`, {
        params: { format: state.format },
        responseType: 'blob',
      })
      const ext = state.format === 'xlsx' ? 'xlsx' : 'csv'
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${type}_export.${ext}`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Export failed')
    }

    setExportStates((prev) => ({
      ...prev,
      [type]: { ...prev[type], exporting: false },
    }))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Operations</h1>
        <p className="text-sm text-gray-500">Import and export data in bulk via CSV or Excel files</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Upload className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Import Data</h2>
            <p className="text-sm text-gray-500">Upload CSV files to bulk import data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {importTypes.map(({ key, label, icon: Icon, color, accept }) => {
            const state = importStates[key] || { file: null, uploading: false, progress: 0, result: null }

            return (
              <div key={key} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn('p-2 rounded-lg', color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{label}</h3>
                    <p className="text-xs text-gray-500">Import {label.toLowerCase()} from CSV</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-lg p-4 text-center transition-colors',
                      state.file ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {state.file ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">{state.file.name}</span>
                        <button
                          onClick={() => handleFileSelect(key, null)}
                          className="text-gray-400 hover:text-gray-600 ml-1"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <input
                          ref={(el) => { fileInputRefs.current[key] = el }}
                          type="file"
                          accept={accept}
                          className="hidden"
                          onChange={(e) => handleFileSelect(key, e.target.files?.[0] || null)}
                        />
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm text-gray-600">Click to select a CSV file</p>
                      </label>
                    )}
                  </div>

                  {state.uploading && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Uploading...</span>
                        <span>{state.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${state.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {state.result && (
                    <div className={cn(
                      'flex items-center gap-2 p-2 rounded-lg text-sm',
                      state.result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    )}>
                      {state.result.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      {state.result.message}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadTemplate(key)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Template
                    </button>
                    <button
                      onClick={() => handleUpload(key)}
                      disabled={!state.file || state.uploading}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {state.uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {state.uploading ? 'Uploading...' : 'Upload & Process'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Download className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
            <p className="text-sm text-gray-500">Download data in CSV or Excel format</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportTypes.map(({ key, label, icon: Icon, color, description }) => {
            const state = exportStates[key] || { format: 'csv', exporting: false }

            return (
              <div key={key} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn('p-2 rounded-lg', color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{label}</h3>
                    <p className="text-xs text-gray-500">{description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <select
                    value={state.format}
                    onChange={(e) => setExportStates((prev) => ({
                      ...prev,
                      [key]: { ...prev[key], format: e.target.value as 'csv' | 'xlsx' },
                    }))}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="csv">CSV</option>
                    <option value="xlsx">Excel (.xlsx)</option>
                  </select>
                </div>

                <button
                  onClick={() => handleExport(key)}
                  disabled={state.exporting}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {state.exporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {state.exporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BulkOperations

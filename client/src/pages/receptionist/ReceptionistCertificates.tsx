import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  FileCheck,
  Plus,
  Search,
  RefreshCw,
  X,
  Loader2,
  CheckCircle2,
  Printer,
  Download,
} from 'lucide-react'

const CERTIFICATE_TYPES = [
  { value: 'BONAFIDE', label: 'Bonafide Certificate' },
  { value: 'TRANSFER', label: 'Transfer Certificate' },
  { value: 'CHARACTER', label: 'Character Certificate' },
  { value: 'ID_CARD', label: 'ID Card' },
  { value: 'ADMITTING', label: 'Admitting Letter' },
]

export function ReceptionistCertificates() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    studentId: '',
    certificateType: 'BONAFIDE',
    purpose: '',
  })

  const qc = useQueryClient()

  const { data: certificatesData, isLoading, error, refetch } = useQuery({
    queryKey: ['receptionist-certificates', search],
    queryFn: async () => {
      const res = await api.get('/receptionist/certificates', { params: { search } })
      return res.data
    },
  })

  const { data: studentsData } = useQuery({
    queryKey: ['receptionist-students-list'],
    queryFn: async () => {
      const res = await api.get('/receptionist/students')
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/receptionist/certificates', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receptionist-certificates'] })
      setShowModal(false)
      setForm({ studentId: '', certificateType: 'BONAFIDE', purpose: '' })
    },
  })

  const certificates = certificatesData?.data?.certificates || certificatesData?.data || certificatesData || []
  const students = studentsData?.data?.students || studentsData?.data || studentsData || []

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'generated': case 'ready': return 'bg-green-500/15 text-green-400'
      case 'pending': case 'processing': return 'bg-yellow-500/15 text-yellow-400'
      case 'delivered': case 'issued': return 'bg-blue-500/15 text-blue-400'
      case 'cancelled': return 'bg-red-500/15 text-red-400'
      default: return 'bg-slate-500/15 text-slate-400'
    }
  }

  const handleSubmit = () => {
    if (!form.studentId || !form.certificateType) return
    createMutation.mutate(form)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6" /> Certificate Generation
          </h1>
          <p className="text-slate-400 text-sm">Generate and manage student certificates</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            Generate Certificate
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or certificate type..."
            value={search}
            onChange={(e) => setSearchParams({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <p className="text-sm text-red-400">Failed to load certificates.</p>
          <button onClick={() => refetch()} className="text-sm text-red-400 underline hover:text-red-300">
            Retry
          </button>
        </div>
      )}

      {/* Certificates Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Student</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Certificate Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Purpose</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-indigo-500" />
                    Loading certificates...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <FileCheck className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                    No certificates found
                  </td>
                </tr>
              ) : (
                certificates.map((cert: any) => (
                  <tr key={cert.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-green-400">
                            {cert.studentName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                          </span>
                        </div>
                        <div>
                          <span className="text-white font-medium">{cert.studentName || 'N/A'}</span>
                          {cert.admissionNumber && (
                            <p className="text-xs text-slate-500">{cert.admissionNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-slate-300">
                        {CERTIFICATE_TYPES.find(t => t.value === cert.certificateType)?.label || cert.certificateType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 max-w-[200px] truncate">{cert.purpose || '-'}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', getStatusColor(cert.status))}>
                        {cert.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {new Date(cert.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(cert.status?.toLowerCase() === 'generated' || cert.status?.toLowerCase() === 'ready') && (
                          <button
                            onClick={() => alert('Print functionality will be implemented with PDF generation.')}
                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                            title="Print"
                          >
                            <Printer className="w-4 h-4 text-slate-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Certificate Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => !createMutation.isPending && setShowModal(false)} />
          <div className="relative bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Generate Certificate</h2>
              <button
                onClick={() => !createMutation.isPending && setShowModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {createMutation.isSuccess ? (
              <div className="flex flex-col items-center py-6">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <p className="text-lg font-semibold text-white">Certificate Generated!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Student *</label>
                  <select
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={createMutation.isPending}
                  >
                    <option value="">Select a student</option>
                    {students.map((student: any) => (
                      <option key={student.id} value={student.id}>
                        {student.name || student.firstName} {student.lastName || ''} ({student.admissionNumber || student.rollNumber || ''})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Certificate Type *</label>
                  <select
                    value={form.certificateType}
                    onChange={(e) => setForm({ ...form, certificateType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={createMutation.isPending}
                  >
                    {CERTIFICATE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Purpose</label>
                  <input
                    type="text"
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="e.g. Bank loan, passport application"
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={createMutation.isPending}
                  />
                </div>

                {createMutation.isError && (
                  <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">
                    {(createMutation.error as any)?.response?.data?.message || 'Failed to generate certificate'}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || !form.studentId}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      Generate Certificate
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReceptionistCertificates

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  Phone,
  Plus,
  Search,
  RefreshCw,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react'

export function ReceptionistPhoneLogs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    callerName: '',
    phone: '',
    purpose: '',
    calledPerson: '',
    notes: '',
  })

  const qc = useQueryClient()

  const { data: logsData, isLoading, error, refetch } = useQuery({
    queryKey: ['receptionist-phone-logs', search],
    queryFn: async () => {
      const res = await api.get('/receptionist/phone-logs', { params: { search } })
      return res.data?.data ?? res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/receptionist/phone-logs', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receptionist-phone-logs'] })
      setShowModal(false)
      setForm({ callerName: '', phone: '', purpose: '', calledPerson: '', notes: '' })
    },
  })

  const logs = logsData?.data?.logs || logsData?.data?.phoneLogs || logsData?.data || logsData || []

  const handleSubmit = () => {
    if (!form.callerName || !form.phone || !form.purpose) return
    createMutation.mutate(form)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Phone className="w-6 h-6" /> Phone Enquiry Logs
          </h1>
          <p className="text-slate-400 text-sm">Track all phone enquiries and call logs</p>
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
            Log Call
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by caller name, phone, or purpose..."
            value={search}
            onChange={(e) => setSearchParams({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <p className="text-sm text-red-400">Failed to load phone logs.</p>
          <button onClick={() => refetch()} className="text-sm text-red-400 underline hover:text-red-300">
            Retry
          </button>
        </div>
      )}

      {/* Phone Logs Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Caller</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Phone</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Purpose</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Called Person</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Notes</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-indigo-500" />
                    Loading phone logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Phone className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                    No phone logs found
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/15 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-cyan-400" />
                        </div>
                        <span className="text-white font-medium">{log.callerName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-300">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {log.phone}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-300">{log.purpose}</td>
                    <td className="px-5 py-3 text-slate-300">{log.calledPerson}</td>
                    <td className="px-5 py-3 text-slate-400 max-w-[200px] truncate">{log.notes || '-'}</td>
                    <td className="px-5 py-3 text-slate-400">
                      {new Date(log.createdAt || log.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Phone Enquiry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => !createMutation.isPending && setShowModal(false)} />
          <div className="relative bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Log Phone Enquiry</h2>
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
                <p className="text-lg font-semibold text-white">Call Logged Successfully!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Caller Name *</label>
                  <input
                    type="text"
                    value={form.callerName}
                    onChange={(e) => setForm({ ...form, callerName: e.target.value })}
                    placeholder="Enter caller's name"
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={createMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={createMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Purpose *</label>
                  <input
                    type="text"
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="e.g. Admission inquiry, Fee details"
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={createMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Called Person</label>
                  <input
                    type="text"
                    value={form.calledPerson}
                    onChange={(e) => setForm({ ...form, calledPerson: e.target.value })}
                    placeholder="Staff member called"
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={createMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Optional notes about the call"
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    disabled={createMutation.isPending}
                  />
                </div>

                {createMutation.isError && (
                  <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">
                    {(createMutation.error as any)?.response?.data?.message || 'Failed to log call'}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || !form.callerName || !form.phone || !form.purpose}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging...
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4" />
                      Log Call
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

export default ReceptionistPhoneLogs

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  X,
  Loader2,
  CheckCircle2,
  Phone,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

export function ReceptionistVisitors() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    visitorName: '',
    purpose: '',
    personToMeet: '',
    phone: '',
    notes: '',
  })

  const qc = useQueryClient()

  const { data: visitorsData, isLoading, error, refetch } = useQuery({
    queryKey: ['receptionist-visitors', search],
    queryFn: async () => {
      const res = await api.get('/receptionist/visitors', { params: { search } })
      return res.data?.data ?? res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/receptionist/visitors', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receptionist-visitors'] })
      setShowModal(false)
      setForm({ visitorName: '', purpose: '', personToMeet: '', phone: '', notes: '' })
    },
  })

  const visitors = visitorsData?.data?.visitors || visitorsData?.data || visitorsData || []

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'IN': return 'bg-green-500/15 text-green-400'
      case 'OUT': return 'bg-slate-500/15 text-slate-400'
      case 'EXPECTED': return 'bg-blue-500/15 text-blue-400'
      default: return 'bg-slate-500/15 text-slate-400'
    }
  }

  const handleSubmit = () => {
    if (!form.visitorName || !form.purpose || !form.personToMeet) return
    createMutation.mutate(form)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6" /> Visitor Management
          </h1>
          <p className="text-slate-400 text-sm">Track and manage all visitors</p>
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
            Log Visitor
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, purpose, or person..."
            value={search}
            onChange={(e) => setSearchParams({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <p className="text-sm text-red-400">Failed to load visitors.</p>
          <button onClick={() => refetch()} className="text-sm text-red-400 underline hover:text-red-300">
            Retry
          </button>
        </div>
      )}

      {/* Visitors Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Visitor</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Purpose</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Person to Meet</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Phone</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">In Time</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Out Time</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-indigo-500" />
                    Loading visitors...
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                    No visitors found
                  </td>
                </tr>
              ) : (
                visitors.map((visitor: any) => (
                  <tr key={visitor.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-blue-400">
                            {visitor.visitorName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-white font-medium">{visitor.visitorName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-300">{visitor.purpose}</td>
                    <td className="px-5 py-3 text-slate-300">{visitor.personToMeet}</td>
                    <td className="px-5 py-3 text-slate-300">
                      {visitor.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {visitor.phone}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-5 py-3 text-slate-300">
                      {visitor.inTime
                        ? new Date(visitor.inTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="px-5 py-3 text-slate-300">
                      {visitor.outTime
                        ? new Date(visitor.outTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', getStatusColor(visitor.status))}>
                        {visitor.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Visitor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => !createMutation.isPending && setShowModal(false)} />
          <div className="relative bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Log Visitor</h2>
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
                <p className="text-lg font-semibold text-white">Visitor Logged Successfully!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Visitor Name *</label>
                  <input
                    type="text"
                    value={form.visitorName}
                    onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
                    placeholder="Enter visitor name"
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
                    placeholder="e.g. Admission inquiry, Parent meeting"
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={createMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Person to Meet *</label>
                  <input
                    type="text"
                    value={form.personToMeet}
                    onChange={(e) => setForm({ ...form, personToMeet: e.target.value })}
                    placeholder="Enter staff name"
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={createMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Optional phone number"
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={createMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Optional notes"
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    disabled={createMutation.isPending}
                  />
                </div>

                {createMutation.isError && (
                  <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">
                    {(createMutation.error as any)?.response?.data?.message || 'Failed to log visitor'}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || !form.visitorName || !form.purpose || !form.personToMeet}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Log Visitor
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

export default ReceptionistVisitors

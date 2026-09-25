import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import {
  RefreshCw,
  Home,
  User,
  Building2,
  BedDouble,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  Send,
  X,
} from 'lucide-react'

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'REJECTED':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

function getComplaintStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case 'OPEN':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'RESOLVED':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'CLOSED':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

export function ParentHostel() {
  const [searchParams] = useSearchParams()
  const childId = searchParams.get('childId') || ''
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [maintenanceForm, setMaintenanceForm] = useState({
    title: '',
    description: '',
    priority: 'NORMAL',
  })
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false)

  const { data: hostelData, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-hostel', childId],
    queryFn: async () => {
      const res = await api.get(`/parent/hostel?childId=${childId}`)
      return res.data?.data ?? res.data
    },
    enabled: !!childId,
  })

  const maintenanceMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post(`/parent/hostel/maintenance?childId=${childId}`, data)
      return res.data?.data ?? res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-hostel', childId] })
      setShowMaintenanceForm(false)
      setMaintenanceForm({ title: '', description: '', priority: 'NORMAL' })
    },
    onError: (err: any) => {
      window.alert(err.response?.data?.error?.message || 'Failed to submit maintenance request. Please try again.')
    },
  })

  if (!childId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-lg text-gray-500 dark:text-gray-400">Select a child to view hostel information</p>
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
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600 dark:text-gray-400">Failed to load hostel information</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const isHostelStudent = hostelData?.isHostelStudent
  const hostel = hostelData?.hostel || {}
  const warden = hostelData?.warden || {}
  const outPassHistory = hostelData?.outPassHistory || []
  const complaints = hostelData?.complaints || []
  const maintenanceRequests = hostelData?.maintenanceRequests || []
  const feeStatus = hostelData?.feeStatus || {}

  if (!isHostelStudent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hostel Information</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Your child's hostel accommodation details</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Home className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-lg text-gray-500 dark:text-gray-400">Student is not a hostel resident</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Contact administration for hostel allotment information
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hostel Information</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Your child's hostel accommodation details</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Hostel Info & Warden Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <Home className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hostel Details</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 py-3">
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Building2 className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hostel Block</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{hostel.block || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <BedDouble className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Room Number</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{hostel.roomNumber || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Building2 className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hostel Name</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{hostel.name || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <User className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Warden Information</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 py-3">
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Warden Name</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {warden.name || '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{warden.phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{warden.email || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hostel Fee Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hostel Fee Status</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Fee</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">₹{feeStatus.totalFee || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Paid Amount</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">₹{feeStatus.paidAmount || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending Amount</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">₹{feeStatus.pendingAmount || 0}</p>
          </div>
        </div>
      </div>

      {/* Out-Pass History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Out-Pass History</h2>
        </div>
        {outPassHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Clock className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No out-pass records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Out Time</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">In Time</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reason</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {outPassHistory.map((pass: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-900 dark:text-white">{formatDate(pass.date)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{pass.outTime || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{pass.inTime || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{pass.reason || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(pass.status)}`}>
                        {pass.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hostel Complaints */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hostel Complaints</h2>
        </div>
        {complaints.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No complaints filed</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {complaints.map((c: any, idx: number) => (
              <div key={idx} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg mt-1">
                      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{c.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{c.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{formatDate(c.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getComplaintStatusBadge(c.status)}`}>
                    {c.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance Requests */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Maintenance Requests</h2>
          <button
            onClick={() => setShowMaintenanceForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Send className="h-4 w-4" /> New Request
          </button>
        </div>
        {maintenanceRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Wrench className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No maintenance requests</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {maintenanceRequests.map((req: any, idx: number) => (
              <div key={idx} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg mt-1">
                      <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{req.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{req.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{formatDate(req.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getComplaintStatusBadge(req.status)}`}>
                    {req.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance Request Modal */}
      {showMaintenanceForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Maintenance Request</h2>
              <button onClick={() => setShowMaintenanceForm(false)}>
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                maintenanceMutation.mutate(maintenanceForm)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={maintenanceForm.title}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select
                  value={maintenanceForm.priority}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={maintenanceMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {maintenanceMutation.isPending ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

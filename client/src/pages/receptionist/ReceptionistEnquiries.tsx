import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  MessageSquare,
  Search,
  RefreshCw,
  X,
  Loader2,
  CheckCircle2,
  Phone,
  Mail,
  GraduationCap,
} from 'lucide-react'

export function ReceptionistEnquiries() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const [statusFilter, setStatusFilter] = useState('')

  const qc = useQueryClient()

  const { data: enquiriesData, isLoading, error, refetch } = useQuery({
    queryKey: ['receptionist-enquiries', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/receptionist/enquiries', { params: { search, status: statusFilter } })
      return res.data?.data ?? res.data
    },
  })

  const enquiries = enquiriesData?.data?.enquiries || enquiriesData?.data || enquiriesData || []

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-blue-500/15 text-blue-400'
      case 'contacted': return 'bg-yellow-500/15 text-yellow-400'
      case 'enrolled': return 'bg-green-500/15 text-green-400'
      case 'closed': return 'bg-slate-500/15 text-slate-400'
      default: return 'bg-slate-500/15 text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return <MessageSquare className="w-4 h-4" />
      case 'contacted': return <Phone className="w-4 h-4" />
      case 'enrolled': return <GraduationCap className="w-4 h-4" />
      case 'closed': return <CheckCircle2 className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'NEW', label: 'New' },
    { value: 'CONTACTED', label: 'Contacted' },
    { value: 'ENROLLED', label: 'Enrolled' },
    { value: 'CLOSED', label: 'Closed' },
  ]

  const stats = {
    total: enquiries.length,
    new: enquiries.filter((e: any) => e.status?.toLowerCase() === 'new').length,
    contacted: enquiries.filter((e: any) => e.status?.toLowerCase() === 'contacted').length,
    enrolled: enquiries.filter((e: any) => e.status?.toLowerCase() === 'enrolled').length,
    closed: enquiries.filter((e: any) => e.status?.toLowerCase() === 'closed').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6" /> Admission Enquiries
          </h1>
          <p className="text-slate-400 text-sm">Track and manage admission enquiries</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-white bg-slate-700/50' },
          { label: 'New', value: stats.new, color: 'text-blue-400 bg-blue-900/30' },
          { label: 'Contacted', value: stats.contacted, color: 'text-yellow-400 bg-yellow-900/30' },
          { label: 'Enrolled', value: stats.enrolled, color: 'text-green-400 bg-green-900/30' },
          { label: 'Closed', value: stats.closed, color: 'text-slate-400 bg-slate-700/50' },
        ].map((stat) => (
          <div key={stat.label} className={cn('rounded-xl border border-slate-700 p-4', stat.color)}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs opacity-75">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or course..."
            value={search}
            onChange={(e) => setSearchParams({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {statusFilters.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm transition-colors',
                statusFilter === s.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <p className="text-sm text-red-400">Failed to load enquiries.</p>
          <button onClick={() => refetch()} className="text-sm text-red-400 underline hover:text-red-300">
            Retry
          </button>
        </div>
      )}

      {/* Enquiries List */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-700 rounded w-32 mb-2" />
                  <div className="h-3 bg-slate-700 rounded w-48" />
                </div>
                <div className="h-6 bg-slate-700 rounded w-20" />
              </div>
            </div>
          ))
        ) : enquiries.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-500" />
            <p className="text-slate-300 text-lg">No enquiries found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          enquiries.map((enquiry: any) => (
            <div key={enquiry.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-orange-400">
                    {enquiry.studentName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">{enquiry.studentName || enquiry.name}</p>
                    <span className={cn('px-2.5 py-0.5 text-xs font-medium rounded-full flex items-center gap-1', getStatusColor(enquiry.status))}>
                      {getStatusIcon(enquiry.status)}
                      {enquiry.status || 'NEW'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                    {enquiry.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {enquiry.phone}
                      </span>
                    )}
                    {enquiry.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {enquiry.email}
                      </span>
                    )}
                    {enquiry.course && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {enquiry.course}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">
                    {new Date(enquiry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  {enquiry.source && (
                    <p className="text-xs text-slate-500 mt-1">Source: {enquiry.source}</p>
                  )}
                </div>
              </div>
              {enquiry.notes && (
                <p className="mt-3 text-sm text-slate-400 bg-slate-700/30 rounded-lg px-3 py-2">{enquiry.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ReceptionistEnquiries

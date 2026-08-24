import { useState, useEffect } from 'react'
import {
  Users, RefreshCw, Search, Phone, Mail, BadgeCheck,
  UserCheck, UserX, Calendar, ChevronDown, Send,
  Briefcase, FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/StatCard'
import api from '@/services/api'

export function TransportDrivers() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [attendanceForm, setAttendanceForm] = useState<Record<string, { status: string; notes: string }>>({})
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  useEffect(() => { loadData() }, [selectedDate])

  const loadData = async () => {
    setLoading(true)
    try {
      const [driversRes, attendanceRes] = await Promise.allSettled([
        api.get('/transport/drivers'),
        api.get(`/transport/drivers/attendance?date=${selectedDate}`),
      ])
      if (driversRes.status === 'fulfilled') setDrivers(driversRes.value.data || [])
      if (attendanceRes.status === 'fulfilled') {
        setAttendance(attendanceRes.value.data?.attendance || [])
        const driversList = attendanceRes.value.data?.drivers || []
        if (driversList.length > 0 && Object.keys(attendanceForm).length === 0) {
          const form: Record<string, { status: string; notes: string }> = {}
          driversList.forEach((d: any) => {
            const existing = (attendanceRes.value.data?.attendance || []).find((a: any) => a.driverId === d.id)
            form[d.id] = { status: existing?.status || '', notes: existing?.notes || '' }
          })
          setAttendanceForm(form)
        }
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleMarkAttendance = async (driverId: string) => {
    const form = attendanceForm[driverId]
    if (!form?.status) return
    setSubmittingId(driverId)
    try {
      await api.post('/transport/drivers/attendance', {
        driverId,
        date: selectedDate,
        status: form.status,
        notes: form.notes,
      })
      await loadData()
    } catch (err) {
      console.error(err)
    }
    setSubmittingId(null)
  }

  const getAttendanceStatus = (driverId: string) => {
    return attendance.find((a) => a.driverId === driverId)
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PRESENT':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'ABSENT':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'LEAVE':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const filteredDrivers = drivers.filter((d) => {
    const name = `${d.user?.firstName || ''} ${d.user?.lastName || ''}`.toLowerCase()
    return !searchQuery ||
      name.includes(searchQuery.toLowerCase()) ||
      d.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone?.includes(searchQuery)
  })

  const presentCount = attendance.filter((a) => a.status === 'PRESENT').length
  const absentCount = attendance.filter((a) => a.status === 'ABSENT').length
  const leaveCount = attendance.filter((a) => a.status === 'LEAVE').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Driver Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage drivers, attendance & assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Drivers" value={drivers.length} icon={Users} color="bg-blue-500" />
        <StatCard title="Present Today" value={presentCount} icon={UserCheck} color="bg-green-500" />
        <StatCard title="Absent Today" value={absentCount} icon={UserX} color="bg-red-500" />
        <StatCard title="On Leave" value={leaveCount} icon={Calendar} color="bg-yellow-500" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mark Attendance</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
        </div>

        {filteredDrivers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No drivers found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDrivers.map((driver) => {
              const fullName = `${driver.user?.firstName || ''} ${driver.user?.lastName || ''}`.trim()
              const existingAttendance = getAttendanceStatus(driver.id)
              const form = attendanceForm[driver.id] || { status: '', notes: '' }

              return (
                <div
                  key={driver.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                >
                  <div className="flex items-center gap-3 sm:w-64 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                      {fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fullName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{driver.employeeCode || '—'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 shrink-0" />
                      <span>{driver.designation || 'Driver'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{driver.phone || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{driver.user?.email || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:w-auto">
                    {existingAttendance && (
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', getStatusBadge(existingAttendance.status))}>
                        {existingAttendance.status}
                      </span>
                    )}

                    <div className="relative">
                      <select
                        value={form.status}
                        onChange={(e) => setAttendanceForm((prev) => ({ ...prev, [driver.id]: { ...prev[driver.id], status: e.target.value } }))}
                        className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Status</option>
                        <option value="PRESENT">Present</option>
                        <option value="ABSENT">Absent</option>
                        <option value="LEAVE">Leave</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    <button
                      onClick={() => handleMarkAttendance(driver.id)}
                      disabled={!form.status || submittingId === driver.id}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                        form.status
                          ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                      )}
                    >
                      {submittingId === driver.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Save
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Drivers</h2>
        {drivers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No drivers registered</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver) => {
              const fullName = `${driver.user?.firstName || ''} ${driver.user?.lastName || ''}`.trim()
              const att = getAttendanceStatus(driver.id)

              return (
                <div
                  key={driver.id}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                        {fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{driver.employeeCode || '—'}</p>
                      </div>
                    </div>
                    {att && (
                      <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getStatusBadge(att.status))}>
                        {att.status}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Briefcase className="w-3.5 h-3.5 shrink-0" />
                      <span>{driver.designation || 'Driver'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{driver.phone || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{driver.user?.email || '—'}</span>
                    </div>
                    {driver.licenseNumber && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span>License: {driver.licenseNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default TransportDrivers

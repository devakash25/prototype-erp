import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  AlertCircle,
  User,
  Mail,
  Phone,
  Hash,
  CalendarDays,
  BookOpen,
  Building2,
  GraduationCap,
  Home,
  Bus,
} from 'lucide-react'

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string | number | undefined }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="p-2 bg-gray-50 rounded-lg">
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
      </div>
    </div>
  )
}

export function StudentProfile() {
  const { data: profile, loading, error, refetch } = useApi('/student/profile')

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-600">Failed to load profile</p>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const p = profile ?? {}

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{p.fullName || '—'}</h2>
            <p className="text-sm text-gray-500">{p.email || '—'}</p>
            <div className="flex items-center gap-2 mt-1">
              {p.admissionNumber && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                  #{p.admissionNumber}
                </span>
              )}
              {p.rollNumber && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  Roll: {p.rollNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-400" /> Personal Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <InfoRow icon={User} label="Full Name" value={p.fullName} />
          <InfoRow icon={Mail} label="Email" value={p.email} />
          <InfoRow icon={Phone} label="Phone" value={p.phone} />
          <InfoRow icon={Hash} label="Admission Number" value={p.admissionNumber} />
          <InfoRow icon={Hash} label="Roll Number" value={p.rollNumber} />
          <InfoRow icon={CalendarDays} label="Enrollment Date" value={
            p.enrollmentDate ? new Date(p.enrollmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined
          } />
        </div>
      </div>

      {/* Academic Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-gray-400" /> Academic Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <InfoRow icon={BookOpen} label="Course" value={p.course} />
          <InfoRow icon={Building2} label="Department" value={p.department} />
          <InfoRow icon={CalendarDays} label="Session" value={p.session} />
          <InfoRow icon={GraduationCap} label="Semester" value={p.semester} />
        </div>
      </div>

      {/* Parent Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-400" /> Parent Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <InfoRow icon={User} label="Father's Name" value={p.fatherName} />
          <InfoRow icon={Phone} label="Father's Phone" value={p.fatherPhone} />
          <InfoRow icon={User} label="Mother's Name" value={p.motherName} />
          <InfoRow icon={Phone} label="Mother's Phone" value={p.motherPhone} />
          <InfoRow icon={Phone} label="Guardian Phone" value={p.guardianPhone} />
        </div>
      </div>

      {/* Hostel & Transport */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-gray-400" /> Hostel Info
          </h3>
          <div className="space-y-1">
            <InfoRow icon={Home} label="Hostel" value={p.hostelName} />
            <InfoRow icon={Hash} label="Room Number" value={p.roomNumber} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bus className="w-5 h-5 text-gray-400" /> Transport Info
          </h3>
          <div className="space-y-1">
            <InfoRow icon={Bus} label="Transport" value={p.transportRoute} />
            <InfoRow icon={Hash} label="Stop" value={p.transportStop} />
          </div>
        </div>
      </div>
    </div>
  )
}

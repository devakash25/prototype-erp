import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  GraduationCap,
  MapPin,
  Hash,
  Users,
  Bus,
  Home,
} from 'lucide-react'

export function StudentProfile() {
  const { data: profile, loading, error, refetch } = useApi<any>('/student/profile')

  if (loading) {
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
        <p className="text-lg text-slate-400">{error}</p>
        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
          Retry
        </button>
      </div>
    )
  }

  const p = profile || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-slate-400 text-sm">View and manage your personal information</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
            {(p.personal?.name || 'S').charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{p.personal?.name || '—'}</h2>
            <p className="text-slate-400 text-sm">{p.studentId || '—'}</p>
            <div className="flex items-center gap-4 mt-2">
              {p.academic?.course && (
                <span className="flex items-center gap-1 text-sm text-slate-400">
                  <BookOpen className="h-4 w-4" /> {p.academic.course}
                </span>
              )}
              {p.academic?.year && (
                <span className="flex items-center gap-1 text-sm text-slate-400">
                  <GraduationCap className="h-4 w-4" /> Year {p.academic.year}{p.academic.section ? ` - ${p.academic.section}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', value: p.personal?.name, icon: User },
            { label: 'Email', value: p.personal?.email, icon: Mail },
            { label: 'Phone', value: p.personal?.phone, icon: Phone },
            { label: 'Date of Birth', value: p.personal?.dateOfBirth ? new Date(p.personal.dateOfBirth).toLocaleDateString() : null, icon: Calendar },
            { label: 'Gender', value: p.personal?.gender, icon: User },
            { label: 'Blood Group', value: p.personal?.bloodGroup, icon: Hash },
          ].map((field) => (
            <div key={field.label} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
              <field.icon className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">{field.label}</p>
                <p className="text-sm font-medium text-white">{field.value || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Info */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Academic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Course', value: p.academic?.course, icon: BookOpen },
            { label: 'Year', value: p.academic?.year ? `Year ${p.academic.year}` : null, icon: GraduationCap },
            { label: 'Section', value: p.academic?.section, icon: Hash },
            { label: 'Semester', value: p.academic?.semester, icon: Calendar },
            { label: 'Roll Number', value: p.academic?.rollNumber, icon: Hash },
            { label: 'Status', value: p.status, icon: User },
          ].map((field) => (
            <div key={field.label} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
              <field.icon className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">{field.label}</p>
                <p className="text-sm font-medium text-white">{field.value || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parent / Guardian Info */}
      {p.parent && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Parent / Guardian</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Name', value: p.parent.name },
              { label: 'Email', value: p.parent.email },
              { label: 'Phone', value: p.parent.phone },
              { label: 'Relation', value: p.parent.relation },
            ].map((field) => (
              <div key={field.label} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <Users className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">{field.label}</p>
                  <p className="text-sm font-medium text-white">{field.value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Address */}
      {p.address && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
          <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
            <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm text-white">
                {[p.address.line1, p.address.line2, p.address.city, p.address.state, p.address.pincode].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

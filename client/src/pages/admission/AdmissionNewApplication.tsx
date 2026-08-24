import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import api from '@/services/api'
import { cn } from '@/lib/utils'

export function AdmissionNewApplication() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: 'MALE',
    address: '', city: '', state: '', pincode: '', category: 'GENERAL',
    previousSchool: '', previousPercentage: '', courseId: '',
    parentName: '', parentPhone: '', parentEmail: '', parentRelation: 'Father',
    source: 'DIRECT', priority: 'MEDIUM', counselorNotes: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const update = (field: string, value: string) => setForm({ ...form, [field]: value })

  const steps = [
    { label: 'Personal Info', fields: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'] },
    { label: 'Address & Category', fields: ['address', 'city', 'state', 'pincode', 'category'] },
    { label: 'Academic Details', fields: ['previousSchool', 'previousPercentage'] },
    { label: 'Parent Details', fields: ['parentName', 'parentPhone', 'parentEmail', 'parentRelation'] },
    { label: 'Review & Submit', fields: [] },
  ]

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError('Please fill in all required fields'); return
    }
    setSubmitting(true); setError('')
    try {
      await api.post('/admission/applications', form)
      setSuccess(true)
    } catch (err: any) { setError(err.response?.data?.error?.message || 'Failed to create application') }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Application Created!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">The application has been submitted successfully.</p>
          <button onClick={() => navigate('/admission/applications')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">View Applications</button>
        </div>
      </div>
    )
  }

  const inputClass = 'w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

  const renderPersonalInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label className={labelClass}>First Name *</label><input className={inputClass} value={form.firstName} onChange={(e) => update('firstName', e.target.value)} /></div>
      <div><label className={labelClass}>Last Name *</label><input className={inputClass} value={form.lastName} onChange={(e) => update('lastName', e.target.value)} /></div>
      <div><label className={labelClass}>Email *</label><input type="email" className={inputClass} value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
      <div><label className={labelClass}>Phone *</label><input className={inputClass} value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
      <div><label className={labelClass}>Date of Birth</label><input type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} /></div>
      <div><label className={labelClass}>Gender</label>
        <select className={inputClass} value={form.gender} onChange={(e) => update('gender', e.target.value)}>
          <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
        </select></div>
    </div>
  )

  const renderAddress = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2"><label className={labelClass}>Address</label><input className={inputClass} value={form.address} onChange={(e) => update('address', e.target.value)} /></div>
      <div><label className={labelClass}>City</label><input className={inputClass} value={form.city} onChange={(e) => update('city', e.target.value)} /></div>
      <div><label className={labelClass}>State</label><input className={inputClass} value={form.state} onChange={(e) => update('state', e.target.value)} /></div>
      <div><label className={labelClass}>Pincode</label><input className={inputClass} value={form.pincode} onChange={(e) => update('pincode', e.target.value)} /></div>
      <div><label className={labelClass}>Category</label>
        <select className={inputClass} value={form.category} onChange={(e) => update('category', e.target.value)}>
          {['GENERAL', 'SC', 'ST', 'OBC', 'EWS', 'OTHER'].map(c => <option key={c} value={c}>{c}</option>)}
        </select></div>
    </div>
  )

  const renderAcademic = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2"><label className={labelClass}>Previous School</label><input className={inputClass} value={form.previousSchool} onChange={(e) => update('previousSchool', e.target.value)} /></div>
      <div><label className={labelClass}>Previous Percentage</label><input type="number" step="0.01" className={inputClass} value={form.previousPercentage} onChange={(e) => update('previousPercentage', e.target.value)} /></div>
      <div><label className={labelClass}>Source</label>
        <select className={inputClass} value={form.source} onChange={(e) => update('source', e.target.value)}>
          {['DIRECT', 'ONLINE', 'PHONE', 'WALK_IN', 'REFERRAL'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select></div>
      <div><label className={labelClass}>Priority</label>
        <select className={inputClass} value={form.priority} onChange={(e) => update('priority', e.target.value)}>
          {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
        </select></div>
      <div className="md:col-span-2"><label className={labelClass}>Counselor Notes</label><textarea className={inputClass + ' h-20'} value={form.counselorNotes} onChange={(e) => update('counselorNotes', e.target.value)} /></div>
    </div>
  )

  const renderParent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label className={labelClass}>Parent/Guardian Name</label><input className={inputClass} value={form.parentName} onChange={(e) => update('parentName', e.target.value)} /></div>
      <div><label className={labelClass}>Phone</label><input className={inputClass} value={form.parentPhone} onChange={(e) => update('parentPhone', e.target.value)} /></div>
      <div><label className={labelClass}>Email</label><input type="email" className={inputClass} value={form.parentEmail} onChange={(e) => update('parentEmail', e.target.value)} /></div>
      <div><label className={labelClass}>Relation</label>
        <select className={inputClass} value={form.parentRelation} onChange={(e) => update('parentRelation', e.target.value)}>
          {['Father', 'Mother', 'Guardian', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
        </select></div>
    </div>
  )

  const renderReview = () => (
    <div className="space-y-4">
      {[
        ['Personal', `${form.firstName} ${form.lastName}`, `${form.email} | ${form.phone}`],
        ['DOB & Gender', form.dateOfBirth || '-', form.gender],
        ['Address', [form.address, form.city, form.state, form.pincode].filter(Boolean).join(', ') || '-'],
        ['Category', form.category],
        ['Academic', form.previousSchool || '-', form.previousPercentage ? `${form.previousPercentage}%` : '-'],
        ['Parent', form.parentName || '-', `${form.parentPhone || '-'} (${form.parentRelation})`],
        ['Source / Priority', form.source.replace('_', ' '), form.priority],
      ].map(([label, val1, val2]) => (
        <div key={label as string} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
          <div className="text-right"><span className="text-sm font-medium text-gray-900 dark:text-white">{val1}</span>
            {val2 && <span className="text-xs text-gray-500 dark:text-gray-400 block">{val2}</span>}</div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Application</h1>
      </div>

      <div className="flex gap-2">
        {steps.map((s, i) => (
          <button key={s.label} onClick={() => setStep(i)}
            className={cn('flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
              i === step ? 'bg-indigo-600 text-white' : i < step ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400')}>
            {i < step ? '✓ ' : ''}{s.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {step === 0 && renderPersonalInfo()}
        {step === 1 && renderAddress()}
        {step === 2 && renderAcademic()}
        {step === 3 && renderParent()}
        {step === 4 && renderReview()}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-between">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm disabled:opacity-50">
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        {step < 4 ? (
          <button onClick={() => setStep(s => Math.min(4, s + 1))}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        )}
      </div>
    </div>
  )
}

export default AdmissionNewApplication

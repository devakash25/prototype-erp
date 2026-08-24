import { useState, useEffect } from 'react'
import { Settings, Save, Building, GraduationCap, Bell, Shield, Palette, Check, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/services/api'

const tabs = [
  { id: 'general', label: 'General', icon: Building },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
]

const timezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Kolkata', 'Asia/Shanghai',
  'Asia/Tokyo', 'Australia/Sydney',
]

const colorPresets = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Violet', value: '#8b5cf6' },
]

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [general, setGeneral] = useState({
    institutionName: '', logo: '', address: '', phone: '', email: '', website: '', timezone: 'UTC',
  })
  const [academic, setAcademic] = useState({
    currentYear: '', currentSemester: '', gradingScale: 'POINT_10', passPercentage: '40', attendanceThreshold: '75',
  })
  const [notifications, setNotifications] = useState({
    emailEnabled: true, smsEnabled: false, pushEnabled: true, frequency: 'REAL_TIME',
  })
  const [security, setSecurity] = useState({
    passwordMinLength: '8', requireUppercase: true, requireLowercase: true, requireNumbers: true,
    requireSpecialChars: true, sessionTimeout: '30', twoFactorEnabled: false,
  })
  const [appearance, setAppearance] = useState({
    logo: '', primaryColor: '#6366f1', sidebarStyle: 'LIGHT',
  })

  useEffect(() => { loadSettings() }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await api.get('/system-settings')
      const data = res.data.data
      if (data.general) setGeneral(data.general)
      if (data.academic) setAcademic(data.academic)
      if (data.notifications) setNotifications(data.notifications)
      if (data.security) setSecurity(data.security)
      if (data.appearance) setAppearance(data.appearance)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await api.put('/system-settings', { general, academic, notifications, security, appearance })
      setMessage({ type: 'success', text: 'Settings saved successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error?.message || 'Failed to save settings' })
      setTimeout(() => setMessage(null), 5000)
    }
    setSaving(false)
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button type="button" onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', checked ? 'bg-indigo-600' : 'bg-gray-200')}>
      <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  )

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500">Configure institutional system settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadSettings} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />Reset
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {message && (
        <div className={cn('flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium',
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200')}>
          {message.type === 'success' ? <Check className="w-4 h-4" /> : <span className="w-4 h-4 flex items-center justify-center rounded-full bg-red-200 text-red-600 text-xs font-bold">!</span>}
          {message.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex lg:flex-col gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto lg:overflow-x-visible">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn('flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                  activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                <Icon className="w-4 h-4" />{tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">General Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Basic institution information and contact details</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
                  <input type="text" value={general.institutionName} onChange={e => setGeneral(g => ({ ...g, institutionName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. ABC Institute of Technology" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea value={general.address} onChange={e => setGeneral(g => ({ ...g, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    rows={2} placeholder="Full institution address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={general.phone} onChange={e => setGeneral(g => ({ ...g, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="+1 234 567 890" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={general.email} onChange={e => setGeneral(g => ({ ...g, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="admin@institution.edu" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input type="url" value={general.website} onChange={e => setGeneral(g => ({ ...g, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="https://institution.edu" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select value={general.timezone} onChange={e => setGeneral(g => ({ ...g, timezone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                      {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input type="url" value={general.logo} onChange={e => setGeneral(g => ({ ...g, logo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="https://institution.edu/logo.png" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Academic Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Configure academic year, grading, and attendance policies</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Academic Year</label>
                    <input type="text" value={academic.currentYear} onChange={e => setAcademic(a => ({ ...a, currentYear: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g. 2025-2026" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
                    <select value={academic.currentSemester} onChange={e => setAcademic(a => ({ ...a, currentSemester: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                      <option value="">Select Semester</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                      <option value="3">Semester 3</option>
                      <option value="4">Semester 4</option>
                      <option value="5">Semester 5</option>
                      <option value="6">Semester 6</option>
                      <option value="7">Semester 7</option>
                      <option value="8">Semester 8</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grading Scale</label>
                  <select value={academic.gradingScale} onChange={e => setAcademic(a => ({ ...a, gradingScale: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                    <option value="POINT_4">4-Point GPA</option>
                    <option value="POINT_10">10-Point CGPA</option>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="LETTER">Letter Grades (A-F)</option>
                    <option value="DISTINCTION">Distinction/First/Second</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pass Percentage</label>
                    <div className="relative">
                      <input type="number" value={academic.passPercentage} onChange={e => setAcademic(a => ({ ...a, passPercentage: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        min="0" max="100" placeholder="40" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Threshold</label>
                    <div className="relative">
                      <input type="number" value={academic.attendanceThreshold} onChange={e => setAcademic(a => ({ ...a, attendanceThreshold: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        min="0" max="100" placeholder="75" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Notification Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Configure notification channels and delivery preferences</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                    <p className="text-xs text-gray-500">Send notifications via email to users</p>
                  </div>
                  <Toggle checked={notifications.emailEnabled} onChange={v => setNotifications(n => ({ ...n, emailEnabled: v }))} />
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                    <p className="text-xs text-gray-500">Send critical notifications via SMS</p>
                  </div>
                  <Toggle checked={notifications.smsEnabled} onChange={v => setNotifications(n => ({ ...n, smsEnabled: v }))} />
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                    <p className="text-xs text-gray-500">Send browser and mobile push notifications</p>
                  </div>
                  <Toggle checked={notifications.pushEnabled} onChange={v => setNotifications(n => ({ ...n, pushEnabled: v }))} />
                </div>
                <div className="h-px bg-gray-100" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notification Frequency</label>
                  <select value={notifications.frequency} onChange={e => setNotifications(n => ({ ...n, frequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                    <option value="REAL_TIME">Real-time</option>
                    <option value="HOURLY">Hourly Digest</option>
                    <option value="DAILY">Daily Digest</option>
                    <option value="WEEKLY">Weekly Digest</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Security Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Password policies, session management, and two-factor authentication</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Password Policy</h3>
                  <div className="space-y-3 pl-0">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Length</label>
                      <input type="number" value={security.passwordMinLength} onChange={e => setSecurity(s => ({ ...s, passwordMinLength: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        min="6" max="64" />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">Require uppercase letters</p>
                      <Toggle checked={security.requireUppercase} onChange={v => setSecurity(s => ({ ...s, requireUppercase: v }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">Require lowercase letters</p>
                      <Toggle checked={security.requireLowercase} onChange={v => setSecurity(s => ({ ...s, requireLowercase: v }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">Require numbers</p>
                      <Toggle checked={security.requireNumbers} onChange={v => setSecurity(s => ({ ...s, requireNumbers: v }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">Require special characters</p>
                      <Toggle checked={security.requireSpecialChars} onChange={v => setSecurity(s => ({ ...s, requireSpecialChars: v }))} />
                    </div>
                  </div>
                </div>
                <div className="h-px bg-gray-100" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                  <input type="number" value={security.sessionTimeout} onChange={e => setSecurity(s => ({ ...s, sessionTimeout: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    min="5" max="1440" placeholder="30" />
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Two-Factor Authentication (2FA)</p>
                    <p className="text-xs text-gray-500">Require 2FA for all admin accounts</p>
                  </div>
                  <Toggle checked={security.twoFactorEnabled} onChange={v => setSecurity(s => ({ ...s, twoFactorEnabled: v }))} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Appearance Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Customize logo, theme colors, and sidebar layout</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input type="url" value={appearance.logo} onChange={e => setAppearance(a => ({ ...a, logo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="https://institution.edu/logo.png" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={appearance.primaryColor} onChange={e => setAppearance(a => ({ ...a, primaryColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                    <input type="text" value={appearance.primaryColor} onChange={e => setAppearance(a => ({ ...a, primaryColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="#6366f1" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {colorPresets.map(c => (
                      <button key={c.value} onClick={() => setAppearance(a => ({ ...a, primaryColor: c.value }))}
                        className={cn('w-8 h-8 rounded-full border-2 transition-all hover:scale-110',
                          appearance.primaryColor === c.value ? 'border-gray-900 scale-110' : 'border-transparent')}
                        style={{ backgroundColor: c.value }} title={c.name} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sidebar Style</label>
                  <select value={appearance.sidebarStyle} onChange={e => setAppearance(a => ({ ...a, sidebarStyle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                    <option value="LIGHT">Light (White background)</option>
                    <option value="DARK">Dark (Dark background)</option>
                    <option value="PRIMARY">Primary (Brand color background)</option>
                  </select>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Preview</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: appearance.primaryColor }}>
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{general.institutionName || 'Institution Name'}</p>
                      <p className="text-xs text-gray-500">Sidebar: {appearance.sidebarStyle.toLowerCase()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SystemSettings

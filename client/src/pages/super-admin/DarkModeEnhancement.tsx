import { useState, useEffect } from 'react'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import { Palette, Sun, Moon, Monitor, Type, Layout, Eye, Save, RotateCcw, Check } from 'lucide-react'

const colorPresets = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
]

const fontFamilies = ['Inter', 'Roboto', 'Open Sans', 'Poppins']
const fontSizes = ['Small', 'Medium', 'Large']
const sidebarStyles = ['Expanded', 'Compact', 'Hidden']

export default function DarkModeEnhancement() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [autoTheme, setAutoTheme] = useState(true)
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [accentColor, setAccentColor] = useState('#8b5cf6')
  const [sidebarColor, setSidebarColor] = useState<'dark' | 'light' | 'auto'>('auto')
  const [fontSize, setFontSize] = useState('Medium')
  const [fontFamily, setFontFamily] = useState('Inter')
  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>('left')
  const [sidebarStyle, setSidebarStyle] = useState('Expanded')
  const [contentWidth, setContentWidth] = useState<'full' | 'boxed'>('full')
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(true)
  const [showPageTitles, setShowPageTitles] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const res = await api.get('/appearance-settings')
      const d = res.data?.data || res.data
      if (d.theme) setTheme(d.theme)
      if (d.autoTheme !== undefined) setAutoTheme(d.autoTheme)
      if (d.colors?.primary) setPrimaryColor(d.colors.primary)
      if (d.colors?.accent) setAccentColor(d.colors.accent)
      if (d.colors?.sidebar) setSidebarColor(d.colors.sidebar)
      if (d.typography?.fontSize) setFontSize(d.typography.fontSize)
      if (d.typography?.fontFamily) setFontFamily(d.typography.fontFamily)
      if (d.layout?.sidebarPosition) setSidebarPosition(d.layout.sidebarPosition)
      if (d.layout?.sidebarStyle) setSidebarStyle(d.layout.sidebarStyle)
      if (d.layout?.contentWidth) setContentWidth(d.layout.contentWidth)
      if (d.layout?.showBreadcrumbs !== undefined) setShowBreadcrumbs(d.layout.showBreadcrumbs)
      if (d.layout?.showPageTitles !== undefined) setShowPageTitles(d.layout.showPageTitles)
    } catch {
      // use defaults
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await api.put('/appearance-settings', {
        theme, autoTheme,
        colors: { primary: primaryColor, accent: accentColor, sidebar: sidebarColor },
        typography: { fontSize, fontFamily },
        layout: { sidebarPosition, sidebarStyle, contentWidth, showBreadcrumbs, showPageTitles },
      })
      setMessage({ type: 'success', text: 'Settings saved successfully' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    try {
      await api.post('/appearance-settings/reset')
      setTheme('light')
      setAutoTheme(true)
      setPrimaryColor('#6366f1')
      setAccentColor('#8b5cf6')
      setSidebarColor('auto')
      setFontSize('Medium')
      setFontFamily('Inter')
      setSidebarPosition('left')
      setSidebarStyle('Expanded')
      setContentWidth('full')
      setShowBreadcrumbs(true)
      setShowPageTitles(true)
      setMessage({ type: 'success', text: 'Settings reset to defaults' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to reset settings' })
    }
  }

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appearance Settings</h1>
          <p className="text-gray-500 mt-1">Customize the look and feel of your dashboard</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {message && (
        <div className={cn('px-4 py-3 rounded-lg text-sm', message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200')}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Theme */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Palette className="w-5 h-5" /> Theme</h2>
            <div className="flex gap-3">
              {themeOptions.map(opt => (
                <button key={opt.value} onClick={() => setTheme(opt.value)}
                  className={cn('flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    theme === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300')}>
                  <opt.icon className={cn('w-6 h-6', theme === opt.value ? 'text-indigo-600' : 'text-gray-400')} />
                  <span className={cn('text-sm font-medium', theme === opt.value ? 'text-indigo-600' : 'text-gray-600')}>{opt.label}</span>
                </button>
              ))}
            </div>
            <label className="flex items-center gap-3 mt-4 cursor-pointer">
              <input type="checkbox" checked={autoTheme} onChange={e => setAutoTheme(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
              <span className="text-sm text-gray-700">Auto-switch based on system preference</span>
            </label>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Color Customization</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex gap-2 items-center">
                  {colorPresets.map(c => (
                    <button key={c.value} onClick={() => setPrimaryColor(c.value)}
                      className={cn('w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
                        primaryColor === c.value ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105')}
                      style={{ backgroundColor: c.value }}>
                      {primaryColor === c.value && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                <div className="flex gap-2 items-center">
                  {colorPresets.map(c => (
                    <button key={c.value} onClick={() => setAccentColor(c.value)}
                      className={cn('w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
                        accentColor === c.value ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105')}
                      style={{ backgroundColor: c.value }}>
                      {accentColor === c.value && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                  <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar Color</label>
                <div className="flex gap-2">
                  {(['dark', 'light', 'auto'] as const).map(s => (
                    <button key={s} onClick={() => setSidebarColor(s)}
                      className={cn('px-4 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all',
                        sidebarColor === s ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Type className="w-5 h-5" /> Typography</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                <div className="flex gap-2">
                  {fontSizes.map(s => (
                    <button key={s} onClick={() => setFontSize(s)}
                      className={cn('px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                        fontSize === s ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <div className="flex gap-2">
                  {fontFamilies.map(f => (
                    <button key={f} onClick={() => setFontFamily(f)}
                      className={cn('px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                        fontFamily === f ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Layout */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Layout className="w-5 h-5" /> Layout</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar Position</label>
                  <div className="flex gap-2">
                    {(['left', 'right'] as const).map(p => (
                      <button key={p} onClick={() => setSidebarPosition(p)}
                        className={cn('flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all',
                          sidebarPosition === p ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Width</label>
                  <div className="flex gap-2">
                    {(['full', 'boxed'] as const).map(w => (
                      <button key={w} onClick={() => setContentWidth(w)}
                        className={cn('flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all',
                          contentWidth === w ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar Style</label>
                <div className="flex gap-2">
                  {sidebarStyles.map(s => (
                    <button key={s} onClick={() => setSidebarStyle(s)}
                      className={cn('flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                        sidebarStyle === s ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={showBreadcrumbs} onChange={e => setShowBreadcrumbs(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Show Breadcrumbs</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={showPageTitles} onChange={e => setShowPageTitles(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Show Page Titles</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Eye className="w-5 h-5" /> Preview</h2>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              {/* Mini sidebar preview */}
              <div className="flex">
                <div className={cn('w-16 min-h-[200px] flex flex-col items-center py-3 gap-2',
                  sidebarColor === 'dark' ? 'bg-gray-900' : sidebarColor === 'light' ? 'bg-white border-r' : theme === 'dark' ? 'bg-gray-900' : 'bg-white border-r')}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-lg" style={{ backgroundColor: i === 0 ? primaryColor + '30' : '#f3f4f6' }} />
                  ))}
                </div>
                <div className="flex-1 p-3" style={{ fontFamily }}>
                  <div className="h-3 w-24 rounded mb-3" style={{ backgroundColor: primaryColor }} />
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="h-12 rounded-lg border border-gray-200 bg-white p-2">
                      <div className="h-2 w-8 rounded mb-1" style={{ backgroundColor: primaryColor + '40' }} />
                      <div className="h-3 w-12 rounded" style={{ backgroundColor: primaryColor }} />
                    </div>
                    <div className="h-12 rounded-lg border border-gray-200 bg-white p-2">
                      <div className="h-2 w-8 rounded mb-1" style={{ backgroundColor: accentColor + '40' }} />
                      <div className="h-3 w-12 rounded" style={{ backgroundColor: accentColor }} />
                    </div>
                  </div>
                  <div className="h-20 rounded-lg border border-gray-200 bg-white p-2">
                    <div className="h-2 w-16 rounded mb-2" style={{ backgroundColor: primaryColor + '30' }} />
                    <div className="space-y-1">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-1.5 rounded" style={{ width: `${80 - i * 15}%`, backgroundColor: '#e5e7eb' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p><strong>Theme:</strong> {theme}</p>
              <p><strong>Primary:</strong> <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: primaryColor, verticalAlign: 'middle' }} /> {primaryColor}</p>
              <p><strong>Accent:</strong> <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: accentColor, verticalAlign: 'middle' }} /> {accentColor}</p>
              <p><strong>Font:</strong> {fontFamily} ({fontSize})</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

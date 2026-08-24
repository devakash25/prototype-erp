import { useState, useEffect } from 'react'
import {
  Plus, Search, RefreshCw, Edit2, Trash2, X, DollarSign, Eye, EyeOff,
  Users, UserPlus, CheckCircle, Clock, AlertTriangle, List,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import api from '@/services/api'

const componentTypes = [
  'Tuition', 'Admission', 'Hostel', 'Transport', 'Exam', 'Library', 'Lab', 'Misc',
]

export function FeeStructurePage() {
  const [structures, setStructures] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [view, setView] = useState<'structures' | 'payments'>('structures')

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', description: '', departmentId: '', courseId: '',
    academicSessionId: '', totalAmount: '', dueDate: '',
  })
  const [components, setComponents] = useState<{ name: string; amount: string; type: string; isRefundable: boolean }[]>([])
  const [saving, setSaving] = useState(false)

  // View modal
  const [viewingStructure, setViewingStructure] = useState<any>(null)

  // Bulk assign modal
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkFeeStructureId, setBulkFeeStructureId] = useState('')
  const [bulkStudents, setBulkStudents] = useState<any[]>([])
  const [bulkSearch, setBulkSearch] = useState('')
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set())
  const [bulkSaving, setBulkSaving] = useState(false)

  // Payment tracking
  const [payments, setPayments] = useState<any[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'PARTIAL'>('ALL')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [structRes, statsRes, deptRes, courseRes, sessRes] = await Promise.allSettled([
        api.get('/fee-structures?limit=100'),
        api.get('/fee-structures/stats'),
        api.get('/analytics/departments'),
        api.get('/analytics/courses'),
        api.get('/analytics/sessions'),
      ])
      if (structRes.status === 'fulfilled') setStructures(structRes.value.data.data?.items || [])
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data)
      if (deptRes.status === 'fulfilled') setDepartments(deptRes.value.data.data || [])
      if (courseRes.status === 'fulfilled') setCourses(courseRes.value.data.data || [])
      if (sessRes.status === 'fulfilled') setSessions(sessRes.value.data.data || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const loadPayments = async () => {
    setPaymentsLoading(true)
    try {
      const res = await api.get('/fee-structures/payments?limit=200')
      setPayments(res.data.data?.items || [])
    } catch (err) { console.error(err) }
    setPaymentsLoading(false)
  }

  const openBulkAssign = async (structureId: string) => {
    setBulkFeeStructureId(structureId)
    setBulkSelected(new Set())
    setBulkSearch('')
    setShowBulkModal(true)
    try {
      const res = await api.get('/users?role=STUDENT&limit=500')
      setBulkStudents(res.data.data?.items || [])
    } catch (err) { console.error(err) }
  }

  const handleBulkAssign = async () => {
    if (bulkSelected.size === 0) { alert('Select at least one student'); return }
    setBulkSaving(true)
    try {
      await api.post('/fee-structures/bulk-assign', {
        feeStructureId: bulkFeeStructureId,
        studentIds: Array.from(bulkSelected),
      })
      setShowBulkModal(false)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to assign fees')
    }
    setBulkSaving(false)
  }

  const toggleBulkSelect = (id: string) => {
    setBulkSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectAllBulk = () => {
    const filtered = bulkStudents.filter(s =>
      !bulkSearch || s.fullName?.toLowerCase().includes(bulkSearch.toLowerCase()) || s.email?.toLowerCase().includes(bulkSearch.toLowerCase())
    )
    if (bulkSelected.size === filtered.length) {
      setBulkSelected(new Set())
    } else {
      setBulkSelected(new Set(filtered.map(s => s.id)))
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ name: '', description: '', departmentId: '', courseId: '', academicSessionId: '', totalAmount: '', dueDate: '' })
    setComponents([{ name: 'Tuition Fee', amount: '', type: 'Tuition', isRefundable: false }])
    setShowModal(true)
  }

  const openEdit = (structure: any) => {
    setEditingId(structure.id)
    setForm({
      name: structure.name, description: structure.description || '',
      departmentId: structure.departmentId || '', courseId: structure.courseId || '',
      academicSessionId: structure.academicSessionId, totalAmount: structure.totalAmount.toString(),
      dueDate: structure.dueDate ? new Date(structure.dueDate).toISOString().split('T')[0] : '',
    })
    setComponents(structure.components?.map((c: any) => ({
      name: c.name, amount: c.amount.toString(), type: c.type, isRefundable: c.isRefundable,
    })) || [])
    setShowModal(true)
  }

  const openView = async (id: string) => {
    try {
      const res = await api.get(`/fee-structures/${id}`)
      setViewingStructure(res.data.data)
    } catch (err) { console.error(err) }
  }

  const addComponent = () => {
    setComponents([...components, { name: '', amount: '', type: 'Misc', isRefundable: false }])
  }

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index))
  }

  const updateComponent = (index: number, field: string, value: any) => {
    setComponents(components.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  const handleSave = async () => {
    if (!form.name || !form.totalAmount || !form.academicSessionId) {
      alert('Name, total amount, and academic session are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        totalAmount: parseFloat(form.totalAmount),
        components: components.filter(c => c.name && c.amount).map(c => ({
          name: c.name,
          amount: parseFloat(c.amount),
          type: c.type,
          isRefundable: c.isRefundable,
        })),
      }

      if (editingId) {
        await api.put(`/fee-structures/${editingId}`, payload)
      } else {
        await api.post('/fee-structures', payload)
      }
      setShowModal(false)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee structure?')) return
    try {
      await api.delete(`/fee-structures/${id}`)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete')
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await api.put(`/fee-structures/${id}`, { isActive: !currentActive })
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to toggle')
    }
  }

  const filtered = structures.filter(s => {
    if (activeFilter === 'ACTIVE' && !s.isActive) return false
    if (activeFilter === 'INACTIVE' && s.isActive) return false
    if (search) {
      const q = search.toLowerCase()
      if (!s.name?.toLowerCase().includes(q) && !s.description?.toLowerCase().includes(q)) return false
    }
    return true
  })

  const filteredPayments = payments.filter(p => {
    if (paymentFilter === 'PAID' && p.status !== 'PAID') return false
    if (paymentFilter === 'PENDING' && p.status !== 'PENDING') return false
    if (paymentFilter === 'PARTIAL' && p.status !== 'PARTIAL') return false
    return true
  })

  const handleViewChange = (v: 'structures' | 'payments') => {
    setView(v)
    if (v === 'payments' && payments.length === 0) loadPayments()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Structure Management</h1>
          <p className="text-sm text-gray-500">Define and manage fee structures for courses and departments</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => handleViewChange('structures')} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors', view === 'structures' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <List className="w-4 h-4" />Structures
            </button>
            <button onClick={() => handleViewChange('payments')} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors', view === 'payments' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <DollarSign className="w-4 h-4" />Payments
            </button>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
          {view === 'structures' && (
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" />Create Fee Structure
            </button>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-gray-900">{stats.totalStructures}</p><p className="text-xs text-gray-500">Total Structures</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-green-600">{stats.activeStructures}</p><p className="text-xs text-gray-500">Active</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalDefined)}</p><p className="text-xs text-gray-500">Total Defined</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCollected)}</p><p className="text-xs text-gray-500">Collected</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalOutstanding)}</p><p className="text-xs text-gray-500">Outstanding</p></div>
        </div>
      )}

      {view === 'structures' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by name or description..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    activeFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Department</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Session</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500">Components</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500">Due Date</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500">Status</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500">Payments</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9} className="px-5 py-10 text-center text-sm text-gray-500">No fee structures found</td></tr>
                  ) : filtered.map((s: any) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.name}</p>
                          {s.description && <p className="text-xs text-gray-500 truncate max-w-[200px]">{s.description}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{s.department?.name || 'All'}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{s.academicSession?.name || '—'}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(Number(s.totalAmount))}</td>
                      <td className="px-5 py-4 text-center"><span className="text-sm text-gray-600">{s.components?.length || 0}</span></td>
                      <td className="px-5 py-4 text-center text-sm text-gray-500">{s.dueDate ? formatDate(s.dueDate) : '—'}</td>
                      <td className="px-5 py-4 text-center">
                        <button onClick={() => handleToggleActive(s.id, s.isActive)}
                          className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                            s.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                          {s.isActive ? <><Eye className="w-3 h-3" />Active</> : <><EyeOff className="w-3 h-3" />Inactive</>}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-center text-sm text-gray-600">{s._count?.payments || 0}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openView(s.id)} className="p-1.5 rounded-lg hover:bg-gray-100" title="View Details">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button onClick={() => openBulkAssign(s.id)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Bulk Assign">
                            <UserPlus className="w-4 h-4 text-indigo-500" />
                          </button>
                          <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Edit">
                            <Edit2 className="w-4 h-4 text-gray-500" />
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Delete">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === 'payments' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Payment Tracking</h3>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['ALL', 'PAID', 'PENDING', 'PARTIAL'] as const).map(f => (
                <button key={f} onClick={() => setPaymentFilter(f)}
                  className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    paymentFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            {paymentsLoading ? (
              <div className="px-5 py-10 text-center text-sm text-gray-500">Loading payments...</div>
            ) : filteredPayments.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-500">No payment records found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Student</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Fee Structure</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">Paid</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">Balance</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Last Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">{p.student?.user?.fullName || p.studentName || '—'}</p>
                        <p className="text-xs text-gray-500">{p.student?.enrollmentNo || '—'}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{p.feeStructure?.name || '—'}</td>
                      <td className="px-5 py-4 text-sm text-right font-medium text-gray-900">{formatCurrency(Number(p.totalAmount || 0))}</td>
                      <td className="px-5 py-4 text-sm text-right text-green-600 font-medium">{formatCurrency(Number(p.paidAmount || 0))}</td>
                      <td className="px-5 py-4 text-sm text-right text-red-600 font-medium">{formatCurrency(Number(p.balanceAmount || 0))}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium',
                          p.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          p.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700')}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{p.lastPaymentDate ? formatDate(p.lastPaymentDate) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Fee Structure' : 'Create Fee Structure'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. B.Tech 1st Year Fee 2024-25" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    rows={2} placeholder="Optional description" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Session *</label>
                  <select value={form.academicSessionId} onChange={e => setForm(f => ({ ...f, academicSessionId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                    <option value="">Select Session</option>
                    {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                    <option value="">All Departments</option>
                    {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                    <option value="">All Courses</option>
                    {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount *</label>
                  <input type="number" value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="0.00" min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Fee Components</label>
                  <button onClick={addComponent} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
                    <Plus className="w-3 h-3" />Add Component
                  </button>
                </div>
                <div className="space-y-2">
                  {components.map((comp, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <input type="text" value={comp.name} onChange={e => updateComponent(i, 'name', e.target.value)}
                        placeholder="Component name" className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white" />
                      <input type="number" value={comp.amount} onChange={e => updateComponent(i, 'amount', e.target.value)}
                        placeholder="Amount" min="0" step="0.01" className="w-24 px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white" />
                      <select value={comp.type} onChange={e => updateComponent(i, 'type', e.target.value)}
                        className="w-28 px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white">
                        {componentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <label className="flex items-center gap-1 text-xs text-gray-500">
                        <input type="checkbox" checked={comp.isRefundable} onChange={e => updateComponent(i, 'isRefundable', e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />Refund
                      </label>
                      {components.length > 1 && (
                        <button onClick={() => removeComponent(i)} className="p-1 hover:bg-gray-200 rounded"><X className="w-3 h-3 text-gray-400" /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create Fee Structure'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingStructure && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Fee Structure Details</h2>
              <button onClick={() => setViewingStructure(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center"><DollarSign className="w-6 h-6 text-indigo-600" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">{viewingStructure.name}</h3>
                  <p className="text-sm text-gray-500">{viewingStructure.academicSession?.name}</p>
                </div>
              </div>
              {viewingStructure.description && <p className="text-sm text-gray-600">{viewingStructure.description}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-gray-50"><p className="text-xs text-gray-500">Total Amount</p><p className="text-xl font-bold text-gray-900">{formatCurrency(Number(viewingStructure.totalAmount))}</p></div>
                <div className="p-3 rounded-lg bg-gray-50"><p className="text-xs text-gray-500">Due Date</p><p className="text-xl font-bold text-gray-900">{viewingStructure.dueDate ? formatDate(viewingStructure.dueDate) : '—'}</p></div>
              </div>
              {viewingStructure.components?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Components</h4>
                  <div className="space-y-2">
                    {viewingStructure.components.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div><p className="text-sm font-medium text-gray-900">{c.name}</p><p className="text-xs text-gray-500">{c.type}{c.isRefundable ? ' (Refundable)' : ''}</p></div>
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(Number(c.amount))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-400">{viewingStructure._count?.payments || 0} payments recorded</div>
            </div>
            <div className="flex justify-end px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button onClick={() => setViewingStructure(null)} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assign Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Bulk Assign Fee Structure</h2>
              <button onClick={() => setShowBulkModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search students..." value={bulkSearch} onChange={e => setBulkSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <button onClick={selectAllBulk} className="ml-3 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg">
                  {bulkSelected.size === bulkStudents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="text-sm text-gray-500">{bulkSelected.size} student(s) selected</div>
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                {bulkStudents
                  .filter(s => !bulkSearch || s.fullName?.toLowerCase().includes(bulkSearch.toLowerCase()) || s.email?.toLowerCase().includes(bulkSearch.toLowerCase()))
                  .map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer" onClick={() => toggleBulkSelect(s.id)}>
                      <input type="checkbox" checked={bulkSelected.has(s.id)} onChange={() => toggleBulkSelect(s.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{s.fullName}</p>
                        <p className="text-xs text-gray-500">{s.email}</p>
                      </div>
                      <span className="text-xs text-gray-400">{s.enrollmentNo || '—'}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleBulkAssign} disabled={bulkSaving || bulkSelected.size === 0}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50">
                {bulkSaving ? 'Assigning...' : `Assign to ${bulkSelected.size} Student(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

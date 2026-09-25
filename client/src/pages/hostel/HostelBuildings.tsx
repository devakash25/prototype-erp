import { useState, useEffect } from 'react'
import {
  Building2, Plus, RefreshCw, Users, BedDouble, Percent, Edit, Phone, MapPin, X,
} from 'lucide-react'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

interface Hostel {
  id: string
  name: string
  type: string
  capacity: number
  occupied: number
  address?: string
  phone?: string
}

export function HostelBuildings() {
  const { user } = useAuthStore()
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'BOYS',
    capacity: '',
    address: '',
    phone: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null)

  useEffect(() => {
    loadHostels()
  }, [])

  const loadHostels = async () => {
    setLoading(true)
    try {
      const res = await api.get('/hostel/buildings')
      setHostels(res.data?.data ?? res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.capacity) return
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
      }
      if (editingHostel) {
        await api.put(`/hostel/buildings/${editingHostel.id}`, payload)
      } else {
        await api.post('/hostel/buildings', payload)
      }
      resetForm()
      loadHostels()
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  const resetForm = () => {
    setFormData({ name: '', type: 'BOYS', capacity: '', address: '', phone: '' })
    setEditingHostel(null)
    setShowForm(false)
  }

  const startEdit = (hostel: Hostel) => {
    setFormData({
      name: hostel.name,
      type: hostel.type,
      capacity: String(hostel.capacity),
      address: hostel.address || '',
      phone: hostel.phone || '',
    })
    setEditingHostel(hostel)
    setShowForm(true)
  }

  const getTypeBadge = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'BOYS': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'GIRLS': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
      case 'MIXED': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hostel Buildings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage hostel buildings & rooms overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadHostels}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Add Hostel
          </button>
        </div>
      </div>

      {/* Add/Edit Hostel Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingHostel ? 'Edit Hostel' : 'Add New Hostel'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hostel Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Block A"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BOYS">Boys</option>
                <option value="GIRLS">Girls</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity *</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="Total rooms"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="Warden phone"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="Full address"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingHostel ? 'Update Hostel' : 'Add Hostel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hostel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hostels.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-lg text-gray-500 dark:text-gray-400">No hostels found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first hostel to get started</p>
          </div>
        ) : (
          hostels.map((hostel) => {
            const vacant = hostel.capacity - hostel.occupied
            const rate = hostel.capacity > 0 ? Math.round((hostel.occupied / hostel.capacity) * 100) : 0
            return (
              <div
                key={hostel.id}
                onClick={() => setSelectedHostel(selectedHostel?.id === hostel.id ? null : hostel)}
                className={cn(
                  'bg-white dark:bg-gray-800 rounded-xl border p-6 cursor-pointer transition-all hover:shadow-md',
                  selectedHostel?.id === hostel.id
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-gray-200 dark:border-gray-700'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{hostel.name}</h3>
                    <span className={cn('inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full', getTypeBadge(hostel.type))}>
                      {hostel.type}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(hostel) }}
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Capacity</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{hostel.capacity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Occupied</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{hostel.occupied}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Occupancy</span>
                  <span>{rate}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
                  <div
                    className={cn('h-2 rounded-full', rate >= 90 ? 'bg-red-500' : rate >= 70 ? 'bg-yellow-500' : 'bg-green-500')}
                    style={{ width: `${rate}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="flex items-center gap-1">
                    <BedDouble className="w-3 h-3" /> {vacant} vacant
                  </span>
                  <span className="flex items-center gap-1">
                    <Percent className="w-3 h-3" /> {100 - rate}% vacancy
                  </span>
                </div>

                {hostel.address && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3 flex-shrink-0" /> {hostel.address}
                  </div>
                )}
                {hostel.phone && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <Phone className="w-3 h-3 flex-shrink-0" /> {hostel.phone}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default HostelBuildings

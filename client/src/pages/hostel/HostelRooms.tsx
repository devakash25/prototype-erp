import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { Bed, Plus, X, Check } from 'lucide-react'

export function HostelRooms() {
  const [hostelId, setHostelId] = useState('')
  const [roomType, setRoomType] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ hostelId: '', roomNumber: '', floor: '', capacity: '2', type: 'double', amenities: '' })
  const qc = useQueryClient()

  const { data: hostels } = useQuery({ queryKey: ['hostels'], queryFn: () => api.get('/hostel/hostels').then(r => r.data?.data ?? r.data) })

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['hostel-rooms', hostelId, roomType],
    queryFn: () => api.get('/hostel/rooms', { params: { hostelId, type: roomType } }).then(r => r.data?.data ?? r.data),
  })

  const createMut = useMutation({
    mutationFn: (data: any) => api.post('/hostel/rooms', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hostel-rooms'] }); setShowForm(false) },
  })

  const getRoomColor = (r: any) => {
    if (r.occupied >= r.capacity) return 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
    if (r.occupied > 0) return 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10'
    return 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><Bed className="w-6 h-6" /> Rooms</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"><Plus className="w-4 h-4" /> Add Room</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={hostelId} onChange={e => setHostelId(e.target.value)} className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm">
          <option value="">All Hostels</option>
          {(hostels || []).map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <select value={roomType} onChange={e => setRoomType(e.target.value)} className="px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm">
          <option value="">All Types</option>
          {['single', 'double', 'triple', 'dormitory'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800 space-y-3">
          <div className="flex items-center justify-between"><h3 className="font-semibold dark:text-white">Add Room</h3><button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs dark:text-gray-400 mb-1">Hostel</label>
              <select value={form.hostelId} onChange={e => setForm({ ...form, hostelId: e.target.value })} className="w-full px-3 py-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm">
                <option value="">Select</option>
                {(hostels || []).map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div><label className="block text-xs dark:text-gray-400 mb-1">Room Number</label><input value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} className="w-full px-3 py-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" /></div>
            <div><label className="block text-xs dark:text-gray-400 mb-1">Floor</label><input value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} className="w-full px-3 py-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" /></div>
            <div><label className="block text-xs dark:text-gray-400 mb-1">Capacity</label><input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="w-full px-3 py-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" /></div>
            <div>
              <label className="block text-xs dark:text-gray-400 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm">
                {['single', 'double', 'triple', 'dormitory'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => createMut.mutate({ ...form, capacity: parseInt(form.capacity), floor: form.floor ? parseInt(form.floor) : null })} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center gap-2"><Check className="w-4 h-4" /> Create</button>
        </div>
      )}

      {isLoading ? <p className="text-gray-400">Loading...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {(rooms || []).map((r: any) => (
            <div key={r.id} className={`p-3 rounded-lg border-2 ${getRoomColor(r)} text-center`}>
              <p className="font-bold dark:text-white text-lg">{r.roomNumber}</p>
              <p className="text-xs dark:text-gray-400 capitalize">{r.type} • Floor {r.floor || '-'}</p>
              <p className="text-sm mt-1"><span className={`font-medium ${r.occupied >= r.capacity ? 'text-red-600' : 'text-green-600'}`}>{r.occupied}</span><span className="text-gray-400">/{r.capacity}</span></p>
              <div className="mt-2 flex gap-0.5 justify-center">
                {Array.from({ length: r.capacity }).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < r.occupied ? 'bg-red-500' : 'bg-green-300 dark:bg-green-700'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

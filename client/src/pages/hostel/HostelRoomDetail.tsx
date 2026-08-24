import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { Bed, Users } from 'lucide-react'

export function HostelRoomDetail() {
  const { id } = useParams()

  const { data: room, isLoading } = useQuery({
    queryKey: ['hostel-room', id],
    queryFn: () => api.get(`/hostel/rooms/${id}`).then(r => r.data),
    enabled: !!id,
  })

  if (isLoading) return <p className="text-gray-400 p-8">Loading...</p>
  if (!room) return <p className="text-gray-400 p-8">Room not found</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><Bed className="w-6 h-6" /> Room {room.roomNumber}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Floor</p>
          <p className="text-xl font-bold dark:text-white">{room.floor || '-'}</p>
        </div>
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Type</p>
          <p className="text-xl font-bold dark:text-white capitalize">{room.type}</p>
        </div>
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Capacity</p>
          <p className="text-xl font-bold dark:text-white">{room.capacity}</p>
        </div>
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Occupied</p>
          <p className={`text-xl font-bold ${room.occupied >= room.capacity ? 'text-red-600' : 'text-green-600'}`}>{room.occupied}</p>
        </div>
      </div>

      <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 mb-2">Occupancy</p>
        <div className="flex gap-1">
          {Array.from({ length: room.capacity }).map((_, i) => (
            <div key={i} className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${i < room.occupied ? 'bg-red-500 text-white' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
              {i < room.occupied ? <Users className="w-3 h-3" /> : 'V'}
            </div>
          ))}
        </div>
      </div>

      {room.amenities && (
        <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 mb-2">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(room.amenities) ? room.amenities : []).map((a: string, i: number) => (
              <span key={i} className="px-2 py-1 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">{a}</span>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 rounded-lg border dark:border-gray-700 dark:bg-gray-800">
        <h3 className="font-medium dark:text-white mb-3">Allocated Students</h3>
        {(room.students || []).length === 0 ? <p className="text-gray-400 text-sm">No students allocated</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b dark:border-gray-700">
                <th className="px-3 py-2 text-left dark:text-gray-300">Name</th>
                <th className="px-3 py-2 text-left dark:text-gray-300">Department</th>
                <th className="px-3 py-2 text-left dark:text-gray-300">Course</th>
              </tr></thead>
              <tbody className="divide-y dark:divide-gray-700">
                {(room.students || []).map((s: any) => (
                  <tr key={s.id}>
                    <td className="px-3 py-2 dark:text-white">{s.user?.fullName || 'Unknown'}</td>
                    <td className="px-3 py-2 dark:text-gray-300">{s.department?.name || '-'}</td>
                    <td className="px-3 py-2 dark:text-gray-300">{s.course?.name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

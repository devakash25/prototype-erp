import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '@/services/api'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  AlertCircle,
  MapPin,
  Users,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react'

export function ExamControllerSeating() {
  const [searchParams] = useSearchParams()
  const [selectedExamId, setSelectedExamId] = useState(searchParams.get('examId') || '')
  const [selectedRoom, setSelectedRoom] = useState('')

  const { data: examsData, isLoading: examsLoading } = useQuery({
    queryKey: ['exam-controller-seating-exams'],
    queryFn: async () => {
      const res = await api.get('/exam-controller/exams')
      return res.data
    },
  })

  const { data: seatingData, isLoading: seatingLoading, error: seatingError, refetch } = useQuery({
    queryKey: ['exam-controller-seating-plan', selectedExamId],
    queryFn: async () => {
      const params = selectedExamId ? `?examId=${selectedExamId}` : ''
      const res = await api.get(`/exam-controller/seating-plan${params}`)
      return res.data
    },
    enabled: true,
  })

  if (seatingLoading || examsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (seatingError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-slate-300">Failed to load seating plan</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const exams = examsData?.data || examsData || []
  const seatingPlan = seatingData?.data || seatingData || []
  const rooms = Array.isArray(seatingPlan) ? seatingPlan : seatingPlan.rooms || []

  const filteredRooms = selectedRoom
    ? rooms.filter((r: any) => r.roomNumber === selectedRoom || r.room === selectedRoom)
    : rooms

  const totalSeats = rooms.reduce((s: number, r: any) => s + (r.totalSeats || r.capacity || 0), 0)
  const occupiedSeats = rooms.reduce((s: number, r: any) => s + (r.occupiedSeats || r.assigned || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Seating Plan</h1>
          <p className="text-slate-400 text-sm">View and manage exam seating arrangements</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700"
        >
          <RefreshCw className={cn('w-4 h-4', seatingLoading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Filters & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative">
          <select
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value)
              setSelectedRoom('')
            }}
            className="appearance-none pl-3 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Exams</option>
            {exams.map((exam: any) => (
              <option key={exam.id} value={exam.id}>{exam.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="appearance-none pl-3 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Rooms</option>
            {rooms.map((room: any) => (
              <option key={room.roomNumber || room.room} value={room.roomNumber || room.room}>
                Room {room.roomNumber || room.room}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
            <MapPin className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-300">Rooms: <span className="font-semibold text-white">{rooms.length}</span></span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
            <LayoutGrid className="h-4 w-4 text-green-400" />
            <span className="text-sm text-slate-300">Seats: <span className="font-semibold text-white">{occupiedSeats}/{totalSeats}</span></span>
          </div>
        </div>
      </div>

      {/* Seating Arrangement */}
      {filteredRooms.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <LayoutGrid className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">No seating arrangement available</p>
          <p className="text-sm text-slate-500 mt-1">Select an exam to view seating plan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room: any) => {
            const roomNumber = room.roomNumber || room.room
            const totalSeats = room.totalSeats || room.capacity || 0
            const occupiedSeats = room.occupiedSeats || room.assigned || 0
            const utilization = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0
            const students = room.students || room.assignments || []

            return (
              <div key={roomNumber} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Room {roomNumber}</h3>
                        <p className="text-xs text-slate-400">{room.block || room.building || ''}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        utilization >= 80
                          ? 'bg-green-900/30 text-green-400'
                          : utilization >= 50
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : 'bg-slate-700 text-slate-400'
                      )}
                    >
                      {utilization}% filled
                    </span>
                  </div>

                  {/* Utilization bar */}
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        utilization >= 80 ? 'bg-green-500' : utilization >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
                      )}
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400">
                      <Users className="inline h-3 w-3 mr-1" />
                      {occupiedSeats}/{totalSeats} seats
                    </span>
                    {room.invigilator && (
                      <span className="text-xs text-slate-400">
                        Invigilator: {room.invigilator}
                      </span>
                    )}
                  </div>
                </div>

                {/* Student List */}
                <div className="p-4 max-h-64 overflow-y-auto">
                  {students.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No students assigned</p>
                  ) : (
                    <div className="space-y-2">
                      {students.map((student: any, idx: number) => (
                        <div
                          key={student.id || idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50 border border-slate-700"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400 w-8 text-right">
                              {student.seatNumber || student.seat || idx + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {student.fullName || student.name || '—'}
                              </p>
                              <p className="text-xs text-slate-400">
                                {student.rollNumber || student.enrollmentNumber || ''}
                              </p>
                            </div>
                          </div>
                          {student.class && (
                            <span className="text-xs text-slate-400">{student.class}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

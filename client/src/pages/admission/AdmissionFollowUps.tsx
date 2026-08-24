import { useState, useEffect } from 'react'
import { Calendar, Clock, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react'
import api from '@/services/api'
import { cn } from '@/lib/utils'

export function AdmissionFollowUps() {
  const [followUps, setFollowUps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [scheduleModal, setScheduleModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' })
  const [followUpDate, setFollowUpDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => { loadFollowUps() }, [])

  const loadFollowUps = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admission/follow-ups')
      setFollowUps(res.data.data || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleSchedule = async () => {
    if (!followUpDate) return
    try {
      await api.post(`/admission/applications/${scheduleModal.id}/follow-up`, { followUpDate, notes })
      setScheduleModal({ open: false, id: '' }); setFollowUpDate(''); setNotes('')
      loadFollowUps()
    } catch (err) { console.error(err) }
  }

  const isOverdue = (date: string) => new Date(date) < new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Follow-ups</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Applicants requiring attention</p>
        </div>
        <button onClick={loadFollowUps} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div>
      ) : followUps.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
          <p className="text-gray-500 dark:text-gray-400">No pending follow-ups</p>
        </div>
      ) : (
        <div className="space-y-3">
          {followUps.map((fu) => {
            const overdue = fu.followUpDate && isOverdue(fu.followUpDate)
            return (
              <div key={fu.id} className={cn('bg-white dark:bg-gray-800 rounded-xl border p-5 flex items-center justify-between',
                overdue ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700')}>
                <div className="flex items-center gap-4">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', overdue ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30')}>
                    {overdue ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <Clock className="w-5 h-5 text-yellow-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{fu.firstName} {fu.lastName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{fu.applicationNumber} · {fu.course?.name || 'No course'}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Follow-up: {fu.followUpDate ? new Date(fu.followUpDate).toLocaleDateString() : 'Not set'}
                      {fu.counselorNotes && ` · ${fu.counselorNotes}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {overdue && <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">Overdue</span>}
                  <button onClick={() => setScheduleModal({ open: true, id: fu.id })}
                    className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50">
                    Schedule
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {scheduleModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schedule Follow-up</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Follow-up Date</label>
                <input type="datetime-local" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Follow-up notes..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-20" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setScheduleModal({ open: false, id: '' })} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={handleSchedule} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdmissionFollowUps

import { useState, useEffect } from 'react'
import { RefreshCw, Bell, Megaphone, Send } from 'lucide-react'
import api from '@/services/api'

export function DirectorNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadNotifications() }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.data?.notifications || res.data.data || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage notifications</p>
        </div>
        <button onClick={loadNotifications} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No notifications</p>
          </div>
        )}
        {notifications.map((notif: any) => (
          <div key={notif.id} className={`bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow ${notif.isRead ? 'border-gray-200' : 'border-indigo-200 bg-indigo-50/30'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${notif.priority === 'HIGH' ? 'bg-red-100' : notif.priority === 'MEDIUM' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                <Bell className={`w-5 h-5 ${notif.priority === 'HIGH' ? 'text-red-600' : notif.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">{notif.title}</h3>
                  {!notif.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
              </div>
              {notif.priority && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${notif.priority === 'HIGH' ? 'bg-red-100 text-red-800' : notif.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                  {notif.priority}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import {
  MapPin, RefreshCw, Plus, Bus, Users, Clock, ChevronDown, ChevronUp,
  X, Check, Route,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/StatCard'
import api from '@/services/api'

export function TransportRoutes() {
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [newRoute, setNewRoute] = useState({
    name: '',
    code: '',
    description: '',
    stops: [{ name: '', address: '', estimatedTime: '' }],
  })
  const [assignForm, setAssignForm] = useState({
    vehicleId: '',
    shift: 'MORNING',
    departureTime: '',
    arrivalTime: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [routesRes, vehiclesRes] = await Promise.allSettled([
        api.get('/transport/routes'),
        api.get('/transport/vehicles'),
      ])
      if (routesRes.status === 'fulfilled') setRoutes(routesRes.value.data || [])
      if (vehiclesRes.status === 'fulfilled') setVehicles(vehiclesRes.value.data || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleAddRoute = async () => {
    if (!newRoute.name || !newRoute.code) return
    setSubmitting(true)
    try {
      await api.post('/transport/routes', newRoute)
      setNewRoute({ name: '', code: '', description: '', stops: [{ name: '', address: '', estimatedTime: '' }] })
      setShowAddForm(false)
      await loadData()
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  const handleAssignVehicle = async (routeId: string) => {
    if (!assignForm.vehicleId) return
    setSubmitting(true)
    try {
      await api.post(`/transport/routes/${routeId}/assign-vehicle`, assignForm)
      setAssignForm({ vehicleId: '', shift: 'MORNING', departureTime: '', arrivalTime: '' })
      setShowAssignModal(null)
      await loadData()
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  const addStop = () => {
    setNewRoute((prev) => ({
      ...prev,
      stops: [...prev.stops, { name: '', address: '', estimatedTime: '' }],
    }))
  }

  const updateStop = (index: number, field: string, value: string) => {
    setNewRoute((prev) => ({
      ...prev,
      stops: prev.stops.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }))
  }

  const removeStop = (index: number) => {
    setNewRoute((prev) => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index),
    }))
  }

  const getCapacityPercent = (route: any) => {
    const max = route.maxCapacity || route.capacity || 0
    const assigned = route.studentCount || route.studentsAssigned || 0
    if (max === 0) return 0
    return Math.min(100, Math.round((assigned / max) * 100))
  }

  const getCapacityColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500'
    if (percent >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  const totalStudents = routes.reduce((sum, r) => sum + (r.studentCount || r.studentsAssigned || 0), 0)
  const totalStops = routes.reduce((sum, r) => sum + (r.stops?.length || 0), 0)

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Route Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage transport routes, stops & vehicle assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Route
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Routes" value={routes.length} icon={Route} color="bg-blue-500" />
        <StatCard title="Total Stops" value={totalStops} icon={MapPin} color="bg-green-500" />
        <StatCard title="Students Assigned" value={totalStudents} icon={Users} color="bg-purple-500" />
        <StatCard title="Vehicles Assigned" value={routes.filter((r) => r.vehicles?.length > 0 || r.assignedVehicle).length} icon={Bus} color="bg-teal-500" />
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Route</h2>
            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Route Name</label>
              <input
                type="text"
                value={newRoute.name}
                onChange={(e) => setNewRoute((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Route A - Downtown"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Route Code</label>
              <input
                type="text"
                value={newRoute.code}
                onChange={(e) => setNewRoute((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="e.g., RT-001"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <input
                type="text"
                value={newRoute.description}
                onChange={(e) => setNewRoute((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stops</label>
              <button
                onClick={addStop}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="w-3 h-3" /> Add Stop
              </button>
            </div>
            <div className="space-y-2">
              {newRoute.stops.map((stop, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400 w-6 text-center shrink-0">{idx + 1}</span>
                  <input
                    type="text"
                    value={stop.name}
                    onChange={(e) => updateStop(idx, 'name', e.target.value)}
                    placeholder="Stop name"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={stop.address}
                    onChange={(e) => updateStop(idx, 'address', e.target.value)}
                    placeholder="Address"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="time"
                    value={stop.estimatedTime}
                    onChange={(e) => updateStop(idx, 'estimatedTime', e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {newRoute.stops.length > 1 && (
                    <button onClick={() => removeStop(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRoute}
              disabled={!newRoute.name || !newRoute.code || submitting}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                newRoute.name && newRoute.code
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              )}
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Create Route
            </button>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Vehicle to Route</h2>
              <button onClick={() => setShowAssignModal(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle</label>
                <select
                  value={assignForm.vehicleId}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, vehicleId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} - {v.type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shift</label>
                <select
                  value={assignForm.shift}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, shift: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="MORNING">Morning</option>
                  <option value="AFTERNOON">Afternoon</option>
                  <option value="EVENING">Evening</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departure Time</label>
                  <input
                    type="time"
                    value={assignForm.departureTime}
                    onChange={(e) => setAssignForm((prev) => ({ ...prev, departureTime: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Arrival Time</label>
                  <input
                    type="time"
                    value={assignForm.arrivalTime}
                    onChange={(e) => setAssignForm((prev) => ({ ...prev, arrivalTime: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAssignModal(null)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignVehicle(showAssignModal)}
                disabled={!assignForm.vehicleId || submitting}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  assignForm.vehicleId
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                )}
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bus className="w-4 h-4" />}
                Assign Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {routes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400">
            <Route className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-lg">No routes configured</p>
            <p className="text-sm mt-1">Create your first route to get started</p>
          </div>
        ) : (
          routes.map((route) => {
            const isExpanded = expandedRoute === route.id
            const capacityPercent = getCapacityPercent(route)
            const capacityColor = getCapacityColor(capacityPercent)
            const stops = route.stops || []
            const assignedVehicles = route.vehicles || (route.assignedVehicle ? [route.assignedVehicle] : [])

            return (
              <div
                key={route.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{route.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {route.code} {route.description ? ` - ${route.description}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAssignModal(route.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                      >
                        <Bus className="w-3.5 h-3.5" />
                        Assign Vehicle
                      </button>
                      <button
                        onClick={() => setExpandedRoute(isExpanded ? null : route.id)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{stops.length} stops</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Bus className="w-4 h-4 shrink-0" />
                      <span>{assignedVehicles.length} vehicle{assignedVehicles.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>{route.studentCount || route.studentsAssigned || 0} students</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{stops.length > 0 ? `${stops[0].estimatedTime || '—'} - ${stops[stops.length - 1].estimatedTime || '—'}` : '—'}</span>
                    </div>
                  </div>

                  {(route.maxCapacity || route.capacity) && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Capacity</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {route.studentCount || route.studentsAssigned || 0} / {route.maxCapacity || route.capacity}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', capacityColor)}
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    {assignedVehicles.length > 0 && (
                      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Assigned Vehicles</h4>
                        <div className="space-y-2">
                          {assignedVehicles.map((v: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <Bus className="w-4 h-4 text-blue-500" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {v.registrationNumber || v.vehicleNumber || v.vehicle?.registrationNumber || '—'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {v.shift || '—'} {v.departureTime ? `| Dep: ${v.departureTime}` : ''} {v.arrivalTime ? `| Arr: ${v.arrivalTime}` : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="px-6 py-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Stops ({stops.length})</h4>
                      {stops.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No stops configured for this route</p>
                      ) : (
                        <div className="relative">
                          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                          <div className="space-y-4">
                            {stops.map((stop: any, idx: number) => (
                              <div key={idx} className="flex items-start gap-3 relative">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-medium z-10 shrink-0">
                                  {idx + 1}
                                </div>
                                <div className="flex-1 pt-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{stop.name}</p>
                                  {stop.address && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{stop.address}</p>
                                  )}
                                  {stop.estimatedTime && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Est. {stop.estimatedTime}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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

export default TransportRoutes

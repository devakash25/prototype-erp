import { useState, useEffect } from 'react'
import {
  Bus, Car, Van, RefreshCw, Filter, Search,
  ToggleLeft, ToggleRight, ShieldCheck, AlertTriangle,
  XCircle, Clock, MapPin, User, Gauge,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/StatCard'
import api from '@/services/api'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
const STATUS_COLORS = ['#10B981', '#6B7280', '#F59E0B', '#EF4444']

export function TransportVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [vehiclesRes, statsRes] = await Promise.allSettled([
        api.get('/transport/vehicles'),
        api.get('/transport/vehicles/stats'),
      ])
      if (vehiclesRes.status === 'fulfilled') setVehicles(vehiclesRes.value.data || [])
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data || null)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleToggle = async (vehicleId: string) => {
    setTogglingId(vehicleId)
    try {
      await api.patch(`/transport/vehicles/${vehicleId}/toggle`)
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === vehicleId
            ? { ...v, status: v.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
            : v
        )
      )
    } catch (err) {
      console.error(err)
    }
    setTogglingId(null)
  }

  const filteredVehicles = vehicles.filter((v) => {
    const matchesTab = activeTab === 'all' || v.status?.toUpperCase() === activeTab.toUpperCase()
    const matchesSearch = !searchQuery ||
      v.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const getDocumentBadge = (expiry: string | undefined) => {
    if (!expiry) return null
    const expDate = new Date(expiry)
    const now = new Date()
    const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntil < 0) return { label: 'Expired', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    if (daysUntil <= 30) return { label: `${daysUntil}d left`, className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' }
    return { label: 'Valid', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
  }

  const getTypeBadge = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'BUS': return { className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Bus }
      case 'VAN': return { className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Van }
      case 'CAR': return { className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Car }
      default: return { className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400', icon: Bus }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'INACTIVE': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const tabs = [
    { value: 'all', label: 'All', count: vehicles.length },
    { value: 'ACTIVE', label: 'Active', count: vehicles.filter((v) => v.status?.toUpperCase() === 'ACTIVE').length },
    { value: 'INACTIVE', label: 'Inactive', count: vehicles.filter((v) => v.status?.toUpperCase() === 'INACTIVE').length },
    { value: 'MAINTENANCE', label: 'Maintenance', count: vehicles.filter((v) => v.status?.toUpperCase() === 'MAINTENANCE').length },
  ]

  const typeData = stats?.byType || []
  const statusData = stats?.byStatus || []

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage fleet vehicles, documents & assignments</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Vehicles" value={vehicles.length} icon={Bus} color="bg-blue-500" />
        <StatCard title="Active" value={vehicles.filter((v) => v.status === 'ACTIVE').length} icon={ShieldCheck} color="bg-green-500" />
        <StatCard title="Inactive" value={vehicles.filter((v) => v.status === 'INACTIVE').length} icon={XCircle} color="bg-gray-500" />
        <StatCard title="In Maintenance" value={vehicles.filter((v) => v.status === 'MAINTENANCE').length} icon={AlertTriangle} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicles by Type</h2>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  dataKey="count"
                  nameKey="type"
                >
                  {typeData.map((_: unknown, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400 dark:text-gray-500">No type data</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicles by Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusData.map((_: unknown, index: number) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400 dark:text-gray-500">No status data</div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    activeTab === tab.value
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  <Filter className="w-4 h-4" />
                  {tab.label}
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Bus className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-lg">No vehicles found</p>
            <p className="text-sm mt-1">No vehicles match the current filter</p>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => {
              const typeBadge = getTypeBadge(vehicle.type)
              const TypeIcon = typeBadge.icon
              const rcExpiry = getDocumentBadge(vehicle.rcExpiry || vehicle.rcExpiryDate)
              const insuranceExpiry = getDocumentBadge(vehicle.insuranceExpiry || vehicle.insuranceExpiryDate)
              const permitExpiry = getDocumentBadge(vehicle.permitExpiry)

              return (
                <div
                  key={vehicle.id}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2.5 rounded-xl', typeBadge.className)}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{vehicle.registrationNumber}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.type}</p>
                      </div>
                    </div>
                    <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', getStatusBadge(vehicle.status))}>
                      {vehicle.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Gauge className="w-3.5 h-3.5 shrink-0" />
                      <span>Capacity: {vehicle.capacity || '—'} seats</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Bus className="w-3.5 h-3.5 shrink-0" />
                      <span>{vehicle.manufacturer || '—'} {vehicle.model || ''} {vehicle.year ? `(${vehicle.year})` : ''}</span>
                    </div>
                    {vehicle.assignedDriver && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        <span>{vehicle.assignedDriver?.name || vehicle.assignedDriver}</span>
                      </div>
                    )}
                    {vehicle.assignedRoute && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{vehicle.assignedRoute?.name || vehicle.assignedRoute}</span>
                      </div>
                    )}
                  </div>

                  {(rcExpiry || insuranceExpiry || permitExpiry) && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {rcExpiry && (
                        <span className={cn('px-2 py-0.5 text-[10px] font-medium rounded-full', rcExpiry.className)}>
                          RC: {rcExpiry.label}
                        </span>
                      )}
                      {insuranceExpiry && (
                        <span className={cn('px-2 py-0.5 text-[10px] font-medium rounded-full', insuranceExpiry.className)}>
                          Insurance: {insuranceExpiry.label}
                        </span>
                      )}
                      {permitExpiry && (
                        <span className={cn('px-2 py-0.5 text-[10px] font-medium rounded-full', permitExpiry.className)}>
                          Permit: {permitExpiry.label}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleToggle(vehicle.id)}
                      disabled={togglingId === vehicle.id || vehicle.status === 'MAINTENANCE'}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-center',
                        vehicle.status === 'ACTIVE'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                          : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30',
                        vehicle.status === 'MAINTENANCE' && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {togglingId === vehicle.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : vehicle.status === 'ACTIVE' ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                      {vehicle.status === 'MAINTENANCE' ? 'Under Maintenance' : vehicle.status === 'ACTIVE' ? 'Set Inactive' : 'Set Active'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default TransportVehicles

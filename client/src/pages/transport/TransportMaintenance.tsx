import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, RefreshCw, Calendar, DollarSign, Plus, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import api from '@/services/api';

export function TransportMaintenance() {
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [form, setForm] = useState({ vehicleId: '', type: 'SERVICE', title: '', description: '', scheduledDate: '', cost: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [m, s, v] = await Promise.allSettled([
        api.get('/transport/maintenance'),
        api.get('/transport/maintenance/stats'),
        api.get('/transport/vehicles'),
      ]);
      setMaintenance(m.status === 'fulfilled' ? m.value.data : []);
      setStats(s.status === 'fulfilled' ? s.value.data : null);
      setVehicles(v.status === 'fulfilled' ? v.value.data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/transport/maintenance', {
        ...form, cost: form.cost ? parseFloat(form.cost) : undefined, scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : undefined,
      });
      setShowForm(false);
      setForm({ vehicleId: '', type: 'SERVICE', title: '', description: '', scheduledDate: '', cost: '' });
      load();
    } catch (e) { console.error(e); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/transport/maintenance/${id}`, { status, completedDate: status === 'COMPLETED' ? new Date().toISOString() : undefined });
      load();
    } catch (e) { console.error(e); }
  };

  const filtered = filter === 'ALL' ? maintenance : maintenance.filter((m) => m.status === filter);

  const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };
  const typeColors: Record<string, string> = {
    SERVICE: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    REPAIR: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    OIL_CHANGE: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    TIRE_CHANGE: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    BRAKE_INSPECTION: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    INSPECTION: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Maintenance</h1>
          <p className="text-gray-500 dark:text-gray-400">Track and manage vehicle maintenance tasks</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"><Plus className="w-4 h-4" />New Task</button>
          <Link to="/transport/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Dashboard</Link>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Maintenance Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"><option value="">Select Vehicle</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}</select>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"><option>SERVICE</option><option>REPAIR</option><option>OIL_CHANGE</option><option>TIRE_CHANGE</option><option>BRAKE_INSPECTION</option></select>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            <input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="Cost" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: maintenance.length, icon: Wrench, color: 'text-gray-600' },
          { label: 'Scheduled', value: maintenance.filter((m) => m.status === 'SCHEDULED').length, icon: Calendar, color: 'text-yellow-600' },
          { label: 'In Progress', value: maintenance.filter((m) => m.status === 'IN_PROGRESS').length, icon: Clock, color: 'text-blue-600' },
          { label: 'Completed', value: maintenance.filter((m) => m.status === 'COMPLETED').length, icon: CheckCircle2, color: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 bg-gray-100 dark:bg-gray-700 rounded-lg', s.color)}><s.icon className="w-5 h-5" /></div>
              <div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium', filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200')}>{f.replace('_', ' ')}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((m) => (
          <div key={m.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><Wrench className="w-5 h-5 text-gray-600 dark:text-gray-400" /></div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{m.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{m.vehicle?.registrationNumber} · {m.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {m.scheduledDate && <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(m.scheduledDate).toLocaleDateString()}</span>}
                {m.cost && <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(m.cost)}</span>}
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusColors[m.status] || '')}>{m.status}</span>
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium', typeColors[m.type] || '')}>{m.type.replace('_', ' ')}</span>
                {m.status === 'SCHEDULED' && <button onClick={() => updateStatus(m.id, 'IN_PROGRESS')} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">Start</button>}
                {m.status === 'IN_PROGRESS' && <button onClick={() => updateStatus(m.id, 'COMPLETED')} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">Complete</button>}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-500 py-8">No maintenance records</p>}
      </div>
    </div>
  );
}

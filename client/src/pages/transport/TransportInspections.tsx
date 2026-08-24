import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, RefreshCw, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/services/api';

export function TransportInspections() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', inspectionType: 'daily', notes: '', checklist: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [i, v] = await Promise.allSettled([
        api.get('/transport/inspections'),
        api.get('/transport/vehicles'),
      ]);
      setInspections(i.status === 'fulfilled' ? i.value.data : []);
      setVehicles(v.status === 'fulfilled' ? v.value.data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const checklist = form.checklist ? JSON.parse(form.checklist) : undefined;
      await api.post('/transport/inspections', { ...form, checklist });
      setShowForm(false);
      setForm({ vehicleId: '', inspectionType: 'daily', notes: '', checklist: '' });
      load();
    } catch (e) { console.error(e); }
  };

  const filtered = filter === 'ALL' ? inspections : inspections.filter((i) => i.status === filter);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Inspections</h1>
          <p className="text-gray-500 dark:text-gray-400">Track daily and weekly vehicle inspections</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"><Plus className="w-4 h-4" />New Inspection</button>
          <Link to="/transport/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Dashboard</Link>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Inspection</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"><option value="">Select Vehicle</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}</select>
            <select value={form.inspectionType} onChange={(e) => setForm({ ...form, inspectionType: e.target.value })} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex gap-2 mb-4">
        {['ALL', 'PASS', 'FAIL'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium', filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200')}>{f}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((ins) => (
          <div key={ins.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn('p-2 rounded-lg', ins.status === 'PASS' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900')}>
                  {ins.status === 'PASS' ? <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" /> : <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{ins.vehicle?.registrationNumber}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{ins.inspectionType} inspection · {new Date(ins.inspectionDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium', ins.status === 'PASS' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300')}>{ins.status}</span>
                {ins.notes && <span className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">{ins.notes}</span>}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-500 py-8">No inspections found</p>}
      </div>
    </div>
  );
}

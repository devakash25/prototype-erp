import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, CheckCircle2, Clock, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/services/api';

export function TransportComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/transport/complaints');
      setComplaints(r.data?.data ?? r.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/transport/complaints/${id}`, { status });
      load();
    } catch (e) { console.error(e); }
  };

  const filtered = filter === 'ALL' ? complaints : complaints.filter((c) => c.status === filter);

  const statusColors: Record<string, string> = {
    open: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transport Complaints</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage and resolve transport-related complaints</p>
        </div>
        <Link to="/transport/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Dashboard</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: complaints.length, color: 'text-gray-600' },
          { label: 'Open', value: complaints.filter((c) => c.status === 'open').length, color: 'text-red-600' },
          { label: 'In Progress', value: complaints.filter((c) => c.status === 'in_progress').length, color: 'text-yellow-600' },
          { label: 'Resolved', value: complaints.filter((c) => c.status === 'resolved').length, color: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {['ALL', 'open', 'in_progress', 'resolved', 'closed'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize', filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200')}>{f.replace('_', ' ')}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg mt-1"><AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" /></div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{c.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{c.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>By: {c.student?.user?.firstName} {c.student?.user?.lastName}</span>
                    <span>·</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusColors[c.status] || '')}>{c.status?.replace('_', ' ')}</span>
                {c.status === 'open' && (
                  <button onClick={() => updateStatus(c.id, 'in_progress')} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200">Start</button>
                )}
                {c.status === 'in_progress' && (
                  <button onClick={() => updateStatus(c.id, 'resolved')} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">Resolve</button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-500 py-8">No complaints found</p>}
      </div>
    </div>
  );
}

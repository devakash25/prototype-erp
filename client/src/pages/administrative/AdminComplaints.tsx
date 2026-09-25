import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Filter, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/services/api';

export function AdminComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/administrative/complaints');
      setComplaints(r.data?.data ?? r.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/administrative/complaints/${id}`, { status });
      load();
    } catch (e) { console.error(e); }
  };

  const filtered = filter === 'ALL' ? complaints : complaints.filter((c) => c.status?.toLowerCase() === filter.toLowerCase());

  const statusColors: Record<string, string> = {
    OPEN: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    CLOSED: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  const priorityColors: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    NORMAL: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    HIGH: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    URGENT: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complaint Coordination</h1>
          <p className="text-gray-500 dark:text-gray-400">Route and resolve administrative complaints</p>
        </div>
        <Link to="/administrative/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Dashboard</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: complaints.length },
          { label: 'Open', value: complaints.filter((c) => c.status === 'OPEN').length },
          { label: 'In Progress', value: complaints.filter((c) => c.status === 'IN_PROGRESS').length },
          { label: 'Resolved', value: complaints.filter((c) => c.status === 'RESOLVED').length },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium', filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200')}>{f.replace('_', ' ')}</button>
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
                    <span>By: {c.creator?.firstName} {c.creator?.lastName}</span>
                    <span>·</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    {c.category && <><span>·</span><span className="capitalize">{c.category}</span></>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {c.priority && <span className={cn('px-2 py-1 rounded-full text-xs font-medium', priorityColors[c.priority] || '')}>{c.priority}</span>}
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusColors[c.status] || '')}>{c.status?.replace('_', ' ')}</span>
                {c.status === 'OPEN' && (
                  <button onClick={() => updateStatus(c.id, 'IN_PROGRESS')} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 flex items-center gap-1">Forward <ArrowRight className="w-3 h-3" /></button>
                )}
                {c.status === 'IN_PROGRESS' && (
                  <button onClick={() => updateStatus(c.id, 'RESOLVED')} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">Resolve</button>
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

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserMinus, UserPlus, RefreshCw, Search, Bus, Route } from 'lucide-react';
import api from '@/services/api';

export function TransportStudentAllocation() {
  const [allocated, setAllocated] = useState<any[]>([]);
  const [unallocated, setUnallocated] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [allocating, setAllocating] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [a, u, r] = await Promise.allSettled([
        api.get('/transport/students'),
        api.get('/transport/students/unallocated'),
        api.get('/transport/routes'),
      ]);
      setAllocated(a.status === 'fulfilled' ? a.value.data : []);
      setUnallocated(u.status === 'fulfilled' ? u.value.data : []);
      setRoutes(r.status === 'fulfilled' ? r.value.data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAllocate = async (studentId: string) => {
    if (!selectedRoute) return;
    setAllocating(studentId);
    try {
      await api.post(`/transport/students/${studentId}/allocate`, { routeId: selectedRoute });
      await load();
    } catch (e) { console.error(e); }
    setAllocating(null);
  };

  const handleDeallocate = async (studentId: string) => {
    try {
      await api.post(`/transport/students/${studentId}/deallocate`);
      await load();
    } catch (e) { console.error(e); }
  };

  const filteredUnallocated = unallocated.filter((s) =>
    `${s.user?.firstName} ${s.user?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const routeMap = routes.reduce((m: any, r: any) => { m[r.id] = r; return m; }, {});

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Transport Allocation</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage student route assignments</p>
        </div>
        <Link to="/transport/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Back to Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3"><div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg"><Users className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div><div><p className="text-sm text-gray-500 dark:text-gray-400">On Transport</p><p className="text-xl font-bold text-gray-900 dark:text-white">{allocated.length}</p></div></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3"><div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg"><Bus className="w-5 h-5 text-green-600 dark:text-green-400" /></div><div><p className="text-sm text-gray-500 dark:text-gray-400">Allocated</p><p className="text-xl font-bold text-gray-900 dark:text-white">{allocated.filter((s) => s.transportRoute).length}</p></div></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3"><div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg"><UserMinus className="w-5 h-5 text-red-600 dark:text-red-400" /></div><div><p className="text-sm text-gray-500 dark:text-gray-400">Unallocated</p><p className="text-xl font-bold text-gray-900 dark:text-white">{unallocated.length}</p></div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Allocated Students ({allocated.length})</h2>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                <tr><th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Student</th><th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Dept</th><th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Route</th><th className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">Action</th></tr>
              </thead>
              <tbody>
                {allocated.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-3 py-2"><p className="font-medium text-gray-900 dark:text-white">{s.user?.firstName} {s.user?.lastName}</p><p className="text-xs text-gray-500">{s.admissionNumber}</p></td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{s.department?.name}</td>
                    <td className="px-3 py-2">{s.transportRoute ? <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs">{s.transportRoute.code}</span> : <span className="text-gray-400">-</span>}</td>
                    <td className="px-3 py-2 text-right">
                      {s.transportRoute && (
                        <button onClick={() => handleDeallocate(s.id)} className="text-red-600 hover:text-red-800 text-xs">Remove</button>
                      )}
                    </td>
                  </tr>
                ))}
                {allocated.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-gray-500">No students on transport</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Allocate Students ({unallocated.length})</h2>
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            </div>
            <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
              <option value="">Select Route</option>
              {routes.map((r) => <option key={r.id} value={r.id}>{r.code} - {r.name}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                <tr><th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Student</th><th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Dept</th><th className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">Action</th></tr>
              </thead>
              <tbody>
                {filteredUnallocated.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-3 py-2"><p className="font-medium text-gray-900 dark:text-white">{s.user?.firstName} {s.user?.lastName}</p><p className="text-xs text-gray-500">{s.admissionNumber}</p></td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{s.department?.name}</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => handleAllocate(s.id)} disabled={!selectedRoute || allocating === s.id} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700 disabled:opacity-50">
                        {allocating === s.id ? 'Allocating...' : 'Allocate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUnallocated.length === 0 && <tr><td colSpan={3} className="px-3 py-8 text-center text-gray-500">No unallocated students</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

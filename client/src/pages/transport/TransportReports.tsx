import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, RefreshCw, Download, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/services/api';

export function TransportReports() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/transport/reports');
      setReports(r.data?.data ?? r.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  const vehicleData = reports?.vehicleStats?.map((v: any) => ({
    name: `${v.type} (${v.status})`,
    count: v._count,
  })) || [];

  const maintenanceData = reports?.maintenanceStats?.map((m: any) => ({
    name: m.type.replace('_', ' '),
    count: m._count,
    cost: Number(m._sum.cost || 0),
  })) || [];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transport Reports</h1>
          <p className="text-gray-500 dark:text-gray-400">Comprehensive transport analytics and reports</p>
        </div>
        <Link to="/transport/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fleet Status</h3>
          {vehicleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vehicleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }} />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-center py-8">No data</p>}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Maintenance by Type</h3>
          {maintenanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={maintenanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }} />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-center py-8">No data</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Route Details</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {reports?.routeStats?.map((r: any) => (
              <div key={r.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">{r.code} - {r.name}</span>
                  <span className="text-sm text-gray-500">{r.students?.length || 0} students</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{r.stops?.length || 0} stops · {r.vehicles?.length || 0} vehicles assigned</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Complaint Status</h3>
          <div className="space-y-4">
            {reports?.complaintStats?.map((c: any) => (
              <div key={c.status} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="capitalize text-gray-900 dark:text-white">{c.status?.replace('_', ' ')}</span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{c._count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

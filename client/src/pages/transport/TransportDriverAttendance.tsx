import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, RefreshCw, Calendar, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/services/api';

export function TransportDriverAttendance() {
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { load(); }, [date]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/transport/drivers/attendance?date=${date}`);
      setAttendance(r.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const markAttendance = async (driverId: string, status: string) => {
    setSaving(driverId);
    try {
      await api.post('/transport/drivers/attendance', { driverId, date, status, notes: '' });
      load();
    } catch (e) { console.error(e); }
    setSaving(null);
  };

  const getStatusForDriver = (driverId: string) => {
    return attendance?.attendance?.find((a: any) => a.driverId === driverId)?.status || null;
  };

  const presentCount = attendance?.attendance?.filter((a: any) => a.status === 'PRESENT').length || 0;
  const absentCount = attendance?.attendance?.filter((a: any) => a.status === 'ABSENT').length || 0;

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Driver Attendance</h1>
          <p className="text-gray-500 dark:text-gray-400">Track and manage daily driver attendance</p>
        </div>
        <Link to="/transport/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Dashboard</Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg"><UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Total Drivers</p><p className="text-xl font-bold text-gray-900 dark:text-white">{attendance?.drivers?.length || 0}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Present</p><p className="text-xl font-bold text-green-600">{presentCount}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg"><XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /></div>
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Absent</p><p className="text-xl font-bold text-red-600">{absentCount}</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Drivers</h3>
        <div className="space-y-3">
          {attendance?.drivers?.map((driver: any) => {
            const status = getStatusForDriver(driver.id);
            return (
              <div key={driver.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{driver.user?.firstName?.[0]}{driver.user?.lastName?.[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{driver.user?.firstName} {driver.user?.lastName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{driver.employeeCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {status && <span className={cn('px-3 py-1 rounded-full text-xs font-medium', status === 'PRESENT' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : status === 'ABSENT' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300')}>{status}</span>}
                  <button onClick={() => markAttendance(driver.id, 'PRESENT')} disabled={saving === driver.id} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium', status === 'PRESENT' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300')}>
                    {saving === driver.id ? '...' : 'Present'}
                  </button>
                  <button onClick={() => markAttendance(driver.id, 'ABSENT')} disabled={saving === driver.id} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium', status === 'ABSENT' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300')}>
                    Absent
                  </button>
                  <button onClick={() => markAttendance(driver.id, 'LEAVE')} disabled={saving === driver.id} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium', status === 'LEAVE' ? 'bg-yellow-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300')}>
                    Leave
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

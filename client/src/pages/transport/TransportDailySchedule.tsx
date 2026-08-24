import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, RefreshCw, Bus, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/services/api';

export function TransportDailySchedule() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/transport/schedule');
      setSchedule(r.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Transport Schedule</h1>
          <p className="text-gray-500 dark:text-gray-400">Today's transport operations overview</p>
        </div>
        <Link to="/transport/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Dashboard</Link>
      </div>

      <div className="space-y-4">
        {schedule.map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <Bus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-gray-900 dark:text-white">{s.vehicleRegistration}</p>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">{s.vehicleType}</span>
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', s.vehicleStatus === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300')}>{s.vehicleStatus}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.routeName} ({s.routeCode}) · Shift: <span className="capitalize">{s.shift}</span></p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Departure: {s.departureTime ? new Date(s.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Arrival: {s.arrivalTime ? new Date(s.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                  </div>
                </div>
              </div>
            </div>
            {s.stops && s.stops.length > 0 && (
              <div className="mt-4 ml-14">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Stops</p>
                <div className="flex flex-wrap gap-2">
                  {s.stops.map((stop: string, j: number) => (
                    <span key={j} className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                      <MapPin className="w-3 h-3 text-gray-400" />{stop}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {schedule.length === 0 && <p className="text-center text-gray-500 py-8">No schedule found</p>}
      </div>
    </div>
  );
}

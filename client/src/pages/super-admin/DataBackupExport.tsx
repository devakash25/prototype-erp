import { useState, useEffect } from 'react';
import api from '@/services/api';
import { cn, formatDateTime } from '@/lib/utils';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Trash2,
  Shield,
  File,
  Archive,
} from 'lucide-react';

interface BackupItem {
  id: string;
  date: string;
  type: string;
  size: string;
  status: 'success' | 'failed' | 'in_progress';
}

interface BackupSettings {
  auto_backup_enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
}

const SELECTABLE_TABLES = [
  { key: 'students', label: 'Students' },
  { key: 'faculty', label: 'Faculty' },
  { key: 'fees', label: 'Fee Data' },
  { key: 'exams', label: 'Exam Data' },
  { key: 'library', label: 'Library Data' },
];

const EXPORT_OPTIONS = [
  { key: 'students', title: 'Export Students Data', formats: ['CSV', 'JSON'] },
  { key: 'financial', title: 'Export Financial Data', formats: ['CSV', 'JSON'] },
  { key: 'academic', title: 'Export Academic Data', formats: ['CSV', 'JSON'] },
  { key: 'all', title: 'Export All Data', formats: ['ZIP'] },
];

export default function DataBackupExport() {
  const [backupHistory, setBackupHistory] = useState<BackupItem[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [settings, setSettings] = useState<BackupSettings>({
    auto_backup_enabled: false,
    frequency: 'daily',
  });
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [backupsRes, settingsRes] = await Promise.all([
        api.get('/backups'),
        api.get('/backups/settings'),
      ]);
      setBackupHistory(backupsRes.data?.items || []);
      setSettings(settingsRes.data || settings);
    } catch (error) {
      console.error('Failed to fetch backup data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFullBackup = async () => {
    setCreatingBackup(true);
    try {
      await api.post('/backups', { type: 'full' });
      await fetchData();
    } catch (error) {
      console.error('Failed to create backup:', error);
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleSelectiveBackup = async () => {
    if (selectedTables.length === 0) return;
    setCreatingBackup(true);
    try {
      await api.post('/backups', { type: 'selective', tables: selectedTables });
      setSelectedTables([]);
      await fetchData();
    } catch (error) {
      console.error('Failed to create selective backup:', error);
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDownload = async (backupId: string) => {
    try {
      const response = await api.get(`/backups/${backupId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${backupId}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download backup:', error);
    }
  };

  const handleToggleAutoBackup = async () => {
    try {
      const newSettings = { ...settings, auto_backup_enabled: !settings.auto_backup_enabled };
      await api.put('/backups/settings', newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to update backup settings:', error);
    }
  };

  const handleFrequencyChange = async (frequency: BackupSettings['frequency']) => {
    try {
      const newSettings = { ...settings, frequency };
      await api.put('/backups/settings', newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to update frequency:', error);
    }
  };

  const handleTableToggle = (tableKey: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableKey) ? prev.filter((t) => t !== tableKey) : [...prev, tableKey]
    );
  };

  const handleRestore = async () => {
    if (!restoreFile || !restoreConfirm) return;
    setRestoring(true);
    try {
      const formData = new FormData();
      formData.append('file', restoreFile);
      await api.post('/backups/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRestoreFile(null);
      setRestoreConfirm(false);
      alert('Data restored successfully!');
    } catch (error) {
      console.error('Failed to restore:', error);
      alert('Restore failed. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const handleExport = async (key: string, format: string) => {
    setExporting(`${key}-${format}`);
    try {
      const response = await api.get(`/export/${key}`, {
        params: { format: format.toLowerCase() },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format.toLowerCase() === 'zip' ? 'zip' : format.toLowerCase();
      link.setAttribute('download', `export-${key}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(null);
    }
  };

  const getStatusIcon = (status: BackupItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusLabel = (status: BackupItem['status']) => {
    switch (status) {
      case 'success':
        return <span className="text-green-700 font-medium">Success</span>;
      case 'failed':
        return <span className="text-red-700 font-medium">Failed</span>;
      case 'in_progress':
        return <span className="text-yellow-700 font-medium">In Progress</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Database className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Backup & Export</h1>
          <p className="text-gray-500">Manage system backups, exports, and data restoration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Backup</h2>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleFullBackup}
                disabled={creatingBackup}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creatingBackup ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Database className="h-5 w-5" />
                )}
                {creatingBackup ? 'Creating Backup...' : 'Full Database Backup'}
              </button>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Selective Backup</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {SELECTABLE_TABLES.map((table) => (
                    <label
                      key={table.key}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
                        selectedTables.includes(table.key)
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTables.includes(table.key)}
                        onChange={() => handleTableToggle(table.key)}
                        className="h-4 w-4 text-indigo-600 rounded"
                      />
                      <span className="text-sm">{table.label}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleSelectiveBackup}
                  disabled={creatingBackup || selectedTables.length === 0}
                  className="flex items-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Backup Selected ({selectedTables.length})
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Backup History</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Size</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {backupHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No backups found
                      </td>
                    </tr>
                  ) : (
                    backupHistory.map((backup) => (
                      <tr key={backup.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 text-sm text-gray-900">
                          {formatDateTime(backup.date)}
                        </td>
                        <td className="py-3 px-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <File className="h-3 w-3" />
                            {backup.type}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">{backup.size}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(backup.status)}
                            {getStatusLabel(backup.status)}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          {backup.status === 'success' && (
                            <button
                              onClick={() => handleDownload(backup.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Auto Backup</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Enable Auto Backup</span>
                <button
                  onClick={handleToggleAutoBackup}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    settings.auto_backup_enabled ? 'bg-indigo-600' : 'bg-gray-200'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      settings.auto_backup_enabled ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {settings.auto_backup_enabled && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Frequency</label>
                  <select
                    value={settings.frequency}
                    onChange={(e) =>
                      handleFrequencyChange(e.target.value as BackupSettings['frequency'])
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Archive className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXPORT_OPTIONS.map((option) => (
            <div
              key={option.key}
              className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-3">{option.title}</h3>
              <div className="flex flex-col gap-2">
                {option.formats.map((format) => (
                  <button
                    key={format}
                    onClick={() => handleExport(option.key, format)}
                    disabled={exporting === `${option.key}-${format}`}
                    className={cn(
                      'flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      exporting === `${option.key}-${format}`
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {exporting === `${option.key}-${format}` ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {format}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Import / Restore</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800">Warning: Data Loss Risk</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Restoring from a backup will overwrite all existing data. This action cannot be
                undone. Please ensure you have a recent backup before proceeding.
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-2">
              {restoreFile ? restoreFile.name : 'Drag and drop your backup file here, or'}
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
              <File className="h-4 w-4" />
              {restoreFile ? 'Change File' : 'Choose File'}
              <input
                type="file"
                accept=".sql,.zip,.backup"
                onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          {restoreFile && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreConfirm}
                  onChange={(e) => setRestoreConfirm(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  I understand this will overwrite existing data and cannot be undone
                </span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRestore}
                  disabled={!restoreConfirm || restoring}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                    !restoreConfirm || restoring
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  )}
                >
                  {restoring ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {restoring ? 'Restoring...' : 'Confirm Restore'}
                </button>
                <button
                  onClick={() => {
                    setRestoreFile(null);
                    setRestoreConfirm(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

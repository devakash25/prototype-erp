import { useState, useEffect } from 'react';
import api from '@/services/api';
import { cn, exportToCSV } from '@/lib/utils';
import {
  FileText,
  Plus,
  Trash2,
  Play,
  Save,
  Download,
  Filter,
  RefreshCw,
  Calendar,
  Eye,
  Edit3,
  X,
  ChevronDown,
} from 'lucide-react';

const DATA_SOURCES = ['Students', 'Faculty', 'Fees', 'Exams', 'Attendance', 'Library'] as const;
type DataSource = (typeof DATA_SOURCES)[number];

const DATA_SOURCE_FIELDS: Record<DataSource, string[]> = {
  Students: ['id', 'name', 'email', 'enrollmentNo', 'department', 'course', 'year', 'cgpa', 'attendance'],
  Faculty: ['id', 'name', 'email', 'department', 'designation', 'qualification', 'experience'],
  Fees: ['id', 'studentName', 'feeStructure', 'amount', 'paidAmount', 'balance', 'status', 'dueDate'],
  Exams: ['id', 'studentName', 'subject', 'marks', 'totalMarks', 'grade', 'semester'],
  Attendance: ['id', 'studentName', 'date', 'status', 'subject'],
  Library: ['id', 'studentName', 'bookTitle', 'issueDate', 'returnDate', 'status'],
};

const OPERATORS = ['equals', 'contains', 'greater than', 'less than', 'not equals', 'starts with'] as const;

interface FilterRow {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface ReportConfig {
  name: string;
  dataSource: DataSource;
  columns: string[];
  filters: FilterRow[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  groupBy: string;
  limit: number;
  offset: number;
  schedule: {
    enabled: boolean;
    frequency: 'Daily' | 'Weekly' | 'Monthly';
    recipients: string;
  };
}

interface SavedReport {
  id: string;
  name: string;
  dataSource: string;
  createdAt: string;
}

const defaultConfig: ReportConfig = {
  name: '',
  dataSource: 'Students',
  columns: [],
  filters: [],
  sortBy: '',
  sortOrder: 'asc',
  groupBy: '',
  limit: 50,
  offset: 0,
  schedule: {
    enabled: false,
    frequency: 'Weekly',
    recipients: '',
  },
};

export default function CustomReportBuilder() {
  const [config, setConfig] = useState<ReportConfig>({ ...defaultConfig });
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'saved'>('builder');

  useEffect(() => {
    fetchSavedReports();
  }, []);

  useEffect(() => {
    setConfig((prev) => ({ ...prev, columns: [] }));
  }, [config.dataSource]);

  async function fetchSavedReports() {
    setLoading(true);
    try {
      const data = await api.get('/custom-reports');
      setSavedReports(data);
    } catch {
      setSavedReports([
        { id: '1', name: 'Student Performance', dataSource: 'Students', createdAt: '2026-08-10' },
        { id: '2', name: 'Fee Collection Summary', dataSource: 'Fees', createdAt: '2026-08-12' },
        { id: '3', name: 'Exam Results by Dept', dataSource: 'Exams', createdAt: '2026-08-14' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPreview() {
    setPreviewLoading(true);
    try {
      const data = await api.post('/custom-reports/preview', config);
      setPreviewData(data);
    } catch {
      const fields = DATA_SOURCE_FIELDS[config.dataSource];
      const mock = Array.from({ length: 5 }, (_, i) => {
        const row: Record<string, any> = {};
        fields.forEach((f) => {
          if (f === 'id') row[f] = i + 1;
          else if (f === 'name' || f === 'studentName') row[f] = `Sample ${f} ${i + 1}`;
          else if (f === 'email') row[f] = `user${i + 1}@example.com`;
          else if (f === 'amount' || f === 'paidAmount' || f === 'balance' || f === 'marks' || f === 'totalMarks' || f === 'cgpa')
            row[f] = Math.round(Math.random() * 1000);
          else if (f.includes('Date') || f === 'date' || f === 'dueDate') row[f] = `2026-08-${String(10 + i).padStart(2, '0')}`;
          else row[f] = `${f}_val${i + 1}`;
        });
        return row;
      });
      setPreviewData(mock);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function saveReport() {
    if (!config.name.trim()) return alert('Please enter a report name.');
    try {
      await api.post('/custom-reports', config);
      fetchSavedReports();
      setActiveTab('saved');
    } catch {
      setSavedReports((prev) => [
        ...prev,
        { id: String(Date.now()), name: config.name, dataSource: config.dataSource, createdAt: new Date().toISOString().split('T')[0] },
      ]);
      setActiveTab('saved');
    }
  }

  async function deleteReport(id: string) {
    try {
      await api.delete(`/custom-reports/${id}`);
    } finally {
      setSavedReports((prev) => prev.filter((r) => r.id !== id));
    }
  }

  async function runReport(id: string) {
    setLoading(true);
    try {
      const data = await api.post(`/custom-reports/${id}/run`);
      setPreviewData(data);
      setActiveTab('builder');
    } catch {
      fetchPreview();
      setActiveTab('builder');
    } finally {
      setLoading(false);
    }
  }

  function addFilter() {
    const fields = DATA_SOURCE_FIELDS[config.dataSource];
    setConfig((prev) => ({
      ...prev,
      filters: [
        ...prev.filters,
        { id: String(Date.now()), field: fields[1] || '', operator: 'equals', value: '' },
      ],
    }));
  }

  function updateFilter(id: string, key: keyof FilterRow, value: string) {
    setConfig((prev) => ({
      ...prev,
      filters: prev.filters.map((f) => (f.id === id ? { ...f, [key]: value } : f)),
    }));
  }

  function removeFilter(id: string) {
    setConfig((prev) => ({ ...prev, filters: prev.filters.filter((f) => f.id !== id) }));
  }

  function toggleColumn(col: string) {
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.includes(col) ? prev.columns.filter((c) => c !== col) : [...prev.columns, col],
    }));
  }

  function selectAllColumns() {
    setConfig((prev) => ({ ...prev, columns: [...DATA_SOURCE_FIELDS[prev.dataSource]] }));
  }

  const availableFields = DATA_SOURCE_FIELDS[config.dataSource];
  const previewColumns = config.columns.length > 0 ? config.columns : availableFields;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Custom Report Builder</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('builder')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === 'builder' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Eye className="h-4 w-4 inline mr-1" />
              Builder
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === 'saved' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <FileText className="h-4 w-4 inline mr-1" />
              Saved Reports ({savedReports.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'saved' ? (
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Saved Reports</h2>
              <button
                onClick={() => { setConfig({ ...defaultConfig }); setActiveTab('builder'); }}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> New Report
              </button>
            </div>
            {savedReports.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">No saved reports yet.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Data Source</th>
                    <th className="px-6 py-3">Created</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {savedReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{report.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                          {report.dataSource}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{report.createdAt}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => runReport(report.id)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Run"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setConfig((prev) => ({ ...prev, name: report.name, dataSource: report.dataSource as DataSource }));
                              setActiveTab('builder');
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteReport(report.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Builder Panel */}
            <div className="space-y-5">
              {/* Report Name */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Monthly Student Performance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* Data Source & Columns */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
                <div className="relative mb-4">
                  <select
                    value={config.dataSource}
                    onChange={(e) => setConfig((p) => ({ ...p, dataSource: e.target.value as DataSource }))}
                    className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none pr-8"
                  >
                    {DATA_SOURCES.map((ds) => (
                      <option key={ds} value={ds}>{ds}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Columns</label>
                  <button onClick={selectAllColumns} className="text-xs text-indigo-600 hover:underline">Select All</button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                  {availableFields.map((field) => (
                    <label key={field} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={config.columns.includes(field)}
                        onChange={() => toggleColumn(field)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-gray-700">{field}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">Filters</label>
                  </div>
                  <button onClick={addFilter} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add Filter
                  </button>
                </div>
                {config.filters.length === 0 && (
                  <p className="text-sm text-gray-400">No filters added.</p>
                )}
                <div className="space-y-2">
                  {config.filters.map((filter) => (
                    <div key={filter.id} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          value={filter.field}
                          onChange={(e) => updateFilter(filter.id, 'field', e.target.value)}
                          className="w-full appearance-none px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none pr-6"
                        >
                          {availableFields.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                      </div>
                      <div className="relative flex-1">
                        <select
                          value={filter.operator}
                          onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                          className="w-full appearance-none px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none pr-6"
                        >
                          {OPERATORS.map((op) => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                      </div>
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                        placeholder="Value"
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button onClick={() => removeFilter(filter.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort, Group, Limit */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <select
                        value={config.sortBy}
                        onChange={(e) => setConfig((p) => ({ ...p, sortBy: e.target.value }))}
                        className="w-full appearance-none px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none pr-6"
                      >
                        <option value="">None</option>
                        {availableFields.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                    </div>
                    <button
                      onClick={() => setConfig((p) => ({ ...p, sortOrder: p.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                      className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-gray-50"
                    >
                      {config.sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Group By</label>
                  <div className="relative">
                    <select
                      value={config.groupBy}
                      onChange={(e) => setConfig((p) => ({ ...p, groupBy: e.target.value }))}
                      className="w-full appearance-none px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none pr-6"
                    >
                      <option value="">None</option>
                      {availableFields.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Limit</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={config.limit}
                    onChange={(e) => setConfig((p) => ({ ...p, limit: parseInt(e.target.value) || 50 }))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Offset</label>
                  <input
                    type="number"
                    min={0}
                    value={config.offset}
                    onChange={(e) => setConfig((p) => ({ ...p, offset: parseInt(e.target.value) || 0 }))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <label className="text-sm font-medium text-gray-700">Schedule Report</label>
                </div>
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.schedule.enabled}
                    onChange={(e) => setConfig((p) => ({ ...p, schedule: { ...p.schedule, enabled: e.target.checked } }))}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">Enable scheduling</span>
                </label>
                {config.schedule.enabled && (
                  <div className="space-y-3 pl-6 border-l-2 border-indigo-100">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                      <div className="relative">
                        <select
                          value={config.schedule.frequency}
                          onChange={(e) =>
                            setConfig((p) => ({
                              ...p,
                              schedule: { ...p.schedule, frequency: e.target.value as 'Daily' | 'Weekly' | 'Monthly' },
                            }))
                          }
                          className="w-full appearance-none px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none pr-6"
                        >
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email Recipients</label>
                      <input
                        type="text"
                        value={config.schedule.recipients}
                        onChange={(e) => setConfig((p) => ({ ...p, schedule: { ...p.schedule, recipients: e.target.value } }))}
                        placeholder="comma-separated emails"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchPreview}
                  disabled={previewLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={cn('h-4 w-4', previewLoading && 'animate-spin')} />
                  {previewLoading ? 'Loading...' : 'Preview'}
                </button>
                <button
                  onClick={saveReport}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Save className="h-4 w-4" /> Save
                </button>
                <button
                  onClick={() => exportToCSV(previewData, config.name || 'report')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4" /> CSV
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:sticky lg:top-6 lg:self-start">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Preview</h3>
                </div>
                <span className="text-xs text-gray-500">{previewData.length} rows</span>
              </div>
              <div className="overflow-auto max-h-[calc(100vh-220px)]">
                {previewLoading ? (
                  <div className="px-5 py-16 text-center text-gray-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Loading preview...</p>
                  </div>
                ) : previewData.length === 0 ? (
                  <div className="px-5 py-16 text-center text-gray-400">
                    <Eye className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Click "Preview" to see report data</p>
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 sticky top-0">
                        {previewColumns.map((col) => (
                          <th key={col} className="px-3 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {previewData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          {previewColumns.map((col) => (
                            <td key={col} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                              {row[col] ?? '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

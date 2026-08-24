import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { cn, formatNumber, exportToCSV, formatCurrency } from "@/lib/utils";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { StatsSkeleton } from "@/components/LoadingSkeleton";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, GraduationCap, TrendingUp, Download, RefreshCw } from "lucide-react";

const TABS = ["Overview", "Demographics", "Performance", "Attendance", "Fees"] as const;
type Tab = (typeof TABS)[number];

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#4f46e5", "#7c3aed", "#818cf8", "#3730a3"];

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function StudentAnalytics() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);

  const dateParams = dateRange ? `?from=${dateRange.from}&to=${dateRange.to}` : "";

  const { data: overview, loading: overviewLoading, refetch: refetchOverview } = useApi(`/analytics/students/overview${dateParams}`);
  const { data: demographics, loading: demographicsLoading, refetch: refetchDemographics } = useApi(`/analytics/students/demographics${dateParams}`);
  const { data: performance, loading: performanceLoading, refetch: refetchPerformance } = useApi(`/analytics/students/performance${dateParams}`);
  const { data: attendance, loading: attendanceLoading, refetch: refetchAttendance } = useApi(`/analytics/students/attendance${dateParams}`);
  const { data: fees, loading: feesLoading, refetch: refetchFees } = useApi(`/analytics/students/fees${dateParams}`);

  const refetchAll = () => {
    refetchOverview();
    refetchDemographics();
    refetchPerformance();
    refetchAttendance();
    refetchFees();
  };

  const handleExport = () => {
    let csvData: Record<string, string | number>[] = [];
    let filename = "student-analytics";

    if (activeTab === "Overview" && overview) {
      csvData = overview?.enrollmentTrend || [];
      filename = "student-overview";
    } else if (activeTab === "Demographics" && demographics) {
      csvData = demographics?.categoryDistribution || [];
      filename = "student-demographics";
    } else if (activeTab === "Performance" && performance) {
      csvData = performance?.topStudents || [];
      filename = "student-performance";
    } else if (activeTab === "Attendance" && attendance) {
      csvData = attendance?.lowAttendanceStudents || [];
      filename = "student-attendance";
    } else if (activeTab === "Fees" && fees) {
      csvData = fees?.defaulterStudents || [];
      filename = "student-fees";
    }

    if (csvData.length > 0) {
      exportToCSV(csvData, filename);
    }
  };

  const stats = overview?.stats || {};

  const statCards = [
    {
      label: "Total Students",
      value: formatNumber(stats.totalStudents || 0),
      icon: Users,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Avg Attendance",
      value: `${(stats.avgAttendance || 0).toFixed(1)}%`,
      icon: GraduationCap,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Avg CGPA",
      value: (stats.avgCGPA || 0).toFixed(2),
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Pass Rate",
      value: `${(stats.passRate || 0).toFixed(1)}%`,
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Fee Collection Rate",
      value: `${(stats.feeCollectionRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Active Students",
      value: formatNumber(stats.activeStudents || 0),
      icon: Users,
      color: "bg-cyan-50 text-cyan-600",
    },
  ];

  const renderTooltip = (payload: any[]) => {
    if (!payload || payload.length === 0) return null;
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-md">
        <p className="text-xs font-medium text-gray-500 mb-1">{payload[0]?.payload?.label || payload[0]?.payload?.name}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold text-gray-900">
            {entry.name}: {typeof entry.value === "number" ? formatNumber(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Comprehensive student performance and enrollment insights</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter onChange={setDateRange} />
          <button
            onClick={refetchAll}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {overviewLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === "Overview" && (
          <OverviewTab data={overview} loading={overviewLoading} renderTooltip={renderTooltip} />
        )}
        {activeTab === "Demographics" && (
          <DemographicsTab data={demographics} loading={demographicsLoading} renderTooltip={renderTooltip} />
        )}
        {activeTab === "Performance" && (
          <PerformanceTab data={performance} loading={performanceLoading} />
        )}
        {activeTab === "Attendance" && (
          <AttendanceTab data={attendance} loading={attendanceLoading} renderTooltip={renderTooltip} />
        )}
        {activeTab === "Fees" && (
          <FeesTab data={fees} loading={feesLoading} renderTooltip={renderTooltip} />
        )}
      </div>
    </div>
  );
}

function OverviewTab({ data, loading, renderTooltip }: { data: any; loading: boolean; renderTooltip: (payload: any[]) => React.ReactNode }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  const enrollmentTrend = data?.enrollmentTrend || [];
  const departmentDistribution = data?.departmentDistribution || [];
  const genderDistribution = data?.genderDistribution || [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Student Enrollment Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={enrollmentTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip content={renderTooltip([{ name: "Enrolled", value: 0, payload: { label: "" } }])} />
            <Legend />
            <Line
              type="monotone"
              dataKey="enrolled"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 4, fill: "#6366f1" }}
              activeDot={{ r: 6 }}
              name="Enrolled"
            />
            <Line
              type="monotone"
              dataKey="graduated"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4, fill: "#10b981" }}
              activeDot={{ r: 6 }}
              name="Graduated"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Department Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={departmentDistribution}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {departmentDistribution.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatNumber(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Gender Distribution</h3>
        <div className="flex items-center justify-center gap-12">
          {genderDistribution.map((item: any, index: number) => (
            <div key={item.name} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}>
                {item.name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-gray-500">{item.name}</p>
                <p className="text-lg font-bold text-gray-900">{formatNumber(item.value)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemographicsTab({ data, loading, renderTooltip }: { data: any; loading: boolean; renderTooltip: (payload: any[]) => React.ReactNode }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  const categoryDistribution = data?.categoryDistribution || [];
  const stateDistribution = data?.stateDistribution || [];
  const ageDistribution = data?.ageDistribution || [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Category Distribution</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={categoryDistribution}
              cx="50%"
              cy="50%"
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {categoryDistribution.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatNumber(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
        <h3 className="mb-4 text-base font-semibold text-gray-900">State-wise Distribution</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stateDistribution} layout="vertical" margin={{ left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" width={55} />
            <Tooltip content={renderTooltip([{ name: "Students", value: 0, payload: { name: "" } }])} />
            <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} name="Students" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-3">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Age Distribution</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={ageDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip content={renderTooltip([{ name: "Students", value: 0, payload: { label: "" } }])} />
            <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Students" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PerformanceTab({ data, loading }: { data: any; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  const topStudents = data?.topStudents || [];
  const lowPerformers = data?.lowPerformers || [];
  const departmentCGPA = data?.departmentCGPA || [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Top 10 Students</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 font-medium text-gray-500">#</th>
                <th className="pb-3 font-medium text-gray-500">Name</th>
                <th className="pb-3 font-medium text-gray-500">Roll No</th>
                <th className="pb-3 font-medium text-gray-500">Dept</th>
                <th className="pb-3 font-medium text-gray-500">CGPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topStudents.map((student: any, index: number) => (
                <tr key={student.rollNo || index} className="hover:bg-gray-50">
                  <td className="py-2.5 text-gray-500">{index + 1}</td>
                  <td className="py-2.5 font-medium text-gray-900">{student.name}</td>
                  <td className="py-2.5 text-gray-600">{student.rollNo}</td>
                  <td className="py-2.5 text-gray-600">{student.department}</td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {student.cgpa}
                    </span>
                  </td>
                </tr>
              ))}
              {topStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Low Performers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 font-medium text-gray-500">#</th>
                <th className="pb-3 font-medium text-gray-500">Name</th>
                <th className="pb-3 font-medium text-gray-500">Roll No</th>
                <th className="pb-3 font-medium text-gray-500">Dept</th>
                <th className="pb-3 font-medium text-gray-500">CGPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lowPerformers.map((student: any, index: number) => (
                <tr key={student.rollNo || index} className="hover:bg-gray-50">
                  <td className="py-2.5 text-gray-500">{index + 1}</td>
                  <td className="py-2.5 font-medium text-gray-900">{student.name}</td>
                  <td className="py-2.5 text-gray-600">{student.rollNo}</td>
                  <td className="py-2.5 text-gray-600">{student.department}</td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                      {student.cgpa}
                    </span>
                  </td>
                </tr>
              ))}
              {lowPerformers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Department-wise CGPA Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={departmentCGPA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[0, 10]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgCGPA" fill="#6366f1" name="Avg CGPA" radius={[6, 6, 0, 0]} />
            <Bar dataKey="medianCGPA" fill="#a78bfa" name="Median CGPA" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AttendanceTab({ data, loading, renderTooltip }: { data: any; loading: boolean; renderTooltip: (payload: any[]) => React.ReactNode }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  const monthlyTrend = data?.monthlyTrend || [];
  const lowAttendanceStudents = data?.lowAttendanceStudents || [];

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Monthly Attendance Trend</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="attendance"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 4, fill: "#6366f1" }}
              name="Attendance %"
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Target %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Low Attendance Students</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 font-medium text-gray-500">#</th>
                <th className="pb-3 font-medium text-gray-500">Name</th>
                <th className="pb-3 font-medium text-gray-500">Roll No</th>
                <th className="pb-3 font-medium text-gray-500">Department</th>
                <th className="pb-3 font-medium text-gray-500">Attendance</th>
                <th className="pb-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lowAttendanceStudents.map((student: any, index: number) => (
                <tr key={student.rollNo || index} className="hover:bg-gray-50">
                  <td className="py-2.5 text-gray-500">{index + 1}</td>
                  <td className="py-2.5 font-medium text-gray-900">{student.name}</td>
                  <td className="py-2.5 text-gray-600">{student.rollNo}</td>
                  <td className="py-2.5 text-gray-600">{student.department}</td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                      {student.attendance}%
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                      student.status === "Critical"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    )}>
                      {student.status || "Warning"}
                    </span>
                  </td>
                </tr>
              ))}
              {lowAttendanceStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">No low attendance students</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FeesTab({ data, loading, renderTooltip }: { data: any; loading: boolean; renderTooltip: (payload: any[]) => React.ReactNode }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  const collectionByDept = data?.collectionByDept || [];
  const defaulterStudents = data?.defaulterStudents || [];

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Fee Collection by Department</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={collectionByDept}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="collected" fill="#10b981" name="Collected" radius={[6, 6, 0, 0]} />
            <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[6, 6, 0, 0]} />
            <Bar dataKey="overdue" fill="#ef4444" name="Overdue" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Fee Defaulters List</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 font-medium text-gray-500">#</th>
                <th className="pb-3 font-medium text-gray-500">Name</th>
                <th className="pb-3 font-medium text-gray-500">Roll No</th>
                <th className="pb-3 font-medium text-gray-500">Department</th>
                <th className="pb-3 font-medium text-gray-500">Pending Amount</th>
                <th className="pb-3 font-medium text-gray-500">Due Since</th>
                <th className="pb-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {defaulterStudents.map((student: any, index: number) => (
                <tr key={student.rollNo || index} className="hover:bg-gray-50">
                  <td className="py-2.5 text-gray-500">{index + 1}</td>
                  <td className="py-2.5 font-medium text-gray-900">{student.name}</td>
                  <td className="py-2.5 text-gray-600">{student.rollNo}</td>
                  <td className="py-2.5 text-gray-600">{student.department}</td>
                  <td className="py-2.5 font-semibold text-red-600">{formatCurrency(student.pendingAmount || 0)}</td>
                  <td className="py-2.5 text-gray-600">{student.dueSince || "N/A"}</td>
                  <td className="py-2.5">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                      (student.overdueDays || 0) > 90
                        ? "bg-red-100 text-red-700"
                        : (student.overdueDays || 0) > 30
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-700"
                    )}>
                      {(student.overdueDays || 0) > 90 ? "Critical" : (student.overdueDays || 0) > 30 ? "Overdue" : "Recent"}
                    </span>
                  </td>
                </tr>
              ))}
              {defaulterStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">No fee defaulters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

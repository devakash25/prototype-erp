import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Download, RefreshCw } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn, formatCurrency, formatNumber, exportToCSV } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { StatsSkeleton } from '@/components/LoadingSkeleton'

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export function FinancialDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'expenses' | 'collections'>('overview')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const { data: overview, loading: overviewLoading, refetch: refetchOverview } = useApi('/analytics/finance/overview', [fromDate, toDate])
  const { data: revenue, loading: revenueLoading, refetch: refetchRevenue } = useApi('/analytics/finance/revenue', [fromDate, toDate])
  const { data: expenses, loading: expensesLoading, refetch: refetchExpenses } = useApi('/analytics/finance/expenses', [fromDate, toDate])
  const { data: collections, loading: collectionsLoading, refetch: refetchCollections } = useApi('/analytics/finance/collections', [fromDate, toDate])

  const o = overview || {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    collectionRate: 0,
    outstanding: 0,
    refunds: 0,
    monthlyData: [],
    revenueByType: [],
    profitTrend: [],
  }

  const r = revenue || { deptCollection: [], feeTypeBreakdown: [], monthlyTrend: [] }
  const e = expenses || { categories: [], monthlyTrend: [] }
  const c = collections || { dailySummary: [], byPaymentMode: [], outstandingByAge: [] }

  const isLoading = overviewLoading || revenueLoading || expensesLoading || collectionsLoading

  const handleRefresh = () => {
    refetchOverview()
    refetchRevenue()
    refetchExpenses()
    refetchCollections()
  }

  const handleExport = () => {
    const dataToExport: Record<string, any>[] = activeTab === 'overview'
      ? (o.monthlyData || [])
      : activeTab === 'revenue'
        ? (r.deptCollection || [])
        : activeTab === 'expenses'
          ? (e.categories || [])
          : (c.dailySummary || [])
    if (dataToExport.length > 0) {
      exportToCSV(dataToExport, `financial-${activeTab}-${new Date().toISOString().slice(0, 10)}`)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1></div>
        <StatsSkeleton count={6} />
      </div>
    )
  }

  const tabs = ['overview', 'revenue', 'expenses', 'collections'] as const

  const statsCards = [
    { label: 'Total Revenue', value: formatCurrency(o.totalRevenue), icon: DollarSign, color: 'green', bg: 'bg-green-100', iconColor: 'text-green-600' },
    { label: 'Total Expenses', value: formatCurrency(o.totalExpenses), icon: TrendingDown, color: 'red', bg: 'bg-red-100', iconColor: 'text-red-600' },
    { label: 'Net Profit', value: formatCurrency(o.netProfit), icon: o.netProfit >= 0 ? TrendingUp : TrendingDown, color: o.netProfit >= 0 ? 'green' : 'red', bg: o.netProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100', iconColor: o.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600' },
    { label: 'Collection Rate', value: `${o.collectionRate}%`, icon: DollarSign, color: 'blue', bg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Outstanding', value: formatCurrency(o.outstanding), icon: TrendingDown, color: 'amber', bg: 'bg-amber-100', iconColor: 'text-amber-600' },
    { label: 'Refunds', value: formatCurrency(o.refunds), icon: TrendingDown, color: 'purple', bg: 'bg-purple-100', iconColor: 'text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-sm text-gray-500">Complete financial overview — revenue, expenses, collections</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter fromDate={fromDate} toDate={toDate} onFromDateChange={setFromDate} onToDateChange={setToDate} onClear={() => { setFromDate(''); setToDate('') }} />
          <button onClick={handleRefresh} className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', card.bg)}>
                <card.icon className={cn('w-5 h-5', card.iconColor)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Revenue vs Expenses (Monthly)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={o.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#6366f1" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Revenue Breakdown by Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={o.revenueByType || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    dataKey="value"
                    nameKey="name"
                  >
                    {(o.revenueByType || []).map((_: any, i: number) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Net Profit Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={o.profitTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Net Profit" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Fee Collection by Department</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={r.deptCollection || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                  <YAxis type="category" dataKey="dept" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="collected" fill="#10b981" name="Collected" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Revenue by Fee Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={r.feeTypeBreakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    dataKey="value"
                    nameKey="type"
                  >
                    {(r.feeTypeBreakdown || []).map((_: any, i: number) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={r.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} name="Revenue" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} name="Collected" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Expense Categories Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={e.categories || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    dataKey="value"
                    nameKey="category"
                  >
                    {(e.categories || []).map((_: any, i: number) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Expense Category Details</h3>
              <div className="space-y-3">
                {(e.categories || []).map((cat: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-sm text-gray-700 flex-1">{cat.category}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Monthly Expense Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={e.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="salary" fill="#6366f1" name="Salary" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="maintenance" fill="#f59e0b" name="Maintenance" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="utilities" fill="#ef4444" name="Utilities" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="other" fill="#8b5cf6" name="Other" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Daily Collection Summary</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={c.dailySummary || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="collected" fill="#10b981" name="Collected" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#e5e7eb" name="Target" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Collection by Payment Mode</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={c.byPaymentMode || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    dataKey="value"
                    nameKey="mode"
                  >
                    {(c.byPaymentMode || []).map((_: any, i: number) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Outstanding Fees by Age</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(c.outstandingByAge || []).map((bucket: any, i: number) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{bucket.range}</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(bucket.amount)}</p>
                  <p className="text-xs text-gray-400 mt-1">{bucket.count} students</p>
                  <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', i === 0 ? 'bg-green-500' : i === 1 ? 'bg-yellow-500' : i === 2 ? 'bg-orange-500' : 'bg-red-500')}
                      style={{ width: `${bucket.percentage || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FinancialDashboard

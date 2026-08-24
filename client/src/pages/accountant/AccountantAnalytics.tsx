import { useState, useEffect } from 'react'
import { IndianRupee, TrendingUp, Target, Users, RefreshCw } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import api from '@/services/api'
import { cn, formatCurrency } from '@/lib/utils'

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export function AccountantAnalytics() {
  const [revenueData, setRevenueData] = useState(null)
  const [collectionData, setCollectionData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [revenueRes, collectionRes] = await Promise.allSettled([
        api.get('/accountant/revenue-analytics'),
        api.get('/accountant/collection-performance'),
      ])
      if (revenueRes.status === 'fulfilled') setRevenueData(revenueRes.value.data.data)
      if (collectionRes.status === 'fulfilled') setCollectionData(collectionRes.value.data.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  const revenueTrend = revenueData?.dailyTrend || []
  const paymentModes = revenueData?.paymentModeDistribution || []
  const revenueByFeeType = revenueData?.revenueByFeeType || []
  const metrics = collectionData || {}

  const metricCards = [
    { title: 'Total Collected', value: formatCurrency(metrics.monthlyCollected || 0), icon: IndianRupee, color: 'bg-green-500' },
    { title: 'Collection Rate', value: `${metrics.collectionRate || 0}%`, icon: TrendingUp, color: 'bg-blue-500' },
    { title: 'Avg per Student', value: formatCurrency(metrics.avgCollectionPerStudent || 0), icon: Users, color: 'bg-purple-500' },
    { title: 'Total Due', value: formatCurrency(metrics.totalDue || 0), icon: Target, color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accountant Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Revenue trends and collection performance</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div key={card.title} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', card.color)}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend (Last 30 Days)</h2>
        {revenueTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 100000).toFixed(1)}L`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} dot={false} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400">No revenue trend data available</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-xl">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Mode Distribution</h2>
          {paymentModes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentModes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="amount"
                  nameKey="name"
                >
                  {paymentModes.map((_: unknown, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [value, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">No payment mode data available</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-xl">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue by Fee Type</h2>
          {revenueByFeeType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByFeeType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 100000).toFixed(1)}L`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {revenueByFeeType.map((_: unknown, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">No fee type revenue data available</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccountantAnalytics

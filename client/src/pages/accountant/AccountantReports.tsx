import { useState, useEffect } from 'react'
import { Calendar, FileText, RefreshCw, Filter, Wallet } from 'lucide-react'
import { format } from 'date-fns'
import { cn, formatCurrency } from '@/lib/utils'
import api from '@/services/api'

export function AccountantReports() {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily')

  const [reportDate, setReportDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [dailyData, setDailyData] = useState<any>(null)
  const [loadingDaily, setLoadingDaily] = useState(true)

  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1)
  const [reportYear, setReportYear] = useState(new Date().getFullYear())
  const [monthlyData, setMonthlyData] = useState<any>(null)
  const [loadingMonthly, setLoadingMonthly] = useState(true)

  const fetchDaily = async () => {
    setLoadingDaily(true)
    try {
      const res = await api.get('/accountant/daily-report', { params: { date: reportDate } })
      setDailyData(res.data.data)
    } catch (err) {
      console.error(err)
    }
    setLoadingDaily(false)
  }

  const fetchMonthly = async () => {
    setLoadingMonthly(true)
    try {
      const res = await api.get('/accountant/monthly-report', { params: { month: reportMonth, year: reportYear } })
      setMonthlyData(res.data.data)
    } catch (err) {
      console.error(err)
    }
    setLoadingMonthly(false)
  }

  useEffect(() => { fetchDaily() }, [reportDate])
  useEffect(() => { fetchMonthly() }, [reportMonth, reportYear])

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const tabs = [
    { key: 'daily' as const, label: 'Daily Report', icon: Calendar },
    { key: 'monthly' as const, label: 'Monthly Report', icon: FileText },
  ]

  const dailyMethodArray = dailyData?.byMethod ? Object.entries(dailyData.byMethod).map(([method, data]: [string, any]) => ({ method, total: data.total, count: data.count })) : []
  const onlineCount = dailyMethodArray.find((m: any) => m.method === 'ONLINE')?.count || 0
  const cashCount = dailyMethodArray.find((m: any) => m.method === 'CASH')?.count || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Daily and monthly financial reports</p>
        </div>
        <button
          onClick={activeTab === 'daily' ? fetchDaily : fetchMonthly}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="flex gap-2 bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center',
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Date</label>
              </div>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => setReportDate(format(new Date(), 'yyyy-MM-dd'))}
                className="px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
              >
                Today
              </button>
            </div>
          </div>

          {loadingDaily ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : !dailyData ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No data available for this date</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
                  <p className="text-sm text-green-100">Total Collections</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(dailyData?.totalCollected || 0)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{dailyData?.totalTransactions || 0}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Online Payments</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{onlineCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cash Payments</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{cashCount}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transactions</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time</th>
                          <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Student</th>
                          <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fee Type</th>
                          <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                          <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Method</th>
                          <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Receipt #</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {(dailyData?.transactions || []).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No transactions recorded</td>
                          </tr>
                        ) : (
                          (dailyData?.transactions || []).map((tx: any) => (
                            <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                                {tx.paidAt ? new Date(tx.paidAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                              </td>
                              <td className="px-5 py-3">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">{tx.student?.fullName || '-'}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{tx.student?.admissionNumber || ''}</p>
                                </div>
                              </td>
                              <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{tx.feeStructure?.name || '-'}</td>
                              <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-gray-100">{formatCurrency(tx.paidAmount || 0)}</td>
                              <td className="px-5 py-3">
                                <span className={cn(
                                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                  tx.paymentMethod === 'ONLINE' || tx.paymentMethod === 'UPI' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                  tx.paymentMethod === 'CASH' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                  'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                )}>
                                  {tx.paymentMethod || '-'}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{tx.receiptNumber || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payment Methods</h2>
                  </div>
                  <div className="space-y-4">
                    {dailyMethodArray.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No data</p>
                    ) : (
                      dailyMethodArray.map((pm: any) => (
                        <div key={pm.method} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 capitalize">{pm.method}</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(pm.total)}</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                pm.method === 'ONLINE' || pm.method === 'UPI' ? 'bg-blue-500' :
                                pm.method === 'CASH' ? 'bg-green-500' :
                                'bg-purple-500'
                              )}
                              style={{ width: `${dailyData.totalCollected > 0 ? (pm.total / dailyData.totalCollected) * 100 : 0}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{pm.count} transaction{pm.count !== 1 ? 's' : ''}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Month</label>
              </div>
              <select
                value={reportMonth}
                onChange={(e) => setReportMonth(Number(e.target.value))}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {months.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                value={reportYear}
                onChange={(e) => setReportYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {loadingMonthly ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : !monthlyData ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No data available for this period</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
                  <p className="text-sm text-green-100">Total Revenue</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(monthlyData?.totalRevenue || 0)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{monthlyData?.totalTransactions || 0}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average per Day</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(monthlyData?.totalTransactions > 0 ? (monthlyData?.totalRevenue || 0) / 30 : 0)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Dues</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{formatCurrency(monthlyData?.pendingDues || 0)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Revenue by Fee Type</h2>
                  </div>
                  <div className="p-5">
                    <div className="space-y-4">
                      {(monthlyData?.byFeeType || []).length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No data</p>
                      ) : (
                        (monthlyData?.byFeeType || []).map((item: any) => (
                          <div key={item.name} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.amount)}</span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-indigo-500 transition-all"
                                style={{ width: `${monthlyData.totalRevenue > 0 ? (item.amount / monthlyData.totalRevenue) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Revenue by Department</h2>
                  </div>
                  <div className="p-5">
                    <div className="space-y-4">
                      {(monthlyData?.byDepartment || []).length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No data</p>
                      ) : (
                        (monthlyData?.byDepartment || []).map((item: any) => (
                          <div key={item.name} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.amount)}</span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{ width: `${monthlyData.totalRevenue > 0 ? (item.amount / monthlyData.totalRevenue) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payment Method Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Method</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Transactions</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                      {(monthlyData?.byMethod || []).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No data</td>
                        </tr>
                      ) : (
                        (monthlyData?.byMethod || []).map((pm: any) => (
                          <tr key={pm.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  'w-8 h-8 rounded-lg flex items-center justify-center',
                                  pm.name === 'ONLINE' || pm.name === 'UPI' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                  pm.name === 'CASH' ? 'bg-green-100 dark:bg-green-900/30' :
                                  'bg-purple-100 dark:bg-purple-900/30'
                                )}>
                                  <Wallet className={cn(
                                    'w-4 h-4',
                                    pm.name === 'ONLINE' || pm.name === 'UPI' ? 'text-blue-600 dark:text-blue-400' :
                                    pm.name === 'CASH' ? 'text-green-600 dark:text-green-400' :
                                    'text-purple-600 dark:text-purple-400'
                                  )} />
                                </div>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{pm.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right text-gray-700 dark:text-gray-300">-</td>
                            <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-gray-100">{formatCurrency(pm.amount)}</td>
                            <td className="px-5 py-3 text-right text-gray-700 dark:text-gray-300">
                              {monthlyData.totalRevenue > 0 ? ((pm.amount / monthlyData.totalRevenue) * 100).toFixed(1) : 0}%
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AccountantReports

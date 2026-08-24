import { useState } from 'react'
import { FileText, Download, Filter, Search, ChevronRight, Calendar, Users, GraduationCap, DollarSign, RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { reportsApi } from '@/services/apiService'
import { DateRangeFilter } from '@/components/DateRangeFilter'

const reportCategories = [
  {
    name: 'Student Reports',
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
    reports: [
      'Student List (All)', 'Student List (By Department)', 'Student List (By Course)',
      'Student Attendance Report', 'Student Attendance (Date Range)', 'Low Attendance Students',
      'Student Performance Report', 'Student Fee Status', 'Student Fee Defaulters',
      'Student ID Card List', 'Student Contact Directory', 'Student Parent Mapping',
      'New Admissions Report', 'Withdrawn Students', 'Graduated Students',
      'Student Gender Distribution', 'Student Category Distribution', 'Student Hostel Mapping',
      'Student Transport Mapping', 'Student Scholarship Report',
    ],
  },
  {
    name: 'Academic Reports',
    icon: GraduationCap,
    color: 'bg-purple-100 text-purple-600',
    reports: [
      'Exam Results Summary', 'Subject-wise Performance', 'Department Rankings',
      'Pass/Fail Analysis', 'Grade Distribution', 'Top Performers List',
      'Low Performers List', 'Semester Comparison', 'CGPA Distribution',
      'Assignment Completion Report', 'Timetable Overview', 'Faculty Workload Report',
      'Class-wise Performance', 'Course Completion Rate', 'Academic Calendar Report',
    ],
  },
  {
    name: 'Financial Reports',
    icon: DollarSign,
    color: 'bg-green-100 text-green-600',
    reports: [
      'Daily Collection Report', 'Monthly Collection Report', 'Yearly Revenue Report',
      'Fee Collection Summary', 'Fee Defaulters List', 'Fee Structure Overview',
      'Payment Mode Analysis', 'Revenue by Department', 'Revenue by Course',
      'Scholarship Disbursement Report', 'Refund Report', 'Outstanding Fees Report',
      'Hostel Fee Collection', 'Transport Fee Collection', 'Exam Fee Collection',
      'Expense Report', 'Profit & Loss Statement', 'Budget vs Actual',
      'Tax Report', 'Income vs Expense Trend',
    ],
  },
  {
    name: 'HR Reports',
    icon: Users,
    color: 'bg-amber-100 text-amber-600',
    reports: [
      'Employee List (All)', 'Employee List (By Department)', 'Faculty Attendance Report',
      'Employee Attendance (Date Range)', 'Leave Report', 'Leave Balance Report',
      'Employee Performance Review', 'Faculty Workload Analysis', 'Hiring Trend Report',
      'Attrition Report', 'Salary Disbursement Report', 'Employee Contact Directory',
      'Department-wise Strength', 'Employee Onboarding Report', 'Contract Expiry Report',
    ],
  },
  {
    name: 'Campus Reports',
    icon: FileText,
    color: 'bg-pink-100 text-pink-600',
    reports: [
      'Hostel Occupancy Report', 'Hostel Room Allocation', 'Hostel Fee Collection',
      'Hostel Maintenance Log', 'Library Book Inventory', 'Library Issue Report',
      'Overdue Books Report', 'Library Fine Collection', 'Transport Route Occupancy',
      'Vehicle Maintenance Report', 'Fuel Expense Report', 'Building Utilization',
      'Complaint Summary', 'Helpdesk Performance Report', 'Workflow Approval Report',
    ],
  },
  {
    name: 'Audit & System Reports',
    icon: FileText,
    color: 'bg-red-100 text-red-600',
    reports: [
      'User Activity Log', 'Login History Report', 'Data Change Audit Trail',
      'Failed Login Attempts', 'System Health Report', 'API Usage Report',
      'Notification Delivery Report', 'Document Upload Report', 'Backup Status Report',
      'Role & Permission Matrix', 'Institution Health Score', 'KPI Dashboard Export',
    ],
  },
]

export function ReportCenter() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null)
  const [downloadingAll, setDownloadingAll] = useState(false)

  const filteredCategories = reportCategories.filter((cat) => {
    if (searchQuery) {
      return cat.reports.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    if (selectedCategory) {
      return cat.name === selectedCategory
    }
    return true
  })

  const totalReports = reportCategories.reduce((sum, cat) => sum + cat.reports.length, 0)

  const generateReportSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleDownloadReport = async (reportName: string, categoryName: string) => {
    setDownloadingReport(reportName)
    try {
      const slug = generateReportSlug(reportName)
      const params: any = { category: categoryName }
      if (fromDate) params.from = fromDate
      if (toDate) params.to = toDate

      const response = await reportsApi.generate(slug, params)
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${reportName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (err: any) {
      alert(err.response?.data?.error?.message || `Failed to generate report: ${reportName}`)
    }
    setDownloadingReport(null)
  }

  const handleExportAll = async () => {
    setDownloadingAll(true)
    try {
      const allReports: { name: string; category: string }[] = []
      filteredCategories.forEach(cat => {
        cat.reports.forEach(report => {
          allReports.push({ name: report, category: cat.name })
        })
      })

      const params: any = { reports: allReports.map(r => generateReportSlug(r.name)) }
      if (fromDate) params.from = fromDate
      if (toDate) params.to = toDate

      const response = await reportsApi.generate('bulk-export', params)
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/zip' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'all_reports.zip'
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to export reports')
    }
    setDownloadingAll(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Center</h1>
          <p className="text-sm text-gray-500">{totalReports}+ reports across all modules</p>
        </div>
        <button
          onClick={handleExportAll}
          disabled={downloadingAll}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {downloadingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloadingAll ? 'Exporting...' : 'Export All'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Categories</option>
            {reportCategories.map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <DateRangeFilter
            fromDate={fromDate}
            toDate={toDate}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onClear={() => { setFromDate(''); setToDate('') }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => {
          const Icon = category.icon
          return (
            <div key={category.name} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn('p-2 rounded-lg', category.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-xs text-gray-500">{category.reports.length} reports</p>
                </div>
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {category.reports
                  .filter((r) => !searchQuery || r.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((report) => (
                    <div
                      key={report}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
                    >
                      <span className="text-sm text-gray-700">{report}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownloadReport(report, category.name) }}
                          disabled={downloadingReport === report}
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                          title="Download"
                        >
                          {downloadingReport === report ? (
                            <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-gray-500" />
                          )}
                        </button>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

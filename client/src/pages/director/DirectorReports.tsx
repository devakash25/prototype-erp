import { useState } from 'react'
import { RefreshCw, FileText, Download, BarChart3, Users, GraduationCap, DollarSign, School } from 'lucide-react'
import { cn } from '@/lib/utils'

const reportCategories = [
  {
    title: 'Academic Reports',
    icon: GraduationCap,
    color: 'blue',
    reports: [
      { name: 'Student Performance by Department', description: 'Department-wise student marks and grades analysis' },
      { name: 'Attendance Summary Report', description: 'Monthly attendance trends for all departments' },
      { name: 'Faculty Workload Report', description: 'Classes, subjects and workload per faculty member' },
      { name: 'Examination Results Analysis', description: 'Pass rates, averages, and subject-wise performance' },
      { name: 'Student Enrollment Report', description: 'Admission trends and enrollment statistics' },
      { name: 'Department Performance Scorecard', description: 'Comparative department metrics and rankings' },
    ],
  },
  {
    title: 'Finance Reports',
    icon: DollarSign,
    color: 'green',
    reports: [
      { name: 'Fee Collection Summary', description: 'Total collected vs outstanding fees' },
      { name: 'Department-wise Revenue', description: 'Revenue breakdown by department/course' },
      { name: 'Outstanding Dues Report', description: 'Students with pending fee payments' },
      { name: 'Monthly Revenue Trend', description: '12-month revenue collection analysis' },
    ],
  },
  {
    title: 'HR Reports',
    icon: Users,
    color: 'purple',
    reports: [
      { name: 'Staff Strength Report', description: 'Teaching and non-teaching staff count' },
      { name: 'Leave Utilization Report', description: 'Leave types, duration and pending requests' },
      { name: 'Faculty Performance Report', description: 'Teaching quality and performance scores' },
      { name: 'Recruitment Pipeline', description: 'Open positions and application status' },
    ],
  },
  {
    title: 'Campus Reports',
    icon: School,
    color: 'amber',
    reports: [
      { name: 'Hostel Occupancy Report', description: 'Room-wise occupancy and availability' },
      { name: 'Transport Utilization', description: 'Route-wise student ridership analysis' },
      { name: 'Library Usage Report', description: 'Book issues, returns and popular titles' },
      { name: 'Helpdesk Ticket Report', description: 'Ticket volume, resolution time and categories' },
    ],
  },
]

export function DirectorReports() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-100' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', iconBg: 'bg-green-100' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-100' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconBg: 'bg-amber-100' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Generate and view institutional reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCategories.map((cat) => {
          const colors = colorMap[cat.color]
          const isExpanded = expandedCategory === cat.title
          return (
            <div key={cat.title} className={cn('bg-white rounded-xl border p-6 hover:shadow-md transition-shadow', colors.border)}>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors.iconBg)}>
                  <cat.icon className={cn('w-5 h-5', colors.text)} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{cat.title}</h2>
                  <p className="text-xs text-gray-500">{cat.reports.length} reports</p>
                </div>
              </div>

              <div className="space-y-2">
                {cat.reports.map((report, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer group">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{report.name}</p>
                      <p className="text-xs text-gray-500">{report.description}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-white">
                      <Download className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Director reports are focused on academic and operational analytics. Platform-level configuration reports and system audit logs are accessible to the Chief Head.
        </p>
      </div>
    </div>
  )
}

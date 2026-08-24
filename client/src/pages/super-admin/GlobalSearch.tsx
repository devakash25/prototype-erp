import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Users, GraduationCap, DollarSign, Bell, FileText, X, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/services/api'

const tabs = [
  { id: 'all', label: 'All', icon: Search },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'faculty', label: 'Faculty', icon: Users },
  { id: 'fees', label: 'Fees', icon: DollarSign },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const

type TabId = typeof tabs[number]['id']

const categoryConfig: Record<string, { icon: typeof Users; color: string }> = {
  student: { icon: GraduationCap, color: 'bg-blue-100 text-blue-600' },
  faculty: { icon: Users, color: 'bg-green-100 text-green-600' },
  fee: { icon: DollarSign, color: 'bg-orange-100 text-orange-600' },
  notification: { icon: Bell, color: 'bg-purple-100 text-purple-600' },
  announcement: { icon: FileText, color: 'bg-indigo-100 text-indigo-600' },
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export function GlobalSearch() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<TabId>('all')
  const [results, setResults] = useState<Record<string, any[]>>({
    students: [],
    faculty: [],
    fees: [],
    notifications: [],
    announcements: [],
  })
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const debouncedQuery = useDebounce(query, 300)

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults({ students: [], faculty: [], fees: [], notifications: [], announcements: [] })
      setSearched(false)
      return
    }

    setLoading(true)
    setSearched(true)
    try {
      const [studentsRes, facultyRes, feesRes, notificationsRes, announcementsRes] = await Promise.allSettled([
        api.get(`/search/students?q=${encodeURIComponent(q)}`),
        api.get(`/search/faculty?q=${encodeURIComponent(q)}`),
        api.get(`/search/fees?q=${encodeURIComponent(q)}`),
        api.get(`/search/notifications?q=${encodeURIComponent(q)}`),
        api.get(`/search/announcements?q=${encodeURIComponent(q)}`),
      ])

      setResults({
        students: studentsRes.status === 'fulfilled' ? (studentsRes.value.data?.items || []) : [],
        faculty: facultyRes.status === 'fulfilled' ? (facultyRes.value.data?.items || []) : [],
        fees: feesRes.status === 'fulfilled' ? (feesRes.value.data?.items || []) : [],
        notifications: notificationsRes.status === 'fulfilled' ? (notificationsRes.value.data?.items || []) : [],
        announcements: announcementsRes.status === 'fulfilled' ? (announcementsRes.value.data?.items || []) : [],
      })
    } catch {
      setResults({ students: [], faculty: [], fees: [], notifications: [], announcements: [] })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchResults(debouncedQuery)
  }, [debouncedQuery, fetchResults])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const allResults = [
    ...results.students.map((r) => ({ ...r, _category: 'student' })),
    ...results.faculty.map((r) => ({ ...r, _category: 'faculty' })),
    ...results.fees.map((r) => ({ ...r, _category: 'fee' })),
    ...results.notifications.map((r) => ({ ...r, _category: 'notification' })),
    ...results.announcements.map((r) => ({ ...r, _category: 'announcement' })),
  ]

  const filteredResults = activeTab === 'all'
    ? allResults
    : allResults.filter((r) => {
        const map: Record<string, string> = { students: 'student', faculty: 'faculty', fees: 'fee', notifications: 'notification' }
        return r._category === map[activeTab]
      })

  const totalResults = allResults.length

  const clearSearch = () => {
    setQuery('')
    setActiveTab('all')
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Global Search</h1>
        <p className="text-sm text-gray-500">Search across the entire institution</p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students, faculty, fees, notifications..."
          className="w-full pl-12 pr-12 py-4 text-lg border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const count = tab.id === 'all'
            ? totalResults
            : tab.id === 'students'
              ? results.students.length
              : tab.id === 'faculty'
                ? results.faculty.length
                : tab.id === 'fees'
                  ? results.fees.length
                  : results.notifications.length + results.announcements.length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {searched && count > 0 && (
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-xs',
                  activeTab === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            <span className="ml-3 text-sm text-gray-500">Searching...</span>
          </div>
        ) : !searched ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm font-medium text-gray-500">Start typing to search</p>
            <p className="text-xs text-gray-400 mt-1">Search students, faculty, fees, and more</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm font-medium text-gray-500">No results found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredResults.map((item) => {
              const cat = categoryConfig[item._category] || categoryConfig.student
              const Icon = cat.icon
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className={cn('p-2 rounded-lg', cat.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 capitalize">
                    {item.type || item._category}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default GlobalSearch

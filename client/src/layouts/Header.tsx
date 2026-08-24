import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useApi } from '@/hooks/useApi'
import {
  Menu, Bell, Search, Sun, Moon, ChevronDown, LogOut, User, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuToggle: () => void
}

function getHeaderGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Morning'
  if (hour >= 12 && hour < 17) return 'Afternoon'
  if (hour >= 17 && hour < 20) return 'Evening'
  return 'Night'
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const { darkMode, toggleDarkMode } = useSettingsStore()
  const [showProfile, setShowProfile] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const { data: notifCount } = useApi('/notifications/unread-count')
  const greeting = useMemo(() => getHeaderGreeting(), [])

  const unreadCount = notifCount?.count || 0

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 relative">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <button onClick={onMenuToggle} className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students, teachers, receipts..."
                className="w-96 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onFocus={() => setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              />
              {showSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
                  <p className="text-xs text-gray-500 mb-3">Quick Search</p>
                  <div className="space-y-2">
                    <Link to="/search" onClick={() => setShowSearch(false)} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><User className="w-4 h-4 text-blue-600" /></div>
                      <div><p className="text-sm font-medium">Students</p><p className="text-xs text-gray-500">Search by name, ID, email</p></div>
                    </Link>
                    <Link to="/search" onClick={() => setShowSearch(false)} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><User className="w-4 h-4 text-green-600" /></div>
                      <div><p className="text-sm font-medium">Teachers</p><p className="text-xs text-gray-500">Search by name, department</p></div>
                    </Link>
                    <Link to="/search" onClick={() => setShowSearch(false)} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center"><Settings className="w-4 h-4 text-purple-600" /></div>
                      <div><p className="text-sm font-medium">Receipts</p><p className="text-xs text-gray-500">Search by receipt number</p></div>
                    </Link>
                  </div>
                  <Link to="/search" onClick={() => setShowSearch(false)} className="block mt-3 text-center text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    Advanced Search →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
            <span className="text-xs text-indigo-600 font-medium">Good {greeting},</span>
            <span className="text-sm font-semibold text-indigo-700">{user?.firstName || 'User'}</span>
          </div>

          <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100">
            {darkMode ? <Sun className="w-5 h-5 text-gray-600" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>

          <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-medium text-sm">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.role?.replace(/_/g, ' ')}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 hidden lg:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowProfile(false)}>
                  <User className="w-4 h-4" />My Profile
                </Link>
                <Link to="/system-settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowProfile(false)}>
                  <Settings className="w-4 h-4" />Settings
                </Link>
                <hr className="my-1" />
                <button onClick={() => { logout(); setShowProfile(false) }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                  <LogOut className="w-4 h-4" />Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

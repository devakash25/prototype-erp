import { ReactNode, useCallback, useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAuthStore } from '@/store/authStore'
import { LoginSplash } from '@/components/LoginSplash'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { justLoggedIn, clearJustLoggedIn } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(justLoggedIn)

  useEffect(() => {
    if (justLoggedIn) {
      setSidebarOpen(true)
    }
  }, [justLoggedIn])

  const handleSplashComplete = useCallback(() => {
    clearJustLoggedIn()
    setTimeout(() => setSidebarOpen(false), 400)
  }, [clearJustLoggedIn])

  return (
    <>
      {justLoggedIn && <LoginSplash onComplete={handleSplashComplete} />}
      <div className="flex h-screen bg-gray-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
          <main className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}

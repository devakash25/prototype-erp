import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Sun, Moon, CloudSun, Sunset } from 'lucide-react'

function getTimeGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return { text: 'Good Morning', emoji: '☀️', icon: Sun, gradient: 'from-amber-500 via-orange-500 to-red-500' }
  if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', emoji: '🌤️', icon: CloudSun, gradient: 'from-blue-500 via-cyan-500 to-teal-500' }
  if (hour >= 17 && hour < 20) return { text: 'Good Evening', emoji: '🌅', icon: Sunset, gradient: 'from-purple-500 via-pink-500 to-rose-500' }
  return { text: 'Good Night', emoji: '🌙', icon: Moon, gradient: 'from-indigo-600 via-purple-600 to-blue-600' }
}

interface LoginSplashProps {
  onComplete: () => void
}

export function LoginSplash({ onComplete }: LoginSplashProps) {
  const { user } = useAuthStore()
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter')
  const greeting = getTimeGreeting()
  const Icon = greeting.icon
  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || ''

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 50)
    const t2 = setTimeout(() => setPhase('exit'), 2200)
    const t3 = setTimeout(() => onComplete(), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br ${greeting.gradient} transition-opacity duration-700 ${
        phase === 'exit' ? 'opacity-0 pointer-events-none' : phase === 'visible' ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className={`relative z-10 text-center text-white transition-all duration-700 ${
        phase === 'visible' ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-8 opacity-0'
      }`}>
        <div className="mb-6 relative">
          <span className="text-7xl block mb-4">{greeting.emoji}</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-16 w-16 text-white/20 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
          {greeting.text}
        </h1>
        <p className="text-2xl md:text-3xl font-light text-white/90 mb-2">
          {firstName}
        </p>
        <div className="flex items-center justify-center gap-2 text-white/60 text-sm mt-6">
          <div className="w-8 h-0.5 bg-white/40 rounded" />
          <span>DEV ERP</span>
          <div className="w-8 h-0.5 bg-white/40 rounded" />
        </div>
      </div>
    </div>
  )
}

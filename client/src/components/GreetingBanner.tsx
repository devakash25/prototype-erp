import { useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Sun, Moon, CloudSun, Sunset } from 'lucide-react'

const QUOTES = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Don't watch the clock; do what it does. Keep going.",
  "Believe you can and you're halfway there.",
  "Hard work beats talent when talent doesn't work hard.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Everything you've ever wanted is on the other side of fear.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It's going to be hard, but hard does not mean impossible.",
  "Don't wait for opportunity. Create it.",
  "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
  "The key to success is to focus on goals, not obstacles.",
  "Dream bigger. Do bigger.",
  "Don't be afraid to give up the good to go for the great.",
  "Act as if what you do makes a difference. It does.",
  "Success is not how high you have climbed, but how you make a positive difference to the world.",
  "What you get by achieving your goals is not as important as what you become by achieving your goals.",
  "The best revenge is massive success.",
  "I find that the harder I work, the more luck I seem to have.",
]

function getTimeGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return { text: 'Good Morning', emoji: '☀️', icon: Sun, gradient: 'from-amber-500 via-orange-500 to-red-500' }
  if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', emoji: '🌤️', icon: CloudSun, gradient: 'from-blue-500 via-cyan-500 to-teal-500' }
  if (hour >= 17 && hour < 20) return { text: 'Good Evening', emoji: '🌅', icon: Sunset, gradient: 'from-purple-500 via-pink-500 to-rose-500' }
  return { text: 'Good Night', emoji: '🌙', icon: Moon, gradient: 'from-indigo-600 via-purple-600 to-blue-600' }
}

function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return QUOTES[dayOfYear % QUOTES.length]
}

export function GreetingBanner() {
  const { user } = useAuthStore()
  const greeting = useMemo(() => getTimeGreeting(), [])
  const quote = useMemo(() => getDailyQuote(), [])
  const Icon = greeting.icon

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || ''

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${greeting.gradient} p-6 md:p-8 text-white shadow-xl`}>
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{greeting.emoji}</span>
          <Icon className="h-6 w-6 text-white/80" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          {greeting.text}{firstName ? `, ${firstName}` : ''}!
        </h1>
        <p className="text-white/80 text-sm md:text-base max-w-xl">
          {quote}
        </p>
      </div>
    </div>
  )
}

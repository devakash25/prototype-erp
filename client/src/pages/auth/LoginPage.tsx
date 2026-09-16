import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Eye, EyeOff, Loader2, GraduationCap } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Login failed. Please try again.'
      setError(msg)
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 items-center justify-center p-12 relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.5s' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="text-center text-white relative z-10 animate-fade-in-up">
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/20">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 tracking-tight">DEV ERP</h1>
          <p className="text-xl text-white/80 mb-12 font-light">Enterprise Education Management</p>

          <div className="grid grid-cols-2 gap-4 text-left max-w-md mx-auto">
            {[
              { value: '20K+', label: 'Active Users' },
              { value: '28', label: 'Modules' },
              { value: '700+', label: 'APIs' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${300 + i * 100}ms` }}
              >
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-xl">DEV ERP</h1>
              <p className="text-xs text-gray-400 font-medium">Enterprise System</p>
            </div>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500 mb-8">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 flex items-center gap-2 animate-scale-in">
                <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:border-gray-300 transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-12 bg-white shadow-sm hover:border-gray-300 transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Quick login roles */}
          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Quick Login</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { role: 'Admin', email: 'admin@dev-erp.com', password: 'Admin@123', color: 'hover:bg-green-50 hover:text-green-700 hover:border-green-300' },
                { role: 'Principal', email: 'principal@dev-erp.com', password: 'Teacher@123', color: 'hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300' },
                { role: 'Vice Principal', email: 'vice.principal@dev-erp.com', password: 'Teacher@123', color: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300' },
                { role: 'Teacher', email: 'teacher1@dev-erp.com', password: 'Teacher@123', color: 'hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300' },
                { role: 'Student', email: 'student1@dev-erp.com', password: 'Student@123', color: 'hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300' },
                { role: 'Parent', email: 'father@dev-erp.com', password: 'Parent@123', color: 'hover:bg-fuchsia-50 hover:text-fuchsia-700 hover:border-fuchsia-300' },
                { role: 'Exam Ctrl', email: 'exam.controller@dev-erp.com', password: 'Teacher@123', color: 'hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300' },
                { role: 'Accountant', email: 'accountant@dev-erp.com', password: 'Teacher@123', color: 'hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300' },
                { role: 'Receptionist', email: 'receptionist@dev-erp.com', password: 'Teacher@123', color: 'hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300' },
                { role: 'Admission', email: 'admission@dev-erp.com', password: 'Teacher@123', color: 'hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300' },
                { role: 'Transport', email: 'transport@dev-erp.com', password: 'Teacher@123', color: 'hover:bg-red-50 hover:text-red-700 hover:border-red-300' },
                { role: 'Librarian', email: 'librarian@dev-erp.com', password: 'Teacher@123', color: 'hover:bg-lime-50 hover:text-lime-700 hover:border-lime-300' },
              ].map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => {
                    setEmail(r.email)
                    setPassword(r.password)
                  }}
                  className={`px-2 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 transition-all duration-200 hover:scale-105 hover:shadow-sm ${r.color}`}
                >
                  {r.role}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-400 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            No registration allowed. Contact your institution administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

import { create } from 'zustand'
import api from '@/services/api'

export type UserRole =
  | 'CEO'
  | 'CHIEF_HEAD'
  | 'DIRECTOR'
  | 'MANAGER'
  | 'VICE_MANAGER'
  | 'PRINCIPAL'
  | 'VICE_PRINCIPAL'
  | 'HOD'
  | 'TEACHER'
  | 'ACCOUNTANT'
  | 'ADMISSION_COUNSELLOR'
  | 'LIBRARIAN'
  | 'HOSTEL_WARDEN'
  | 'TRANSPORT_MANAGER'
  | 'ADMINISTRATIVE_STAFF'
  | 'STUDENT'
  | 'PARENT'

export type InstitutionType = 'SCHOOL' | 'COLLEGE'

export interface User {
  id: string
  email: string
  role: UserRole
  institutionId?: string
  institutionType?: InstitutionType
  firstName: string
  lastName: string
  fullName: string
  phone?: string
  avatar?: string
  enabledFeatures?: string[]
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  justLoggedIn: boolean
  enabledFeatures: string[]
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  fetchMe: () => Promise<void>
  fetchEnabledFeatures: () => Promise<void>
  updateProfile: (data: Partial<User>) => void
  clearJustLoggedIn: () => void
}

// All features as fallback (if no plan is active, show everything)
const ALL_FEATURES_FALLBACK = true

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  justLoggedIn: false,
  enabledFeatures: [],

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const { user, accessToken, refreshToken } = data.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      set({ user, isAuthenticated: true, isLoading: false, justLoggedIn: true })

      // Fetch enabled features after login
      if (user.role !== 'CEO') {
        get().fetchEnabledFeatures()
      }
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  fetchMe: async () => {
    if (!localStorage.getItem('accessToken')) return
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.data, isAuthenticated: true })

      // Fetch enabled features after fetching user
      if (data.data.role !== 'CEO') {
        get().fetchEnabledFeatures()
      }
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      set({ user: null, isAuthenticated: false, enabledFeatures: [] })
    }
  },

  fetchEnabledFeatures: async () => {
    try {
      // Try to get active features from the CEO endpoint
      const { data } = await api.get('/ceo/plans/active-features')
      set({ enabledFeatures: data.features || [] })
    } catch {
      // If CEO endpoint fails (user is not CEO), try auth endpoint
      try {
        const { data } = await api.get('/auth/features')
        set({ enabledFeatures: data.data?.features || data.features || [] })
      } catch {
        // If no features endpoint exists, show all features (fallback)
        set({ enabledFeatures: [] })
      }
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ user: null, isAuthenticated: false, enabledFeatures: [] })
  },

  setUser: (user) => set({ user, isAuthenticated: true }),

  updateProfile: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),

  clearJustLoggedIn: () => set({ justLoggedIn: false }),
}))

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DashboardWidget {
  id: string
  title: string
  visible: boolean
  order: number
  size: 'sm' | 'md' | 'lg'
}

interface SettingsState {
  darkMode: boolean
  sidebarCollapsed: boolean
  widgets: DashboardWidget[]
  layout: Record<string, { x: number; y: number; w: number; h: number }>
  toggleDarkMode: () => void
  toggleSidebar: () => void
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => void
  reorderWidgets: (widgets: DashboardWidget[]) => void
  updateLayout: (layout: Record<string, { x: number; y: number; w: number; h: number }>) => void
  resetWidgets: () => void
}

const defaultWidgets: DashboardWidget[] = [
  { id: 'kpi-cards', title: 'Executive Summary Cards', visible: true, order: 0, size: 'lg' },
  { id: 'quick-actions', title: 'Quick Actions', visible: true, order: 1, size: 'lg' },
  { id: 'revenue-chart', title: 'Revenue vs Expenses', visible: true, order: 2, size: 'lg' },
  { id: 'admission-funnel', title: 'Admission Pipeline', visible: true, order: 3, size: 'lg' },
  { id: 'attendance-chart', title: 'Weekly Attendance', visible: true, order: 4, size: 'md' },
  { id: 'department-dist', title: 'Department Distribution', visible: true, order: 5, size: 'md' },
  { id: 'health-score', title: 'Institution Health Score', visible: true, order: 6, size: 'md' },
  { id: 'activity-feed', title: 'Live Activity Feed', visible: true, order: 7, size: 'md' },
  { id: 'pending-actions', title: 'Pending Action Center', visible: true, order: 8, size: 'md' },
  { id: 'smart-alerts', title: 'Smart Alerts', visible: true, order: 9, size: 'md' },
]

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: true,
      sidebarCollapsed: false,
      widgets: defaultWidgets,
      layout: {},

      toggleDarkMode: () =>
        set((state) => {
          const newMode = !state.darkMode
          document.documentElement.classList.toggle('dark', newMode)
          return { darkMode: newMode }
        }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      updateWidget: (id, updates) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),

      reorderWidgets: (widgets) => set({ widgets }),

      updateLayout: (layout) => set({ layout }),

      resetWidgets: () => set({ widgets: defaultWidgets }),
    }),
    {
      name: 'dev-erp-settings',
    }
  )
)

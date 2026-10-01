import { create } from 'zustand'

export type SubscriptionState = 'none' | 'active' | 'grace' | 'readonly'

export interface SubscriptionSlice {
  state: SubscriptionState | null
  graceEndsAt: string | null
  message: string | null
}

export const useSubscriptionStore = create<SubscriptionSlice>(() => ({
  state: null,
  graceEndsAt: null,
  message: null,
}))

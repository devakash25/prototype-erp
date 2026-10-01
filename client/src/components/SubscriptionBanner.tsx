import { useSubscriptionStore } from '@/store/subscriptionStore'

export function SubscriptionBanner() {
  const { state, graceEndsAt, message } = useSubscriptionStore()

  if (state !== 'grace' && state !== 'readonly') return null

  const graceDate = graceEndsAt
    ? new Date(graceEndsAt).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  if (state === 'readonly') {
    return (
      <div className="bg-red-600 text-white text-sm px-4 py-2 flex flex-wrap items-center gap-x-2">
        <span className="font-semibold">Read-only mode.</span>
        <span>
          {message ||
            'Your subscription has expired. Renew the plan to restore write access.'}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-amber-500 text-white text-sm px-4 py-2 flex flex-wrap items-center gap-x-2">
      <span className="font-semibold">Subscription in grace period.</span>
      <span>
        {graceDate
          ? `Write access ends on ${graceDate} — renew your plan to avoid read-only mode.`
          : 'Renew your plan to avoid read-only mode.'}
      </span>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease'
  icon: any
  color: string
  href?: string
}

export function StatCard({ title, value, change, changeType, icon: Icon, color, href }: StatCardProps) {
  const Wrapper = href ? Link : 'div'
  const wrapperProps = href ? { to: href } : {}
  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow',
        href && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {changeType === 'increase' ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Wrapper>
  )
}

import type { ReactNode } from 'react'
import { Card } from './ui/Card'

export function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  sub?: ReactNode
}) {
  return (
    <Card className="min-w-0 p-4 sm:p-5">
      <div className="flex min-w-0 items-center gap-2 text-ink-400">
        <span className="shrink-0 text-lime-400">{icon}</span>
        <span className="truncate text-[11px] font-medium uppercase tracking-wider sm:text-xs">{label}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-100 tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-500">{sub}</p>}
    </Card>
  )
}

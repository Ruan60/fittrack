import type { ReactNode } from 'react'

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-400">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-100 sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-ink-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

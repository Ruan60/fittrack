import type { FitnessLevel } from '@/types'
import { LEVEL_LABELS } from '@/lib/constants'

const tone: Record<FitnessLevel, string> = {
  iniciante: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
  intermediario: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
  avancado: 'bg-rose-400/10 text-rose-300 ring-rose-400/20',
}

export function DifficultyBadge({ level }: { level: FitnessLevel }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${tone[level]}`}>
      {LEVEL_LABELS[level]}
    </span>
  )
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ink-800 px-2.5 py-1 text-[11px] font-medium text-ink-300">
      {children}
    </span>
  )
}

import { Trophy } from 'lucide-react'
import { levelProgress, levelTitle } from '@/lib/level'
import { formatNumber } from '@/lib/format'
import { Card } from './ui/Card'
import { ProgressBar } from './ProgressBar'

export function LevelCard({ xp }: { xp: number }) {
  const lp = levelProgress(xp)
  return (
    <Card className="relative overflow-hidden p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-lime-400 text-ink-950">
          <span className="text-[10px] font-bold uppercase tracking-wider">Nível</span>
          <span className="font-display text-2xl font-bold leading-none">{lp.level}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-lime-400" />
            <p className="font-display text-lg font-bold">{levelTitle(lp.level)}</p>
          </div>
          <p className="mt-0.5 text-sm text-ink-400">
            <span className="font-semibold text-ink-100 tabular-nums">{formatNumber(xp)} XP</span> no total
          </p>
        </div>
      </div>
      <ProgressBar value={lp.percent} className="mt-5" />
      <div className="mt-2 flex justify-between text-xs text-ink-500 tabular-nums">
        <span>
          {formatNumber(lp.current)} / {formatNumber(lp.needed)} XP
        </span>
        <span>
          Faltam {formatNumber(lp.remaining)} XP para o nível {lp.level + 1}
        </span>
      </div>
    </Card>
  )
}

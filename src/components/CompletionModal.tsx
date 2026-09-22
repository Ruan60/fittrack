import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check, Sparkles, Zap } from 'lucide-react'
import type { CompleteTrainingResult } from '@/types'
import { levelProgress } from '@/lib/level'
import { formatNumber } from '@/lib/format'
import { Button } from './ui/Button'
import { ProgressBar } from './ProgressBar'

export function CompletionModal({ result, onClose }: { result: CompleteTrainingResult; onClose: () => void }) {
  const lp = levelProgress(result.xp)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="done-title">
      <div className="animate-pop w-full max-w-md rounded-3xl border border-ink-700 bg-ink-900 p-6 text-center shadow-2xl sm:p-8">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-400">
          <Check className="h-8 w-8 text-ink-950" strokeWidth={3} />
        </span>
        <h2 id="done-title" className="mt-5 font-display text-2xl font-bold tracking-tight">
          Treino concluído!
        </h2>
        <p className="mt-1 text-sm text-ink-400">{result.training_name}</p>

        <p className="mt-6 inline-flex items-center gap-2 font-display text-5xl font-bold text-lime-400 tabular-nums">
          <Zap className="h-9 w-9" />+{result.xp_earned}
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-500">XP ganho</p>

        {result.leveled_up && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-lime-400/10 px-4 py-2 text-sm font-semibold text-lime-300 ring-1 ring-inset ring-lime-400/30">
            <Sparkles className="h-4 w-4" />
            Subiu para o nível {result.level}!
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-ink-850 p-4 text-left">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Nível {lp.level}</span>
            <span className="text-ink-400 tabular-nums">{formatNumber(result.xp)} XP</span>
          </div>
          <ProgressBar value={lp.percent} className="mt-2" />
          <p className="mt-2 text-xs text-ink-500">
            {result.total_workouts} {result.total_workouts === 1 ? 'treino concluído' : 'treinos concluídos'} · faltam {lp.remaining} XP para o nível {lp.level + 1}
          </p>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Link to="/progresso">
            <Button variant="secondary" full>
              Ver progresso
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button full>Voltar ao início</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

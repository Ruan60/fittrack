import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Clock, Dumbbell, Repeat, Timer, Zap } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { useAppData } from '@/hooks/useAppData'
import { useToast } from '@/hooks/useToast'
import { trainingService } from '@/services/trainingService'
import { GOAL_LABELS } from '@/lib/constants'
import { formatDuration } from '@/lib/format'
import { toMessage } from '@/lib/errors'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
import { DifficultyBadge } from '@/components/Badge'
import { CompletionModal } from '@/components/CompletionModal'
import type { CompleteTrainingResult, Exercise } from '@/types'

function exerciseMeta(e: Exercise): string {
  const parts: string[] = []
  if (e.sets && e.repetitions) parts.push(`${e.sets} × ${e.repetitions} reps`)
  else if (e.sets && e.duration_seconds) parts.push(`${e.sets} × ${formatDuration(e.duration_seconds)}`)
  else if (e.duration_seconds) parts.push(formatDuration(e.duration_seconds))
  else if (e.repetitions) parts.push(`${e.repetitions} reps`)
  return parts.join(' · ')
}

export function WorkoutDetailPage() {
  const { id = '' } = useParams()
  const { refresh } = useAppData()
  const toast = useToast()
  const { data: training, loading, error, reload } = useAsync(() => trainingService.get(id), [id])
  const [done, setDone] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<CompleteTrainingResult | null>(null)

  const toggle = (exId: string) =>
    setDone((s) => {
      const n = new Set(s)
      if (n.has(exId)) n.delete(exId)
      else n.add(exId)
      return n
    })

  const complete = async () => {
    if (!training || submitting) return
    setSubmitting(true)
    try {
      const res = await trainingService.complete(training.id)
      setResult(res)
      setDone(new Set())
      void refresh()
    } catch (e) {
      toast.error(toMessage(e, 'Não foi possível registrar o treino.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-40" />
        <Skeleton className="h-72" />
      </div>
    )
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!training)
    return (
      <EmptyState
        icon={<Dumbbell className="h-5 w-5" />}
        title="Treino não encontrado"
        description="Este treino não existe ou foi removido."
        action={
          <Link to="/treinos">
            <Button variant="secondary">Ver catálogo</Button>
          </Link>
        }
      />
    )

  const total = training.exercises.length
  const progress = total ? Math.round((done.size / total) * 100) : 0

  return (
    <div className="pb-24 lg:pb-0">
      <Link to="/treinos" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-400 hover:text-ink-100">
        <ArrowLeft className="h-4 w-4" /> Treinos
      </Link>

      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge level={training.difficulty} />
          <span className="text-xs font-medium text-ink-500">{GOAL_LABELS[training.goal]}</span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{training.name}</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-ink-400">{training.description}</p>
      </header>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { icon: Clock, label: 'Duração', value: `${training.duration_minutes} min` },
          { icon: Dumbbell, label: 'Exercícios', value: total },
          { icon: Zap, label: 'Recompensa', value: `+${training.xp_reward} XP`, accent: true },
        ].map(({ icon: Icon, label, value, accent }) => (
          <Card key={label} className="p-4">
            <Icon className={`h-4 w-4 ${accent ? 'text-lime-400' : 'text-ink-500'}`} />
            <p className={`mt-2 whitespace-nowrap font-display text-base font-bold sm:text-xl ${accent ? 'text-lime-400' : ''}`}>{value}</p>
            <p className="text-xs text-ink-500">{label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Exercícios</h2>
            <span className="text-sm text-ink-400 tabular-nums">
              {done.size}/{total} feitos
            </span>
          </div>
          {total === 0 ? (
            <EmptyState icon={<Dumbbell className="h-5 w-5" />} title="Sem exercícios" description="Este treino ainda não tem exercícios cadastrados." />
          ) : (
            <ol className="space-y-2">
              {training.exercises.map((e, i) => {
                const checked = done.has(e.id)
                return (
                  <li key={e.id}>
                    <button
                      onClick={() => toggle(e.id)}
                      className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors ${
                        checked ? 'border-lime-400/30 bg-lime-400/5' : 'border-ink-800 bg-ink-900 hover:border-ink-700'
                      }`}
                      aria-pressed={checked}
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                          checked ? 'bg-lime-400 text-ink-950' : 'bg-ink-800 text-ink-400'
                        }`}
                      >
                        {checked ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block font-semibold ${checked ? 'text-ink-300 line-through decoration-ink-600' : 'text-ink-100'}`}>
                          {e.name}
                        </span>
                        {e.description && <span className="mt-0.5 block text-sm text-ink-500">{e.description}</span>}
                        <span className="mt-2 inline-flex items-center gap-1 rounded-lg bg-ink-800 px-2 py-1 text-xs font-semibold text-ink-300 sm:hidden">
                          {e.duration_seconds && !e.repetitions ? <Timer className="h-3 w-3" /> : <Repeat className="h-3 w-3" />}
                          {exerciseMeta(e)}
                        </span>
                      </span>
                      <span className="hidden shrink-0 items-center gap-1 rounded-lg bg-ink-800 px-2 py-1 text-xs font-semibold text-ink-300 sm:inline-flex">
                        {e.duration_seconds && !e.repetitions ? <Timer className="h-3 w-3" /> : <Repeat className="h-3 w-3" />}
                        {exerciseMeta(e)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        {/* Painel de conclusão: fixo no rodapé no mobile, lateral no desktop */}
        <aside className="fixed inset-x-0 bottom-[64px] z-20 border-t border-ink-800 bg-ink-950/95 p-4 backdrop-blur lg:static lg:bottom-auto lg:self-start lg:border-0 lg:bg-transparent lg:p-0">
          <Card className="hidden p-5 lg:block">
            <p className="text-sm font-semibold">Seu progresso</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-800">
              <div className="h-full rounded-full bg-lime-400 transition-[width]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-ink-500">Marque os exercícios conforme for fazendo (opcional).</p>
            <Button size="lg" full className="mt-5" loading={submitting} onClick={complete}>
              <Check className="h-5 w-5" strokeWidth={3} />
              Concluir treino
            </Button>
            <p className="mt-3 text-center text-xs text-ink-500">Você ganha +{training.xp_reward} XP ao concluir</p>
          </Card>
          <div className="lg:hidden">
            <Button size="lg" full loading={submitting} onClick={complete}>
              <Check className="h-5 w-5" strokeWidth={3} />
              Concluir treino · +{training.xp_reward} XP
            </Button>
          </div>
        </aside>
      </div>

      {result && <CompletionModal result={result} onClose={() => setResult(null)} />}
    </div>
  )
}

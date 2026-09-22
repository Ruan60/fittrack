import { CalendarCheck, Dumbbell, Flame, History, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppData } from '@/hooks/useAppData'
import { useAsync } from '@/hooks/useAsync'
import { trainingService } from '@/services/trainingService'
import { WEEKLY_GOAL } from '@/lib/constants'
import { formatNumber, startOfWeek } from '@/lib/format'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
import { StatCard } from '@/components/StatCard'
import { LevelCard } from '@/components/LevelCard'
import { WeekChart } from '@/components/WeekChart'
import { HistoryList } from '@/components/HistoryList'
import type { TrainingSession } from '@/types'

const WEEKS = 8

function WeeksChart({ sessions, goal }: { sessions: TrainingSession[]; goal: number }) {
  const thisMonday = startOfWeek()
  const weeks = Array.from({ length: WEEKS }, (_, i) => {
    const start = new Date(thisMonday)
    start.setDate(thisMonday.getDate() - (WEEKS - 1 - i) * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 7)
    const count = sessions.filter((s) => {
      const d = new Date(s.completed_at)
      return d >= start && d < end
    }).length
    return { start, count, current: i === WEEKS - 1 }
  })
  const max = Math.max(goal, ...weeks.map((w) => w.count))

  return (
    <div>
      <div className="relative flex h-40 items-end gap-2 sm:gap-3">
        <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-ink-600" style={{ bottom: `${(goal / max) * 100}%` }}>
          <span className="absolute -top-5 right-0 text-[10px] font-semibold uppercase tracking-wider text-ink-500">meta {goal}</span>
        </div>
        {weeks.map((w) => (
          <div key={w.start.toISOString()} className="flex h-full flex-1 items-end justify-center" title={`${w.count} treino(s)`}>
            <div
              className={`w-full max-w-[40px] rounded-lg transition-[height] duration-700 ${w.count >= goal ? 'bg-lime-400' : w.count ? 'bg-lime-400/50' : 'bg-ink-800'}`}
              style={{ height: w.count ? `${(w.count / max) * 100}%` : '6px' }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3">
        {weeks.map((w) => (
          <span key={w.start.toISOString()} className={`flex-1 text-center text-[10px] font-medium sm:text-xs ${w.current ? 'text-lime-400' : 'text-ink-500'}`}>
            {w.current ? 'Atual' : w.start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </span>
        ))}
      </div>
    </div>
  )
}

export function ProgressPage() {
  const { profile, stats, loading, error, refresh } = useAppData()
  const data = useAsync(async () => {
    const since = startOfWeek()
    since.setDate(since.getDate() - (WEEKS - 1) * 7)
    const [history, range] = await Promise.all([trainingService.history(20), trainingService.sessionsSince(since)])
    return { history, range }
  }, [profile?.total_workouts])

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-36" />
        <Skeleton className="h-64" />
      </div>
    )
  if (error || !profile || !stats) return <ErrorState message={error ?? 'Perfil não encontrado.'} onRetry={refresh} />

  const goal = WEEKLY_GOAL[profile.fitness_level]
  const weekSessions = data.data?.range.filter((s) => new Date(s.completed_at) >= startOfWeek()) ?? []
  const weekXp = weekSessions.reduce((a, s) => a + s.xp_earned, 0)

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Evolução" title="Progresso" subtitle="Seu histórico de treinos e XP." />

      <LevelCard xp={stats.xp} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<Zap className="h-4 w-4" />} label="XP total" value={formatNumber(stats.xp)} sub={`+${weekXp} nesta semana`} />
        <StatCard icon={<Dumbbell className="h-4 w-4" />} label="Treinos" value={stats.total_workouts} sub="no total" />
        <StatCard icon={<CalendarCheck className="h-4 w-4" />} label="Semana" value={`${stats.week_workouts}/${goal}`} sub="treinos vs. meta" />
        <StatCard icon={<Flame className="h-4 w-4" />} label="Sequência" value={stats.streak_days} sub={stats.streak_days === 1 ? 'dia' : 'dias'} />
      </div>

      {data.error ? (
        <ErrorState message={data.error} onRetry={data.reload} />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold">Esta semana</h2>
              <p className="text-sm text-ink-500">XP por dia</p>
              <div className="mt-5">{data.data ? <WeekChart sessions={weekSessions} /> : <Skeleton className="h-36" />}</div>
            </Card>
            <Card className="p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold">Últimas {WEEKS} semanas</h2>
              <p className="text-sm text-ink-500">Treinos por semana</p>
              <div className="mt-7">{data.data ? <WeeksChart sessions={data.data.range} goal={goal} /> : <Skeleton className="h-40" />}</div>
            </Card>
          </div>

          <Card className="p-5 sm:p-6">
            <h2 className="mb-2 font-display text-lg font-bold">Histórico recente</h2>
            {!data.data ? (
              <Skeleton className="h-48" />
            ) : data.data.history.length === 0 ? (
              <EmptyState
                icon={<History className="h-5 w-5" />}
                title="Nenhum treino ainda"
                description="Conclua seu primeiro treino para começar a acumular XP."
                action={
                  <Link to="/treinos">
                    <Button>Escolher treino</Button>
                  </Link>
                }
              />
            ) : (
              <HistoryList sessions={data.data.history} />
            )}
          </Card>
        </>
      )}
    </div>
  )
}

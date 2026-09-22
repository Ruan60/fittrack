import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, Clock, Dumbbell, Flame, History, Play, Zap } from 'lucide-react'
import { useAppData } from '@/hooks/useAppData'
import { useAsync } from '@/hooks/useAsync'
import { trainingService } from '@/services/trainingService'
import { recommendTraining } from '@/lib/recommend'
import { WEEKLY_GOAL, GOAL_LABELS } from '@/lib/constants'
import { firstName, formatNumber, greeting, startOfWeek } from '@/lib/format'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
import { StatCard } from '@/components/StatCard'
import { LevelCard } from '@/components/LevelCard'
import { ProgressBar } from '@/components/ProgressBar'
import { WeekChart } from '@/components/WeekChart'
import { HistoryList } from '@/components/HistoryList'
import { DifficultyBadge } from '@/components/Badge'

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-40" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-56" />
    </div>
  )
}

export function DashboardPage() {
  const { profile, stats, loading, error, refresh } = useAppData()

  const data = useAsync(
    async () => {
      const [catalog, history, week] = await Promise.all([
        trainingService.list(),
        trainingService.history(5),
        trainingService.sessionsSince(startOfWeek()),
      ])
      return { catalog, history, week }
    },
    [profile?.total_workouts],
  )

  if (loading) return <DashboardSkeleton />
  if (error || !profile || !stats) return <ErrorState message={error ?? 'Perfil não encontrado.'} onRetry={refresh} />

  const weeklyGoal = WEEKLY_GOAL[profile.fitness_level]
  const weekPct = (stats.week_workouts / weeklyGoal) * 100
  const recommended = data.data ? recommendTraining(data.data.catalog, profile, data.data.history) : null

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-ink-400">{greeting()},</p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{firstName(profile.name)}</h1>
        <p className="mt-1 text-sm text-ink-400">
          {stats.trained_today ? 'Treino de hoje feito. Mandou bem!' : 'Bora treinar hoje?'}
        </p>
      </header>

      {/* Próximo treino (CTA principal) */}
      {data.loading && !data.data ? (
        <Skeleton className="h-52" />
      ) : data.error ? (
        <ErrorState message={data.error} onRetry={data.reload} />
      ) : recommended ? (
        <Card className="overflow-hidden border-lime-400/25 bg-gradient-to-br from-ink-900 to-ink-850">
          <div className="p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lime-400">Treino recomendado</p>
              <DifficultyBadge level={recommended.difficulty} />
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">{recommended.name}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-400">{recommended.description}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-300">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-ink-500" />
                {recommended.duration_minutes} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Dumbbell className="h-4 w-4 text-ink-500" />
                {recommended.exercise_count} exercícios
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-lime-400">
                <Zap className="h-4 w-4" />+{recommended.xp_reward} XP
              </span>
              <span className="text-ink-500">{GOAL_LABELS[recommended.goal]}</span>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to={`/treinos/${recommended.id}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  <Play className="h-4 w-4 fill-current" />
                  Iniciar treino
                </Button>
              </Link>
              <Link to="/treinos">
                <Button size="lg" variant="ghost" className="w-full sm:w-auto">
                  Ver todos os treinos
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState icon={<Dumbbell className="h-5 w-5" />} title="Nenhum treino no catálogo" description="Rode a migration de seed no Supabase para carregar os treinos de demonstração." />
      )}

      {/* Números */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<Zap className="h-4 w-4" />} label="XP" value={formatNumber(stats.xp)} sub={`Nível ${stats.level}`} />
        <StatCard icon={<Dumbbell className="h-4 w-4" />} label="Treinos" value={stats.total_workouts} sub="concluídos" />
        <StatCard icon={<Flame className="h-4 w-4" />} label="Sequência" value={stats.streak_days} sub={stats.streak_days === 1 ? 'dia seguido' : 'dias seguidos'} />
        <StatCard icon={<CalendarCheck className="h-4 w-4" />} label="Semana" value={`${stats.week_workouts}/${weeklyGoal}`} sub="meta semanal" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2 [&>*]:h-full">
          <LevelCard xp={stats.xp} />
        </div>
        <Card className="p-5 sm:p-6 lg:col-span-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="font-display text-lg font-bold">Progresso da semana</h2>
            <span className="text-sm text-ink-400 tabular-nums">
              {stats.week_workouts} de {weeklyGoal} treinos
            </span>
          </div>
          <ProgressBar value={weekPct} thin className="mt-3" />
          <div className="mt-5">{data.data ? <WeekChart sessions={data.data.week} /> : <Skeleton className="h-36" />}</div>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Atividade recente</h2>
          <Link to="/progresso" className="inline-flex items-center gap-1 text-sm font-semibold text-lime-400 hover:text-lime-300">
            Ver tudo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {data.data && data.data.history.length > 0 ? (
          <HistoryList sessions={data.data.history.slice(0, 3)} />
        ) : data.data ? (
          <div className="py-6 text-center">
            <History className="mx-auto h-6 w-6 text-ink-600" />
            <p className="mt-2 text-sm text-ink-400">Seus treinos concluídos aparecem aqui.</p>
          </div>
        ) : (
          <Skeleton className="h-32" />
        )}
      </Card>
    </div>
  )
}

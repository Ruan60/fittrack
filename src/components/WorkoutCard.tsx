import { Link } from 'react-router-dom'
import { ChevronRight, Clock, Dumbbell, Zap } from 'lucide-react'
import type { Training } from '@/types'
import { GOAL_LABELS } from '@/lib/constants'
import { Card } from './ui/Card'
import { Chip, DifficultyBadge } from './Badge'

export function WorkoutCard({ training }: { training: Training }) {
  return (
    <Link to={`/treinos/${training.id}`} className="group block focus-visible:outline-none">
      <Card className="flex h-full flex-col p-5 transition-colors group-hover:border-ink-600 group-focus-visible:ring-2 group-focus-visible:ring-lime-400/50">
        <div className="flex items-start justify-between gap-3">
          <DifficultyBadge level={training.difficulty} />
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-lime-400">
            <Zap className="h-3.5 w-3.5" />+{training.xp_reward} XP
          </span>
        </div>
        <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-ink-100">{training.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-400">{training.description}</p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <div className="flex flex-wrap gap-1.5">
            <Chip>
              <Clock className="h-3 w-3" />
              {training.duration_minutes} min
            </Chip>
            {training.exercise_count ? (
              <Chip>
                <Dumbbell className="h-3 w-3" />
                {training.exercise_count} exercícios
              </Chip>
            ) : null}
            <Chip>{GOAL_LABELS[training.goal]}</Chip>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-200" />
        </div>
      </Card>
    </Link>
  )
}

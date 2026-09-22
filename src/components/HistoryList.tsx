import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import type { TrainingSession } from '@/types'
import { formatRelativeDay } from '@/lib/format'

export function HistoryList({ sessions }: { sessions: TrainingSession[] }) {
  return (
    <ul className="divide-y divide-ink-800">
      {sessions.map((s) => (
        <li key={s.id}>
          <Link
            to={`/treinos/${s.training_id}`}
            className="flex items-center gap-3 px-1 py-3.5 transition-colors hover:bg-ink-850/60 sm:px-2"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-400/10">
              <CheckCircle2 className="h-5 w-5 text-lime-400" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink-100">{s.training?.name ?? 'Treino'}</p>
              <p className="text-xs text-ink-500">
                {formatRelativeDay(s.completed_at)}
                {s.training?.duration_minutes ? ` · ${s.training.duration_minutes} min` : ''}
              </p>
            </div>
            <span className="text-sm font-bold text-lime-400 tabular-nums">+{s.xp_earned} XP</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

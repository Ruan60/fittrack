import { useMemo, useState } from 'react'
import { Dumbbell } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { trainingService } from '@/services/trainingService'
import { LEVEL_OPTIONS } from '@/lib/constants'
import { PageHeader } from '@/components/PageHeader'
import { WorkoutCard } from '@/components/WorkoutCard'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
import type { FitnessLevel } from '@/types'

type Filter = 'todos' | FitnessLevel

export function WorkoutsPage() {
  const { data, loading, error, reload } = useAsync(() => trainingService.list(), [])
  const [filter, setFilter] = useState<Filter>('todos')

  const filtered = useMemo(
    () => (data ?? []).filter((t) => filter === 'todos' || t.difficulty === filter),
    [data, filter],
  )

  const filters: { value: Filter; label: string }[] = [{ value: 'todos', label: 'Todos' }, ...LEVEL_OPTIONS]

  return (
    <div>
      <PageHeader eyebrow="Catálogo" title="Treinos" subtitle="Escolha um treino, conclua e ganhe XP." />

      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist">
        {filters.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filter === f.value ? 'bg-ink-100 text-ink-950' : 'bg-ink-900 text-ink-400 ring-1 ring-inset ring-ink-800 hover:text-ink-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Dumbbell className="h-5 w-5" />}
          title="Nenhum treino encontrado"
          description={data?.length ? 'Não há treinos para este nível ainda.' : 'O catálogo está vazio. Rode a migration de seed.'}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((t) => (
            <WorkoutCard key={t.id} training={t} />
          ))}
        </div>
      )}
    </div>
  )
}

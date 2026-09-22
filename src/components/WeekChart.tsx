import { dayKey, startOfWeek } from '@/lib/format'
import type { TrainingSession } from '@/types'

const LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
const FULL = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

/** Barras dos 7 dias da semana atual (seg-dom) com XP por dia */
export function WeekChart({ sessions }: { sessions: Pick<TrainingSession, 'completed_at' | 'xp_earned'>[] }) {
  const monday = startOfWeek()
  const todayKey = dayKey(new Date())
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return { key: dayKey(d), label: LABELS[i], full: FULL[i], xp: 0, count: 0, future: d > new Date() }
  })
  for (const s of sessions) {
    const day = days.find((d) => d.key === dayKey(new Date(s.completed_at)))
    if (day) {
      day.xp += s.xp_earned
      day.count += 1
    }
  }
  const max = Math.max(160, ...days.map((d) => d.xp))

  return (
    <div className="flex h-36 items-end justify-between gap-2 sm:gap-3">
      {days.map((d) => {
        const h = d.xp ? Math.max(14, (d.xp / max) * 100) : 0
        const isToday = d.key === todayKey
        return (
          <div key={d.key} className="flex flex-1 flex-col items-center gap-2" title={`${d.full}: ${d.count} treino(s), ${d.xp} XP`}>
            <div className="relative flex h-28 w-full items-end justify-center">
              <div className="absolute inset-x-0 bottom-0 mx-auto h-full w-full max-w-[36px] rounded-lg bg-ink-800/60" />
              {d.xp > 0 && (
                <div
                  className="relative w-full max-w-[36px] rounded-lg bg-lime-400 transition-[height] duration-700"
                  style={{ height: `${h}%` }}
                >
                  {d.count > 1 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-lime-300">
                      {d.count}x
                    </span>
                  )}
                </div>
              )}
            </div>
            <span className={`text-xs font-semibold ${isToday ? 'text-lime-400' : d.future ? 'text-ink-600' : 'text-ink-400'}`}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

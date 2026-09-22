import type { Profile, Training, TrainingSession } from '@/types'

const ORDER = { iniciante: 0, intermediario: 1, avancado: 2 } as const

/**
 * Recomenda o próximo treino:
 * + nível compatível com o usuário, + objetivo igual,
 * - penaliza treinos feitos recentemente (variação).
 */
export function recommendTraining(
  catalog: Training[],
  profile: Pick<Profile, 'fitness_level' | 'goal'>,
  recent: Pick<TrainingSession, 'training_id'>[],
): Training | null {
  if (catalog.length === 0) return null
  const userLevel = ORDER[profile.fitness_level]
  const recentIds = recent.slice(0, 3).map((s) => s.training_id)

  const scored = catalog.map((t) => {
    let score = 0
    const diff = ORDER[t.difficulty] - userLevel
    if (diff === 0) score += 3
    else if (diff === -1) score += 1.5
    else if (diff === 1) score += 0.5
    else score -= 2
    if (profile.goal && t.goal === profile.goal) score += 2
    const idx = recentIds.indexOf(t.id)
    if (idx === 0) score -= 5
    else if (idx > 0) score -= 2
    return { t, score }
  })
  scored.sort((a, b) => b.score - a.score || a.t.name.localeCompare(b.t.name))
  return scored[0].t
}

import type { FitnessLevel, Goal } from '@/types'

export const GOAL_LABELS: Record<Goal, string> = {
  perder_peso: 'Perder peso',
  ganhar_massa: 'Ganhar massa',
  condicionamento: 'Condicionamento',
  saude: 'Saúde e bem-estar',
}

export const LEVEL_LABELS: Record<FitnessLevel, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

export const GOAL_OPTIONS = Object.entries(GOAL_LABELS).map(([value, label]) => ({
  value: value as Goal,
  label,
}))

export const LEVEL_OPTIONS = Object.entries(LEVEL_LABELS).map(([value, label]) => ({
  value: value as FitnessLevel,
  label,
}))

/** Meta semanal de treinos por nível */
export const WEEKLY_GOAL: Record<FitnessLevel, number> = {
  iniciante: 3,
  intermediario: 4,
  avancado: 5,
}

export const LIMITS = {
  age: { min: 12, max: 100 },
  height: { min: 100, max: 250 },
  weight: { min: 30, max: 350 },
  password: { min: 6 },
}

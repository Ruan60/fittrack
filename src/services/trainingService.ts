import { supabase } from '@/lib/supabase'
import type { CompleteTrainingResult, Training, TrainingSession, TrainingWithExercises } from '@/types'

const DIFFICULTY_ORDER = { iniciante: 0, intermediario: 1, avancado: 2 } as const

export const trainingService = {
  async list(): Promise<Training[]> {
    const { data, error } = await supabase
      .from('training_catalog')
      .select('*, training_exercises(count)')
    if (error) throw error
    return (data ?? [])
      .map((row) => {
        const { training_exercises, ...rest } = row as Training & { training_exercises: { count: number }[] }
        return { ...rest, exercise_count: training_exercises?.[0]?.count ?? 0 }
      })
      .sort(
        (a, b) =>
          DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] || a.name.localeCompare(b.name, 'pt-BR'),
      )
  },

  async get(id: string): Promise<TrainingWithExercises | null> {
    const { data, error } = await supabase
      .from('training_catalog')
      .select('*, exercises:training_exercises(*)')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    const t = data as TrainingWithExercises
    t.exercises = [...(t.exercises ?? [])].sort((a, b) => a.order_index - b.order_index)
    return t
  },

  /** Registra o treino e concede XP (validação feita no banco) */
  async complete(trainingId: string): Promise<CompleteTrainingResult> {
    const { data, error } = await supabase.rpc('complete_training', { p_training_id: trainingId })
    if (error) throw error
    return data as CompleteTrainingResult
  },

  async history(limit = 20): Promise<TrainingSession[]> {
    const { data, error } = await supabase
      .from('training_sessions')
      .select('*, training:training_catalog(id, name, difficulty, duration_minutes, goal)')
      .order('completed_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data ?? []) as TrainingSession[]
  },

  async sessionsSince(since: Date): Promise<TrainingSession[]> {
    const { data, error } = await supabase
      .from('training_sessions')
      .select('id, user_id, training_id, completed_at, xp_earned')
      .gte('completed_at', since.toISOString())
      .order('completed_at', { ascending: true })
    if (error) throw error
    return (data ?? []) as TrainingSession[]
  },
}

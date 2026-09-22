export type Goal = 'perder_peso' | 'ganhar_massa' | 'condicionamento' | 'saude'
export type FitnessLevel = 'iniciante' | 'intermediario' | 'avancado'

export interface Profile {
  id: string
  name: string
  age: number | null
  height: number | null
  weight: number | null
  goal: Goal | null
  fitness_level: FitnessLevel
  avatar_url: string | null
  xp: number
  total_workouts: number
  created_at: string
  updated_at: string
}

export type ProfileUpdate = Partial<
  Pick<Profile, 'name' | 'age' | 'height' | 'weight' | 'goal' | 'fitness_level' | 'avatar_url'>
>

export interface Exercise {
  id: string
  training_id: string
  name: string
  description: string | null
  sets: number | null
  repetitions: number | null
  duration_seconds: number | null
  order_index: number
}

export interface Training {
  id: string
  name: string
  description: string
  goal: Goal
  difficulty: FitnessLevel
  duration_minutes: number
  xp_reward: number
  created_at: string
  exercise_count?: number
}

export interface TrainingWithExercises extends Training {
  exercises: Exercise[]
}

export interface TrainingSession {
  id: string
  user_id: string
  training_id: string
  completed_at: string
  xp_earned: number
  training?: Pick<Training, 'id' | 'name' | 'difficulty' | 'duration_minutes' | 'goal'> | null
}

export interface UserStats {
  xp: number
  level: number
  total_workouts: number
  week_workouts: number
  streak_days: number
  trained_today: boolean
}

export interface CompleteTrainingResult {
  session_id: string
  training_name: string
  completed_at: string
  xp_earned: number
  xp: number
  total_workouts: number
  level: number
  previous_level: number
  leveled_up: boolean
}

export interface SignUpInput {
  name: string
  email: string
  password: string
  age: number
  height: number
  weight: number
  goal: Goal
  fitness_level: FitnessLevel
}

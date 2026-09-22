import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { userTimeZone } from '@/lib/format'
import type { FitnessLevel, Goal, Profile, ProfileUpdate, UserStats } from '@/types'

const GOALS: Goal[] = ['perder_peso', 'ganhar_massa', 'condicionamento', 'saude']
const LEVELS: FitnessLevel[] = ['iniciante', 'intermediario', 'avancado']

function num(v: unknown, min: number, max: number): number | null {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) && n >= min && n <= max ? n : null
}

export const profileService = {
  async getMine(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) throw error
    return data as Profile | null
  },

  /**
   * Garante que o perfil existe. Normalmente o trigger do banco já cria;
   * isto cobre contas criadas antes das migrations.
   */
  async ensure(user: User): Promise<Profile> {
    const existing = await this.getMine(user.id)
    if (existing) return existing

    const m = (user.user_metadata ?? {}) as Record<string, unknown>
    const rawName = String(m.name ?? '').trim()
    const name = rawName.length >= 2 ? rawName.slice(0, 80) : (user.email?.split('@')[0] ?? 'Atleta')
    const goal = GOALS.includes(m.goal as Goal) ? (m.goal as Goal) : null
    const level = LEVELS.includes(m.fitness_level as FitnessLevel) ? (m.fitness_level as FitnessLevel) : 'iniciante'
    const ageN = num(m.age, 12, 100)

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name,
        age: ageN === null ? null : Math.round(ageN),
        height: num(m.height, 100, 250),
        weight: num(m.weight, 30, 350),
        goal,
        fitness_level: level,
      })
      .select('*')
      .single()
    if (error) {
      // Corrida com o trigger: o perfil foi criado entre o select e o insert
      if (error.code === '23505') {
        const again = await this.getMine(user.id)
        if (again) return again
      }
      throw error
    }
    return data as Profile
  },

  async update(userId: string, patch: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase.from('profiles').update(patch).eq('id', userId).select('*').single()
    if (error) throw error
    return data as Profile
  },

  async getStats(): Promise<UserStats> {
    const { data, error } = await supabase.rpc('get_user_stats', { p_tz: userTimeZone })
    if (error) throw error
    return data as UserStats
  },
}

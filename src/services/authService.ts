import { supabase } from '@/lib/supabase'
import type { SignUpInput } from '@/types'

export const authService = {
  async signUp(input: SignUpInput) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        // Lidos pelo trigger handle_new_user() para criar o perfil
        data: {
          name: input.name.trim(),
          age: input.age,
          height: input.height,
          weight: input.weight,
          goal: input.goal,
          fitness_level: input.fitness_level,
        },
      },
    })
    if (error) throw error
    // Supabase devolve user sem identities quando o e-mail já existe (com confirmação ligada)
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error('User already registered')
    }
    return { session: data.session, user: data.user, needsConfirmation: !data.session }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
}

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { profileService } from '@/services/profileService'
import { toMessage } from '@/lib/errors'
import type { Profile, UserStats } from '@/types'

interface AppDataValue {
  profile: Profile | null
  stats: UserStats | null
  loading: boolean
  error: string | null
  /** Recarrega perfil e estatísticas (ex.: após concluir um treino) */
  refresh: () => Promise<void>
  setProfile: (p: Profile) => void
}

const AppDataContext = createContext<AppDataValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (showLoading: boolean) => {
      if (!user) return
      if (showLoading) setLoading(true)
      setError(null)
      try {
        const p = await profileService.ensure(user)
        const s = await profileService.getStats()
        setProfile(p)
        setStats(s)
      } catch (e) {
        setError(toMessage(e, 'Não foi possível carregar seus dados.'))
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  useEffect(() => {
    void load(true)
  }, [load])

  const refresh = useCallback(() => load(false), [load])

  return (
    <AppDataContext.Provider value={{ profile, stats, loading, error, refresh, setProfile }}>
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData deve ser usado dentro de <AppDataProvider>')
  return ctx
}

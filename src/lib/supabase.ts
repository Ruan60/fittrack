import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** false quando as variáveis de ambiente não foram configuradas */
export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('SEU-PROJETO') && url.startsWith('http'),
)

// A anon key é pública por design: a proteção real dos dados vem do RLS.
export const supabase = createClient(url ?? 'http://localhost:54321', anonKey ?? 'missing-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

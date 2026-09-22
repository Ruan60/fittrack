export const userTimeZone = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo'
  } catch {
    return 'America/Sao_Paulo'
  }
})()

export function firstName(name: string | null | undefined): string {
  return (name ?? '').trim().split(/\s+/)[0] || 'Atleta'
}

export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'FT'
  return ((parts[0][0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export function greeting(date = new Date()): string {
  const h = date.getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s ? `${m}min ${s}s` : `${m} min`
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('pt-BR').format(n)
}

export function formatRelativeDay(iso: string): string {
  const d = new Date(iso)
  const today = startOfDay(new Date())
  const diff = Math.round((today.getTime() - startOfDay(d).getTime()) / 86_400_000)
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (diff === 0) return `Hoje, ${time}`
  if (diff === 1) return `Ontem, ${time}`
  if (diff < 7) {
    const wd = d.toLocaleDateString('pt-BR', { weekday: 'long' })
    return `${wd.charAt(0).toUpperCase()}${wd.slice(1)}, ${time}`
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + `, ${time}`
}

export function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** Segunda-feira da semana de `d` (00:00 local) */
export function startOfWeek(d = new Date()): Date {
  const x = startOfDay(d)
  const day = (x.getDay() + 6) % 7 // 0 = segunda
  x.setDate(x.getDate() - day)
  return x
}

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

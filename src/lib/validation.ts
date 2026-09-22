import { LIMITS } from './constants'

export function validateEmail(v: string): string | undefined {
  if (!v.trim()) return 'Informe seu e-mail.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'E-mail inválido.'
}

export function validatePassword(v: string): string | undefined {
  if (!v) return 'Informe uma senha.'
  if (v.length < LIMITS.password.min) return `Mínimo de ${LIMITS.password.min} caracteres.`
}

export function validateName(v: string): string | undefined {
  const t = v.trim()
  if (t.length < 2) return 'Informe seu nome.'
  if (t.length > 80) return 'Nome muito longo.'
}

export function parseNum(v: string): number {
  return Number(String(v).replace(',', '.'))
}

export function validateRange(v: string, key: keyof Omit<typeof LIMITS, 'password'>, label: string): string | undefined {
  if (String(v).trim() === '') return `Informe ${label}.`
  const n = parseNum(v)
  const { min, max } = LIMITS[key]
  if (!Number.isFinite(n)) return 'Valor inválido.'
  if (n < min || n > max) return `Entre ${min} e ${max}.`
}

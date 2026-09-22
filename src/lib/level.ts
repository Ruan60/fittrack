/**
 * Curva de nível (espelha public.level_from_xp no banco):
 * subir do nível N para N+1 custa N * 100 XP.
 * XP acumulado para atingir o nível L = 50 * L * (L - 1)
 */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1)
}

export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor((1 + Math.sqrt(1 + Math.max(xp, 0) / 12.5)) / 2))
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp)
  const start = xpForLevel(level)
  const end = xpForLevel(level + 1)
  const current = xp - start
  const needed = end - start
  return {
    level,
    current,
    needed,
    remaining: end - xp,
    percent: Math.min(100, Math.round((current / needed) * 100)),
  }
}

export function levelTitle(level: number): string {
  if (level >= 15) return 'Lenda'
  if (level >= 10) return 'Elite'
  if (level >= 7) return 'Atleta'
  if (level >= 4) return 'Dedicado'
  if (level >= 2) return 'Em ritmo'
  return 'Novato'
}

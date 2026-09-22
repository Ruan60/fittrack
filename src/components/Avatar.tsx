import { useState } from 'react'
import { initials } from '@/lib/format'

const sizes = { sm: 'h-9 w-9 text-xs', md: 'h-12 w-12 text-sm', lg: 'h-24 w-24 text-2xl' }

export function Avatar({ name, url, size = 'md' }: { name?: string | null; url?: string | null; size?: keyof typeof sizes }) {
  const [broken, setBroken] = useState(false)
  const cls = `${sizes[size]} shrink-0 rounded-full ring-2 ring-ink-800 overflow-hidden`
  if (url && !broken) {
    return <img src={url} alt={name ?? 'Avatar'} onError={() => setBroken(true)} className={`${cls} object-cover`} />
  }
  return (
    <span className={`${cls} flex items-center justify-center bg-lime-400/15 font-display font-bold text-lime-300`}>
      {initials(name)}
    </span>
  )
}

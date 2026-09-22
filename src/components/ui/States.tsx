import type { ReactNode } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from './Button'

export function Spinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-400" role="status">
      <Loader2 className="h-6 w-6 animate-spin text-lime-400" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-950">
      <Loader2 className="h-7 w-7 animate-spin text-lime-400" />
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-ink-800/70 ${className}`} />
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10">
        <AlertTriangle className="h-5 w-5 text-red-400" />
      </span>
      <div>
        <p className="font-semibold text-ink-100">Não foi possível carregar</p>
        <p className="mt-1 text-sm text-ink-400">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-700 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-800 text-ink-300">{icon}</span>
      <p className="font-display text-lg font-semibold text-ink-100">{title}</p>
      <p className="max-w-xs text-sm text-ink-400">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

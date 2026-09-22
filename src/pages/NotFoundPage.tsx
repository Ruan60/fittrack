import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-ink-950 px-6 text-center text-ink-100">
      <Logo />
      <p className="font-display text-7xl font-bold text-lime-400">404</p>
      <p className="text-ink-400">Esta página não existe.</p>
      <Link to="/">
        <Button>Voltar ao início</Button>
      </Link>
    </div>
  )
}

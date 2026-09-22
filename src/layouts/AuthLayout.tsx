import { Outlet } from 'react-router-dom'
import { Flame, Trophy, Zap } from 'lucide-react'
import { Logo } from '@/components/Logo'

export function AuthLayout() {
  return (
    <div className="grid min-h-dvh bg-ink-950 text-ink-100 lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden border-r border-ink-800 bg-ink-900 p-12 lg:flex lg:flex-col">
        <Logo />
        <div className="my-auto max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">Treine. Registre. Evolua.</p>
          <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] tracking-tight">
            Cada treino conta. Literalmente.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-400">
            Escolha um treino, conclua, ganhe XP e acompanhe sua evolução semana após semana.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { icon: Zap, t: 'XP por treino' },
              { icon: Trophy, t: 'Níveis' },
              { icon: Flame, t: 'Sequência' },
            ].map(({ icon: Icon, t }) => (
              <div key={t} className="rounded-2xl border border-ink-800 bg-ink-950/60 p-4">
                <Icon className="h-5 w-5 text-lime-400" />
                <p className="mt-3 text-sm font-medium text-ink-200">{t}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-ink-600">Projeto acadêmico · MVP</p>
      </section>

      <section className="flex flex-col px-5 py-8 sm:px-10">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <Outlet />
        </div>
      </section>
    </div>
  )
}

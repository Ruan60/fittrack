import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, Dumbbell, Home, LogOut, User } from 'lucide-react'
import { AppDataProvider, useAppData } from '@/hooks/useAppData'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Logo } from '@/components/Logo'
import { Avatar } from '@/components/Avatar'
import { levelProgress } from '@/lib/level'
import { ProgressBar } from '@/components/ProgressBar'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/treinos', label: 'Treinos', icon: Dumbbell },
  { to: '/progresso', label: 'Progresso', icon: BarChart3 },
  { to: '/perfil', label: 'Perfil', icon: User },
]

function Shell() {
  const { profile } = useAppData()
  const { signOut } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const lp = levelProgress(profile?.xp ?? 0)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      toast.error('Não foi possível sair. Tente novamente.')
    }
  }

  return (
    <div className="min-h-dvh bg-ink-950 text-ink-100">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-ink-800 bg-ink-950 px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-10 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-ink-850 text-ink-100' : 'text-ink-400 hover:bg-ink-900 hover:text-ink-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-lime-400' : ''}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          {profile && (
            <div className="rounded-2xl border border-ink-800 bg-ink-900 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={profile.name} url={profile.avatar_url} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{profile.name}</p>
                  <p className="text-xs text-ink-500">Nível {lp.level}</p>
                </div>
              </div>
              <ProgressBar value={lp.percent} thin className="mt-3" />
              <p className="mt-1.5 text-[11px] text-ink-500">{lp.remaining} XP para o nível {lp.level + 1}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-400 transition-colors hover:bg-ink-900 hover:text-ink-200"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sair
          </button>
        </div>
      </aside>

      {/* Topo mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-800/80 bg-ink-950/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <button
            onClick={handleSignOut}
            className="rounded-lg p-2 text-ink-400 hover:bg-ink-800 hover:text-ink-100"
            aria-label="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
          <NavLink to="/perfil" aria-label="Perfil">
            <Avatar name={profile?.name} url={profile?.avatar_url} size="sm" />
          </NavLink>
        </div>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
          <Outlet />
        </div>
      </main>

      {/* Navegação inferior mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-800 bg-ink-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-lime-400' : 'text-ink-500'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export function AppLayout() {
  return (
    <AppDataProvider>
      <Shell />
    </AppDataProvider>
  )
}

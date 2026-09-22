import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { FullScreenLoader } from './ui/States'

/** Bloqueia páginas autenticadas: sem sessão -> /login */
export function ProtectedRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullScreenLoader />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Páginas públicas (login/cadastro): usuário logado vai para o dashboard */
export function PublicOnlyRoute() {
  const { session, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (session) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

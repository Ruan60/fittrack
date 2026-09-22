import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { toMessage } from '@/lib/errors'
import { validateEmail } from '@/lib/validation'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErr, setFieldErr] = useState<{ email?: string; password?: string }>({})

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = { email: validateEmail(email), password: password ? undefined : 'Informe sua senha.' }
    setFieldErr(errs)
    if (errs.email || errs.password) return
    setLoading(true)
    setError(null)
    try {
      await authService.signIn(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(toMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
      <p className="mt-2 text-ink-400">Entre para continuar sua evolução.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <Input
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErr.email}
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErr.password}
        />
        {error && (
          <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" full loading={loading}>
          Entrar
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-400">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-semibold text-lime-400 hover:text-lime-300">
          Criar conta
        </Link>
      </p>
    </div>
  )
}

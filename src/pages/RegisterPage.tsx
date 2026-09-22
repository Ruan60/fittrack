import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { GOAL_OPTIONS, LEVEL_OPTIONS } from '@/lib/constants'
import { toMessage } from '@/lib/errors'
import { parseNum, validateEmail, validateName, validatePassword, validateRange } from '@/lib/validation'
import { useToast } from '@/hooks/useToast'
import type { FitnessLevel, Goal } from '@/types'

type Form = {
  name: string
  email: string
  password: string
  age: string
  height: string
  weight: string
  goal: Goal | ''
  fitness_level: FitnessLevel | ''
}
type Errors = Partial<Record<keyof Form, string>>

const initial: Form = { name: '', email: '', password: '', age: '', height: '', weight: '', goal: '', fitness_level: '' }

export function RegisterPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<Form>(initial)
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null)

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const nextStep = (e: FormEvent) => {
    e.preventDefault()
    const errs: Errors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    }
    setErrors(errs)
    if (!errs.name && !errs.email && !errs.password) setStep(2)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Errors = {
      age: validateRange(form.age, 'age', 'sua idade'),
      height: validateRange(form.height, 'height', 'sua altura'),
      weight: validateRange(form.weight, 'weight', 'seu peso'),
      goal: form.goal ? undefined : 'Escolha um objetivo.',
      fitness_level: form.fitness_level ? undefined : 'Escolha seu nível.',
    }
    setErrors(errs)
    if (Object.values(errs).some(Boolean)) return

    setLoading(true)
    setError(null)
    try {
      const res = await authService.signUp({
        name: form.name,
        email: form.email,
        password: form.password,
        age: Math.round(parseNum(form.age)),
        height: parseNum(form.height),
        weight: parseNum(form.weight),
        goal: form.goal as Goal,
        fitness_level: form.fitness_level as FitnessLevel,
      })
      if (res.needsConfirmation) {
        setConfirmEmail(form.email.trim().toLowerCase())
      } else {
        toast.success('Conta criada! Bem-vindo ao FITTRACK.')
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      const msg = toMessage(err)
      setError(msg)
      if (/e-mail/i.test(msg)) setStep(1)
    } finally {
      setLoading(false)
    }
  }

  if (confirmEmail) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400/10">
          <MailCheck className="h-7 w-7 text-lime-400" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Confirme seu e-mail</h1>
        <p className="mt-3 text-ink-400">
          Enviamos um link para <span className="font-semibold text-ink-200">{confirmEmail}</span>. Abra o e-mail e
          depois faça login.
        </p>
        <Link to="/login" className="mt-8 inline-block">
          <Button size="lg">Ir para o login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
        <span className={step === 1 ? 'text-lime-400' : ''}>1. Conta</span>
        <span className="h-px w-6 bg-ink-700" />
        <span className={step === 2 ? 'text-lime-400' : ''}>2. Seu perfil</span>
      </div>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
        {step === 1 ? 'Crie sua conta' : 'Conte sobre você'}
      </h1>
      <p className="mt-2 text-ink-400">
        {step === 1 ? 'Leva menos de um minuto.' : 'Usamos isso para recomendar seus treinos.'}
      </p>

      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {step === 1 ? (
        <form onSubmit={nextStep} className="mt-8 space-y-4" noValidate>
          <Input label="Nome" name="name" autoComplete="name" placeholder="Seu nome" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
          <Input label="E-mail" name="email" type="email" autoComplete="email" placeholder="voce@email.com" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
          <Input label="Senha" name="password" type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => set('password', e.target.value)} error={errors.password} />
          <Button type="submit" size="lg" full>
            Continuar
          </Button>
        </form>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Idade" name="age" inputMode="numeric" placeholder="25" suffix="anos" value={form.age} onChange={(e) => set('age', e.target.value)} error={errors.age} />
            <Input label="Altura" name="height" inputMode="decimal" placeholder="175" suffix="cm" value={form.height} onChange={(e) => set('height', e.target.value)} error={errors.height} />
            <Input label="Peso" name="weight" inputMode="decimal" placeholder="72" suffix="kg" value={form.weight} onChange={(e) => set('weight', e.target.value)} error={errors.weight} />
          </div>
          <Select label="Objetivo" name="goal" placeholder="Selecione" options={GOAL_OPTIONS} value={form.goal} onChange={(e) => set('goal', e.target.value as Goal)} error={errors.goal} />
          <Select label="Nível de treino" name="fitness_level" placeholder="Selecione" options={LEVEL_OPTIONS} value={form.fitness_level} onChange={(e) => set('fitness_level', e.target.value as FitnessLevel)} error={errors.fitness_level} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)} aria-label="Voltar">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button type="submit" size="lg" full loading={loading}>
              Criar conta
            </Button>
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-ink-400">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-lime-400 hover:text-lime-300">
          Entrar
        </Link>
      </p>
    </div>
  )
}

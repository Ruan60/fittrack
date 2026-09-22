import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Camera, Dumbbell, Flame, Zap } from 'lucide-react'
import { useAppData } from '@/hooks/useAppData'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { profileService } from '@/services/profileService'
import { avatarService } from '@/services/avatarService'
import { GOAL_OPTIONS, LEVEL_OPTIONS } from '@/lib/constants'
import { levelProgress, levelTitle } from '@/lib/level'
import { formatNumber } from '@/lib/format'
import { toMessage } from '@/lib/errors'
import { parseNum, validateName, validateRange } from '@/lib/validation'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { Avatar } from '@/components/Avatar'
import { StatCard } from '@/components/StatCard'
import type { FitnessLevel, Goal, Profile } from '@/types'

type Form = { name: string; age: string; height: string; weight: string; goal: Goal | ''; fitness_level: FitnessLevel }
type Errors = Partial<Record<keyof Form, string>>

const toForm = (p: Profile): Form => ({
  name: p.name,
  age: p.age?.toString() ?? '',
  height: p.height?.toString() ?? '',
  weight: p.weight?.toString() ?? '',
  goal: p.goal ?? '',
  fitness_level: p.fitness_level,
})

export function ProfilePage() {
  const { profile, stats, loading, error, refresh, setProfile } = useAppData()
  const { user } = useAuth()
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<Form | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (profile && !form) setForm(toForm(profile))
  }, [profile, form])

  if (loading || (profile && !form))
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-40" />
        <Skeleton className="h-80" />
      </div>
    )
  if (error || !profile || !stats || !form) return <ErrorState message={error ?? 'Perfil não encontrado.'} onRetry={refresh} />

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => (f ? { ...f, [k]: v } : f))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(profile))

  const save = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Errors = {
      name: validateName(form.name),
      age: validateRange(form.age, 'age', 'sua idade'),
      height: validateRange(form.height, 'height', 'sua altura'),
      weight: validateRange(form.weight, 'weight', 'seu peso'),
      goal: form.goal ? undefined : 'Escolha um objetivo.',
    }
    setErrors(errs)
    if (Object.values(errs).some(Boolean)) return
    setSaving(true)
    try {
      const updated = await profileService.update(profile.id, {
        name: form.name.trim(),
        age: Math.round(parseNum(form.age)),
        height: parseNum(form.height),
        weight: parseNum(form.weight),
        goal: form.goal as Goal,
        fitness_level: form.fitness_level,
      })
      setProfile(updated)
      setForm(toForm(updated))
      toast.success('Perfil atualizado.')
    } catch (err) {
      toast.error(toMessage(err, 'Não foi possível salvar o perfil.'))
    } finally {
      setSaving(false)
    }
  }

  const onAvatar = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await avatarService.upload(profile.id, file)
      const updated = await profileService.update(profile.id, { avatar_url: url })
      setProfile(updated)
      toast.success('Foto atualizada.')
    } catch (err) {
      toast.error(toMessage(err, 'Não foi possível enviar a foto. Verifique se o bucket "avatars" existe.'))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const lp = levelProgress(stats.xp)
  const bmi = profile.height && profile.weight ? profile.weight / (profile.height / 100) ** 2 : null

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Conta" title="Perfil" />

      <Card className="flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:text-left">
        <div className="relative">
          <Avatar name={profile.name} url={profile.avatar_url} size="lg" />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-ink-900 bg-lime-400 text-ink-950 transition-colors hover:bg-lime-300 disabled:opacity-60"
            aria-label="Alterar foto"
          >
            <Camera className={`h-4 w-4 ${uploading ? 'animate-pulse' : ''}`} />
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onAvatar(e.target.files?.[0])} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-2xl font-bold tracking-tight">{profile.name}</h2>
          <p className="truncate text-sm text-ink-500">{user?.email}</p>
          <p className="mt-2 text-sm text-ink-300">
            Nível {lp.level} · <span className="text-lime-400">{levelTitle(lp.level)}</span>
            {bmi && <span className="text-ink-500"> · IMC {bmi.toFixed(1)}</span>}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Zap className="h-4 w-4" />} label="XP" value={formatNumber(stats.xp)} />
        <StatCard icon={<Dumbbell className="h-4 w-4" />} label="Treinos" value={stats.total_workouts} />
        <StatCard icon={<Flame className="h-4 w-4" />} label="Sequência" value={stats.streak_days} sub={stats.streak_days === 1 ? 'dia' : 'dias'} />
      </div>

      <Card className="p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold">Dados pessoais</h2>
        <p className="text-sm text-ink-500">Usados para recomendar seus treinos.</p>
        <form onSubmit={save} className="mt-6 space-y-4" noValidate>
          <Input label="Nome" name="name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Idade" name="age" inputMode="numeric" suffix="anos" value={form.age} onChange={(e) => set('age', e.target.value)} error={errors.age} />
            <Input label="Altura" name="height" inputMode="decimal" suffix="cm" value={form.height} onChange={(e) => set('height', e.target.value)} error={errors.height} />
            <Input label="Peso" name="weight" inputMode="decimal" suffix="kg" value={form.weight} onChange={(e) => set('weight', e.target.value)} error={errors.weight} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Objetivo" name="goal" placeholder="Selecione" options={GOAL_OPTIONS} value={form.goal} onChange={(e) => set('goal', e.target.value as Goal)} error={errors.goal} />
            <Select label="Nível de treino" name="fitness_level" options={LEVEL_OPTIONS} value={form.fitness_level} onChange={(e) => set('fitness_level', e.target.value as FitnessLevel)} />
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            {dirty && (
              <Button type="button" variant="ghost" onClick={() => { setForm(toForm(profile)); setErrors({}) }}>
                Descartar
              </Button>
            )}
            <Button type="submit" loading={saving} disabled={!dirty}>
              Salvar alterações
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

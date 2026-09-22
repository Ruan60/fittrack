import { Logo } from '@/components/Logo'

/** Exibida quando VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não estão configuradas */
export function SetupRequiredPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-950 px-5 text-ink-100">
      <div className="w-full max-w-lg rounded-2xl border border-ink-800 bg-ink-900 p-7">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-bold">Configuração pendente</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-400">
          As variáveis de ambiente do Supabase não foram encontradas. Configure-as e gere o build novamente.
        </p>
        <pre className="mt-5 overflow-x-auto rounded-xl bg-ink-950 p-4 text-xs leading-relaxed text-lime-300">
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...`}
        </pre>
        <ul className="mt-5 space-y-1.5 text-sm text-ink-400">
          <li>• Local: crie o arquivo <code className="text-ink-200">.env.local</code> e reinicie o <code className="text-ink-200">npm run dev</code>.</li>
          <li>• Vercel: Settings → Environment Variables, depois faça um novo deploy.</li>
        </ul>
      </div>
    </div>
  )
}

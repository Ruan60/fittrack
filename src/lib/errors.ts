const MAP: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
  [/user already registered|already been registered/i, 'Este e-mail já está cadastrado. Tente fazer login.'],
  [/email not confirmed/i, 'Confirme seu e-mail pelo link enviado antes de entrar.'],
  [/password should be at least/i, 'A senha deve ter pelo menos 6 caracteres.'],
  [/unable to validate email|invalid email|email address .* is invalid/i, 'Informe um e-mail válido.'],
  [/rate limit|too many requests|security purposes/i, 'Muitas tentativas. Aguarde alguns instantes e tente novamente.'],
  [/failed to fetch|network|load failed/i, 'Não foi possível conectar ao servidor. Verifique sua internet.'],
  [/jwt|not authenticated|não autenticado/i, 'Sua sessão expirou. Entre novamente.'],
  [/row-level security|permission denied/i, 'Você não tem permissão para esta ação.'],
]

export function toMessage(err: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  const raw =
    typeof err === 'string'
      ? err
      : err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : ''
  if (!raw) return fallback
  for (const [re, msg] of MAP) if (re.test(raw)) return msg
  // Mensagens das nossas funções SQL já estão em português
  if (/[ãçéêíóôú]/i.test(raw)) return raw
  return fallback
}

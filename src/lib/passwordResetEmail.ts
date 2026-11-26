// Server-only password recovery delivery. No public environment variables or fallback sends.
type Message = { to: string; subject: string; text: string }
type Config = { provider: 'smtp2go' | 'resend'; key: string; from: string; origin: string }

export function passwordResetConfig(env: NodeJS.ProcessEnv = process.env): Config | null {
  const provider = env.PASSWORD_RESET_EMAIL_PROVIDER
  const key = (provider === 'smtp2go' ? env.SMTP2GO_API_KEY : provider === 'resend' ? env.RESEND_API_KEY : '')?.trim()
  const from = env.PASSWORD_RESET_FROM_EMAIL?.trim()
  if ((provider !== 'smtp2go' && provider !== 'resend') || !key || !from || !env.PASSWORD_RESET_BASE_URL) return null
  try {
    const url = new URL(env.PASSWORD_RESET_BASE_URL)
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null
    if (env.MEETOPIA_DEPLOY_ENV === 'staging' && !/^meetopia-stage-web(?:-[a-z0-9]+)?\.onrender\.com$|^meetopia-staging\.netlify\.app$/i.test(url.hostname)) return null
    if (env.MEETOPIA_DEPLOY_ENV !== 'staging' && /(?:^meetopia-stage-web|^meetopia-staging\.)/i.test(url.hostname)) return null
    return { provider, key, from, origin: url.origin }
  } catch { return null }
}

export async function sendPasswordResetEmail(config: Config, message: Message, transport: typeof fetch = fetch): Promise<boolean> {
  const common = { to: [message.to], subject: message.subject }
  const smtp = config.provider === 'smtp2go'
  try {
    const response = await transport(smtp ? 'https://api.smtp2go.com/v3/email/send' : 'https://api.resend.com/emails', {
      method: 'POST', redirect: 'error', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...(smtp ? { 'X-Smtp2go-Api-Key': config.key } : { Authorization: 'Bearer ' + config.key }) },
      body: JSON.stringify(smtp ? { ...common, sender: config.from, text_body: message.text } : { ...common, from: config.from, text: message.text }),
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) return false
    const data = await response.json()
    return smtp ? data?.data?.succeeded === 1 && data?.data?.failed === 0 : typeof data?.id === 'string' && data.id.length > 0
  } catch { return false }
}

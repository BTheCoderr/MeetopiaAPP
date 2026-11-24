export function getSocketUrl(): string | null {
  const configured = process.env.NEXT_PUBLIC_SOCKET_URL?.trim()
  return configured || (process.env.NODE_ENV === 'development' ? 'http://localhost:3003' : null)
}

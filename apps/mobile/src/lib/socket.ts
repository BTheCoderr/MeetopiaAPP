import { io, Socket } from 'socket.io-client'
import { getSocketUrl } from './iceServers'
import { api } from './api'

const LOG = '[Mobile:Socket.io]'
let socket: Socket | null = null
let connecting: Promise<Socket> | null = null

async function fetchSocketToken(): Promise<string> {
  const data = await api<{ token: string }>('/api/auth/socket-token', { method: 'GET' })
  if (!data.token) throw new Error('Meetopia video authentication is unavailable right now.')
  return data.token
}

export async function getAuthenticatedSocket(): Promise<Socket> {
  if (socket?.connected) return socket
  if (connecting) return connecting
  connecting = (async () => {
    const token = await fetchSocketToken(), url = getSocketUrl()
    console.log(LOG, 'socket URL', url)
    socket?.removeAllListeners(); socket?.disconnect()
    socket = io(url, { transports: ['polling','websocket'], reconnectionAttempts: 5, reconnectionDelay: 1000, timeout: 10000, auth: { token } })
    socket.on('connect', () => { const transport = socket?.io.engine?.transport?.name ?? 'unknown'; console.log(LOG, 'connected', socket?.id, 'transport', transport); socket?.io.engine?.on('upgrade', nextTransport => console.log(LOG, 'transport upgraded to', nextTransport.name)) })
    socket.on('connect_error', err => console.error(LOG, 'connect_error', err.message))
    return socket
  })()
  try { return await connecting } finally { connecting = null }
}

// Temporary compatibility shim for legacy modules that are no longer used by the
// current Chemistry Check screen. Remove with the final legacy-code deletion.
export function getSocket(): Socket {
  if (!socket) {
    socket = io(getSocketUrl(), { autoConnect: false, transports: ['polling','websocket'] })
  }
  return socket
}

export function getCurrentSocket(): Socket | null { return socket }
export function disconnectSocket(): void { if (socket) { console.log(LOG, 'disconnecting'); socket.removeAllListeners(); socket.disconnect(); socket = null } connecting = null }

import { io } from 'socket.io-client'

const socketUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://meetopia-signaling-v2.onrender.com'
    : process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003'
console.log('[Socket.io]', 'socket URL', socketUrl)

export const socket = io(socketUrl, {
  transports: ['polling', 'websocket'],
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000,
})

socket.on('connect', () => {
  const transport = socket.io.engine?.transport?.name ?? 'unknown'
  console.log('[Socket.io]', 'connected', socket.id, 'transport', transport)
})

socket.on('connect_error', (err) => {
  console.error('[Socket.io]', 'connect_error', err.message)
}) 
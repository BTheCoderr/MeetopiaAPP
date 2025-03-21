import { io } from 'socket.io-client'

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003', {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
}) 
import { io, Socket } from 'socket.io-client'
import { getSocketUrl } from './iceServers'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getSocketUrl(), {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    })
  }
  return socket
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}

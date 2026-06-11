import { io, Socket } from 'socket.io-client'
import { getSocketUrl } from './iceServers'

const LOG = '[Mobile:Socket.io]'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    const url = getSocketUrl()
    console.log(LOG, 'socket URL', url)

    socket = io(url, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    })

    socket.on('connect', () => {
      const transport = socket?.io.engine?.transport?.name ?? 'unknown'
      console.log(LOG, 'connected', socket?.id, 'transport', transport)

      socket?.io.engine?.on('upgrade', (transport) => {
        console.log(LOG, 'transport upgraded to', transport.name)
      })
    })

    socket.on('connect_error', (err) => {
      console.error(LOG, 'connect_error', err.message)
    })
  }

  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    console.log(LOG, 'disconnecting')
    socket.disconnect()
    socket = null
  }
}

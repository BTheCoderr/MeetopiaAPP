import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { io } from 'socket.io-client'

export const initSocketServer = (server: NetServer) => {
  const io = new SocketIOServer(server)

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-room', ({ roomId, userId }) => {
      socket.join(roomId)
      socket.to(roomId).emit('user-connected', userId)
    })

    socket.on('offer', (offer) => {
      socket.broadcast.emit('offer', offer)
    })

    socket.on('answer', (answer) => {
      socket.broadcast.emit('answer', answer)
    })

    socket.on('ice-candidate', (candidate) => {
      socket.broadcast.emit('ice-candidate', candidate)
    })

    socket.on('chat-message', ({ roomId, userId, message }) => {
      io.to(roomId).emit('chat-message', {
        text: message,
        sender: userId,
        timestamp: Date.now()
      })
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
}

export const socket = io('your-signaling-server-url') 
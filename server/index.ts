import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
})

// Track connected clients
const connectedClients = new Map()
const waitingUsers = new Set()

// Debug function
const debugState = () => {
  console.log('Current state:')
  console.log('Connected clients:', Array.from(connectedClients.keys()))
  console.log('Waiting users:', Array.from(waitingUsers))
}

io.on('connection', (socket) => {
  console.log('\n=== New Connection ===')
  console.log('Client connected:', socket.id)
  connectedClients.set(socket.id, socket)
  debugState()

  socket.on('disconnect', () => {
    console.log('\n=== Disconnection ===')
    console.log('Client disconnected:', socket.id)
    connectedClients.delete(socket.id)
    waitingUsers.delete(socket.id)
    debugState()
  })

  socket.on('find-next-user', () => {
    console.log('\n=== Finding Match ===')
    console.log('Request from:', socket.id)
    
    // Remove from waiting if they were waiting
    waitingUsers.delete(socket.id)
    
    // Find a waiting user
    const nextUser = Array.from(waitingUsers)[0]
    
    if (nextUser) {
      console.log('Match found! Connecting:', socket.id, 'with', nextUser)
      waitingUsers.delete(nextUser)
      
      // Tell both users about each other
      socket.emit('user-found', { partnerId: nextUser })
      io.to(String(nextUser)).emit('user-found', { partnerId: socket.id })
    } else {
      console.log('No match found. Adding to waiting list:', socket.id)
      waitingUsers.add(socket.id)
    }
    
    debugState()
  })

  socket.on('call-user', ({ offer, to }) => {
    console.log('Call request from:', socket.id, 'to:', to)
    if (to) {
      io.to(String(to)).emit('call-made', { 
        offer, 
        from: socket.id 
      })
    }
  })

  socket.on('make-answer', ({ answer, to }) => {
    io.to(to).emit('answer-made', { answer, from: socket.id })
  })

  socket.on('ice-candidate', ({ candidate, to }) => {
    console.log('Forwarding ICE candidate to:', to)
    io.to(String(to)).emit('ice-candidate', { candidate, from: socket.id })
  })

  socket.on('leave-chat', () => {
    waitingUsers.delete(socket.id)
    // Notify any connected peer
    Array.from(connectedClients.keys()).forEach(clientId => {
      if (clientId !== socket.id) {
        io.to(clientId).emit('peer-left', { peerId: socket.id })
      }
    })
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`)
})

// Add this after app initialization
app.get('/debug-env', (_req, res) => {
  res.json({
    cors: process.env.CORS_ORIGIN,
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT
  })
})

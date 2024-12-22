import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Get directory name in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load environment variables
dotenv.config()

const app = express()

// Enhanced CORS configuration
const PORT = process.env.PORT || process.env.SIGNAL_PORT || 3001
const CORS_ORIGINS = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000']

console.log('Allowed Origins:', CORS_ORIGINS)

// Create HTTP server first
const httpServer = createServer(app)

// Socket.IO setup with enhanced configuration
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000
})

// Add CORS middleware for Express
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

// Debug endpoint
app.get('/debug-env', (_req, res) => {
  res.json({
    allowedOrigins: CORS_ORIGINS,
    environment: process.env.NODE_ENV,
    port: PORT,
    currentTime: new Date().toISOString()
  })
})

// Add connection logging
io.engine.on("connection_error", (err) => {
  console.log('Connection Error:', err)
})

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')))

// Root route now serves index.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
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

httpServer.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`)
})

// Enhanced error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})

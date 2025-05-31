import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'

// Simple logging utility for server
const isDev = process.env.NODE_ENV !== 'production'

const logger = {
  info: (message: string, data?: any) => {
    if (isDev || process.env.LOG_LEVEL === 'verbose') {
      console.log(`[INFO] ${message}`, data || '')
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '')
  },
  error: (message: string, data?: any) => {
    console.error(`[ERROR] ${message}`, data || '')
  },
  debug: (message: string, data?: any) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, data || '')
    }
  }
}

const app = express()
const httpServer = createServer(app)

const PORT = process.env.PORT || 3003
const CORS_ORIGINS = process.env.CORS_ORIGINS ? 
  process.env.CORS_ORIGINS.split(',') : 
  [
    'https://meetopia-qpqrimjnj-bthecoders-projects.vercel.app',
    'https://meetopia-app.vercel.app', 
    'https://meetopia-signaling.onrender.com',
    'http://localhost:3000',
    'http://localhost:3003'
  ]

logger.info('Server starting with configuration:', {
  PORT,
  CORS_ORIGINS,
  NODE_ENV: process.env.NODE_ENV,
  currentDirectory: process.cwd()
})

// CORS configuration
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}))

// JSON parsing middleware
app.use(express.json())

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGINS,
    credentials: true
  }
})

// Data structures
const waitingUsers = new Map<string, any>()
const activeConnections = new Map<string, string>()

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: 'Meetopia Signaling Server', 
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

// Status endpoint for monitoring
app.get('/status', (req, res) => {
  const status = {
    server: 'Meetopia Signaling Server',
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: {
      total: io.engine.clientsCount,
      waiting: waitingUsers.size,
      active: activeConnections.size / 2
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  }
  
  logger.info('Status check requested', status)
  res.json(status)
})

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id, totalClients: io.engine.clientsCount })

  // Handle finding a match
  socket.on('find-match', () => {
    logger.debug('User looking for match', { socketId: socket.id })
    
    if (waitingUsers.size > 0) {
      // Find a waiting user
      const waitingEntries = Array.from(waitingUsers.entries())
      const [waitingUserId, waitingUserSocket] = waitingEntries[0]
      waitingUsers.delete(waitingUserId)
      
      // Create connection between users
      activeConnections.set(socket.id, waitingUserId)
      activeConnections.set(waitingUserId, socket.id)
      
      logger.info('Match found! Connecting users', { 
        user1: socket.id, 
        user2: waitingUserId,
        activeConnections: activeConnections.size / 2
      })
      
      // Notify both users
      socket.emit('match-found', { peerId: waitingUserId })
      waitingUserSocket.emit('match-found', { peerId: socket.id })
    } else {
      // Add user to waiting list
      waitingUsers.set(socket.id, socket)
      logger.debug('User added to waiting list', { 
        socketId: socket.id, 
        waitingCount: waitingUsers.size 
      })
      socket.emit('waiting')
    }
  })

  // Handle finding next user
  socket.on('find-next-user', () => {
    logger.debug('User looking for next match', { socketId: socket.id })
    
    // Clean up current connection
    const currentPeer = activeConnections.get(socket.id)
    if (currentPeer) {
      activeConnections.delete(socket.id)
      activeConnections.delete(currentPeer)
      
      // Notify the other user that this user disconnected
      socket.to(currentPeer).emit('user-disconnected')
      logger.debug('Notified peer of disconnection', { 
        disconnectedUser: socket.id, 
        notifiedUser: currentPeer 
      })
    }
    
    // Find a new match
    if (waitingUsers.size > 0) {
      const waitingEntries = Array.from(waitingUsers.entries())
      const [waitingUserId, waitingUserSocket] = waitingEntries[0]
      waitingUsers.delete(waitingUserId)
      
      activeConnections.set(socket.id, waitingUserId)
      activeConnections.set(waitingUserId, socket.id)
      
      logger.info('Next match found! Connecting users', { 
        user1: socket.id, 
        user2: waitingUserId 
      })
      
      socket.emit('match-found', { peerId: waitingUserId })
      waitingUserSocket.emit('match-found', { peerId: socket.id })
    } else {
      waitingUsers.set(socket.id, socket)
      logger.debug('User added to waiting list for next match', { 
        socketId: socket.id, 
        waitingCount: waitingUsers.size 
      })
      socket.emit('waiting')
    }
  })

  // WebRTC signaling
  socket.on('offer', (offer) => {
    const peerId = activeConnections.get(socket.id)
    if (peerId) {
      logger.debug('Forwarding WebRTC offer', { from: socket.id, to: peerId })
      socket.to(peerId).emit('offer', offer)
    } else {
      logger.warn('Received offer but no active connection found', { socketId: socket.id })
    }
  })

  socket.on('answer', (answer) => {
    const peerId = activeConnections.get(socket.id)
    if (peerId) {
      logger.debug('Forwarding WebRTC answer', { from: socket.id, to: peerId })
      socket.to(peerId).emit('answer', answer)
    } else {
      logger.warn('Received answer but no active connection found', { socketId: socket.id })
    }
  })

  socket.on('ice-candidate', (candidate) => {
    const peerId = activeConnections.get(socket.id)
    if (peerId) {
      logger.debug('Forwarding ICE candidate', { from: socket.id, to: peerId })
      socket.to(peerId).emit('ice-candidate', candidate)
    } else {
      logger.warn('Received ICE candidate but no active connection found', { socketId: socket.id })
    }
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info('Client disconnected', { 
      socketId: socket.id, 
      remainingClients: io.engine.clientsCount - 1 
    })
    
    // Remove from waiting users
    waitingUsers.delete(socket.id)
    
    // Handle active connection cleanup
    const peerId = activeConnections.get(socket.id)
    if (peerId) {
      activeConnections.delete(socket.id)
      activeConnections.delete(peerId)
      
      // Notify peer of disconnection
      socket.to(peerId).emit('user-disconnected')
      logger.debug('Cleaned up active connection and notified peer', { 
        disconnectedUser: socket.id, 
        notifiedUser: peerId 
      })
    }
  })
})

// Error handling
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack })
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise })
})

// Start server
httpServer.listen(PORT, () => {
  logger.info(`Meetopia Signaling Server running on port ${PORT}`)
})

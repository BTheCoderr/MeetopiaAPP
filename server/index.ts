import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config()

const app = express()

// Enhanced CORS configuration
const PORT = process.env.SIGNAL_PORT || 3003
const CORS_ORIGINS = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
  'https://meetopia-app.vercel.app',
  'https://meetopia-signaling.onrender.com',
  'http://localhost:3002'
]

console.log('Server starting with configuration:')
console.log('PORT:', PORT)
console.log('CORS_ORIGINS:', CORS_ORIGINS)
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('Current directory:', __dirname)

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
    currentTime: new Date().toISOString(),
    currentDir: __dirname
  })
})

// Add connection logging
io.engine.on("connection_error", (err) => {
  console.log('Connection Error:', err)
})

// Serve static files from public directory
const publicPath = path.join(__dirname, 'public')
app.use(express.static(publicPath))

// Root route now serves index.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'))
})

// Track connected clients and their status
const connectedClients = new Map()
const waitingUsers = new Set()
const activeConnections = new Map() // Track who is connected to whom
const videoStreams = new Map() // Track active video streams
const videoWaitingUsers = new Set() // Track users waiting for video matches
const userIPs = new Map() // Track user IPs to prevent self-matching

// Debug function with enhanced information
const debugState = () => {
  console.log('\n=== Current State ===')
  console.log('Connected clients:', Array.from(connectedClients.keys()))
  console.log('Waiting users:', Array.from(waitingUsers))
  console.log('Video waiting users:', Array.from(videoWaitingUsers))
  console.log('Active connections:', Array.from(activeConnections.entries()))
  console.log('Active video streams:', Array.from(videoStreams.keys()))
  console.log('==================\n')
}

// Keep track of user pairs
const userPairs = new Map<string, string>()

io.on('connection', (socket) => {
  console.log('\n=== New Connection ===')
  console.log('Client connected:', socket.id)
  
  // Store client IP
  const clientIP = socket.handshake.address
  userIPs.set(socket.id, clientIP)
  
  connectedClients.set(socket.id, {
    socket,
    status: 'available',
    lastActivity: Date.now(),
    ip: clientIP
  })
  debugState()

  socket.on('find-video-user', () => {
    console.log('\n=== Finding Video Match ===')
    console.log('Request from:', socket.id)
    
    // Clean up existing connection first
    const currentPeer = activeConnections.get(socket.id)
    if (currentPeer) {
      console.log('Cleaning up existing connection with:', currentPeer)
      // Notify current peer they're being moved to next
      io.to(currentPeer).emit('move-to-next')
      io.to(currentPeer).emit('peer-left', { peerId: socket.id })
      
      // Clean up both users
      activeConnections.delete(currentPeer)
      activeConnections.delete(socket.id)
      videoStreams.delete(socket.id)
      videoStreams.delete(currentPeer)
    }
    
    // Remove from waiting list if already there
    videoWaitingUsers.delete(socket.id)
    
    // Find an available user who:
    // 1. Isn't the requester
    // 2. Isn't in an active connection
    // 3. Isn't from the same IP (to prevent self-matching)
    const currentIP = userIPs.get(socket.id)
    const availableUsers = Array.from(videoWaitingUsers).filter(userId => {
      const userIP = userIPs.get(userId)
      const userSocket = io.sockets.sockets.get(userId as string)
      return userId !== socket.id && 
             !activeConnections.has(userId) && 
             userIP !== currentIP &&
             userSocket?.connected // Make sure the user is still connected
    })
    
    console.log('Available users:', availableUsers)
    
    if (availableUsers.length > 0) {
      const nextUser = availableUsers[0]
      console.log('Video match found! Connecting:', socket.id, 'with', nextUser)
      
      // Remove both users from waiting list
      videoWaitingUsers.delete(nextUser)
      videoWaitingUsers.delete(socket.id)
      
      // Record the connection
      activeConnections.set(socket.id, nextUser)
      activeConnections.set(nextUser, socket.id)
      
      // Tell both users about each other
      socket.emit('video-user-found', { partnerId: nextUser })
      io.to(String(nextUser)).emit('video-user-found', { partnerId: socket.id })
    } else {
      console.log('No video match found. Adding to video waiting list:', socket.id)
      videoWaitingUsers.add(socket.id)
      socket.emit('waiting-for-match')
    }
    
    debugState()
  })

  socket.on('video-ready', () => {
    console.log('\n=== Video Ready ===')
    console.log('User ready for video:', socket.id)
    
    const peerId = activeConnections.get(socket.id)
    if (!peerId) {
      console.log('No peer found for video ready signal')
      return
    }
    
    videoStreams.set(socket.id, true)
    console.log('Checking if peer is ready for video:', peerId)
    
    if (videoStreams.get(peerId)) {
      // Both peers are ready for video
      console.log('Both peers ready, initiating video chat')
      socket.emit('start-video-chat', { peerId })
      io.to(String(peerId)).emit('start-video-chat', { peerId: socket.id })
    } else {
      console.log('Waiting for peer to be ready')
      io.to(String(peerId)).emit('peer-video-ready', { peerId: socket.id })
    }
  })

  socket.on('leave-video', () => {
    console.log('\n=== Leave Video ===')
    console.log('User leaving video:', socket.id)
    
    videoWaitingUsers.delete(socket.id)
    videoStreams.delete(socket.id)
    const peerId = activeConnections.get(socket.id)
    
    if (peerId) {
      activeConnections.delete(peerId)
      activeConnections.delete(socket.id)
      videoStreams.delete(peerId)
      io.to(String(peerId)).emit('peer-left', { peerId: socket.id })
    }
    
    debugState()
  })

  socket.on('disconnect', () => {
    console.log('\n=== Disconnection ===')
    console.log('Client disconnected:', socket.id)
    
    // Clean up all references
    waitingUsers.delete(socket.id)
    videoWaitingUsers.delete(socket.id)
    connectedClients.delete(socket.id)
    videoStreams.delete(socket.id)
    userIPs.delete(socket.id)
    
    // Notify peer if they were in an active connection
    const peerId = activeConnections.get(socket.id)
    if (peerId) {
      io.to(String(peerId)).emit('peer-left', { peerId: socket.id })
      activeConnections.delete(peerId)
      activeConnections.delete(socket.id)
      videoStreams.delete(peerId)
    }
    
    debugState()
  })

  socket.on('video-offer', ({ offer, to }) => {
    console.log('\n=== Video Offer ===')
    console.log('From:', socket.id, 'To:', to)
    
    if (to && activeConnections.get(socket.id) === to && videoStreams.get(to)) {
      console.log('Valid video offer, forwarding')
      io.to(String(to)).emit('video-offer-received', {
        offer,
        from: socket.id
      })
    } else {
      console.log('Invalid video offer - peer not ready or not matched')
      socket.emit('video-error', { message: 'Peer not ready for video' })
    }
  })

  socket.on('video-answer', ({ answer, to }) => {
    console.log('\n=== Video Answer ===')
    console.log('From:', socket.id, 'To:', to)
    
    if (to && activeConnections.get(socket.id) === to && videoStreams.get(to)) {
      console.log('Valid video answer, forwarding')
      io.to(String(to)).emit('video-answer-received', {
        answer,
        from: socket.id
      })
    } else {
      console.log('Invalid video answer - peer not ready or not matched')
    }
  })

  socket.on('video-ice-candidate', ({ candidate, to }) => {
    console.log('\n=== Video ICE Candidate ===')
    console.log('From:', socket.id, 'To:', to)
    
    if (to && activeConnections.get(socket.id) === to && videoStreams.get(to)) {
      console.log('Valid video ICE candidate, forwarding')
      io.to(String(to)).emit('video-ice-candidate', {
        candidate,
        from: socket.id
      })
    } else {
      console.log('Invalid ICE candidate - peer not ready or not matched')
    }
  })

  socket.on('stop-video', () => {
    console.log('\n=== Stop Video ===')
    console.log('User stopping video:', socket.id)
    
    videoStreams.delete(socket.id)
    const peerId = activeConnections.get(socket.id)
    if (peerId) {
      io.to(peerId).emit('peer-video-stopped', { peerId: socket.id })
    }
  })

  socket.on('find-next-user', () => {
    const currentPair = userPairs.get(socket.id)
    if (currentPair) {
      // Notify the current pair that we're moving on
      io.to(currentPair).emit('partner-next')
      // Clear the current pairing
      userPairs.delete(socket.id)
      userPairs.delete(currentPair)
    }

    // Find a new user who is also looking
    const waitingUsers = Array.from(io.sockets.sockets.values())
      .filter(s => s.id !== socket.id && !userPairs.has(s.id))
    
    if (waitingUsers.length > 0) {
      const randomUser = waitingUsers[Math.floor(Math.random() * waitingUsers.length)]
      // Store the pairing
      userPairs.set(socket.id, randomUser.id)
      userPairs.set(randomUser.id, socket.id)
      // Notify both users
      io.to(socket.id).emit('user-found', { partnerId: randomUser.id })
      io.to(randomUser.id).emit('user-found', { partnerId: socket.id })
    }
  })

  socket.on('call-user', ({ offer, to }) => {
    console.log('\n=== Call Request ===')
    console.log('From:', socket.id, 'To:', to)
    
    if (to && activeConnections.get(socket.id) === to) {
      console.log('Valid call request, forwarding offer')
      io.to(to).emit('call-made', { 
        offer, 
        from: socket.id 
      })
    } else {
      console.log('Invalid call request - users not properly matched')
    }
  })

  socket.on('make-answer', ({ answer, to }) => {
    console.log('\n=== Answer Made ===')
    console.log('From:', socket.id, 'To:', to)
    
    if (to && activeConnections.get(socket.id) === to) {
      console.log('Valid answer, forwarding')
      io.to(to).emit('answer-made', { answer, from: socket.id })
    } else {
      console.log('Invalid answer - users not properly matched')
    }
  })

  socket.on('ice-candidate', ({ candidate, to }) => {
    console.log('\n=== ICE Candidate ===')
    console.log('From:', socket.id, 'To:', to)
    
    if (to && activeConnections.get(socket.id) === to) {
      console.log('Valid ICE candidate, forwarding')
      io.to(to).emit('ice-candidate', { candidate, from: socket.id })
    } else {
      console.log('Invalid ICE candidate - users not properly matched')
    }
  })

  socket.on('leave-chat', () => {
    const currentPair = userPairs.get(socket.id)
    if (currentPair) {
      // Notify the partner that we're leaving
      io.to(currentPair).emit('partner-left')
      // Clear the pairing
      userPairs.delete(socket.id)
      userPairs.delete(currentPair)
    }
  })

  // Add message handling
  socket.on('chat-message', ({ message, to, messageId }) => {
    console.log('\n=== Chat Message ===')
    console.log('From:', socket.id)
    console.log('To:', to)
    console.log('Message:', message)
    
    const currentPair = userPairs.get(socket.id)
    if (currentPair) {
      // Send to paired user
      io.to(currentPair).emit('chat-message', {
        message,
        from: socket.id,
        messageId
      })
      // Confirm delivery to sender
      socket.emit('message-delivered', { messageId })
    } else {
      // If no pair, message is queued (handled client-side)
      socket.emit('message-queued', { messageId })
    }
  })

  // Add connection quality monitoring
  socket.on('connection-stats', ({ stats, to }) => {
    const currentPair = userPairs.get(socket.id)
    if (currentPair === to) {
      io.to(to).emit('connection-stats', {
        stats,
        from: socket.id
      })
    }
  })

  // Enhanced error handling
  socket.on('error', (error) => {
    console.error('\n=== Socket Error ===')
    console.error('Client:', socket.id)
    console.error('Error:', error)
    
    const currentPair = userPairs.get(socket.id)
    if (currentPair) {
      io.to(currentPair).emit('peer-error', {
        error: 'Your partner encountered an error. Attempting to reconnect...'
      })
    }
    
    // Attempt to reconnect the user
    socket.emit('reconnect-attempt')
  })

  // Add connection quality events
  socket.on('poor-connection', () => {
    const currentPair = userPairs.get(socket.id)
    if (currentPair) {
      io.to(currentPair).emit('peer-connection-poor', {
        message: 'Your partner is experiencing connection issues...'
      })
    }
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

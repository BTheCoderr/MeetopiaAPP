import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config()

const app = express()

// Enhanced CORS configuration
const PORT = process.env.PORT || 3000
const CORS_ORIGINS = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
  'https://meetopia-app.vercel.app',
  'https://meetopia-signaling.onrender.com',
  'http://localhost:3000'
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
      io.to(String(currentPeer)).emit('move-to-next')
      io.to(String(currentPeer)).emit('peer-left', { peerId: socket.id })
      
      // Clean up both users
      activeConnections.delete(currentPeer)
      activeConnections.delete(socket.id)
      videoStreams.delete(socket.id)
      videoStreams.delete(currentPeer)
      videoWaitingUsers.delete(socket.id)
      videoWaitingUsers.delete(currentPeer)
      
      // Add the peer back to waiting list if they weren't the one who clicked next
      if (currentPeer) {
        console.log('Adding previous peer back to waiting list:', currentPeer)
        videoWaitingUsers.add(currentPeer)
      }
    }
    
    // Find an available user who:
    // 1. Isn't the requester
    // 2. Isn't in an active connection
    // 3. Isn't from the same IP (to prevent self-matching)
    const currentIP = userIPs.get(socket.id)
    const availableUsers = Array.from(videoWaitingUsers).filter(userId => {
      const userIP = userIPs.get(userId)
      return userId !== socket.id && 
             !activeConnections.has(userId) && 
             userIP !== currentIP
    })
    
    console.log('Available users:', availableUsers)
    const nextUser = availableUsers[0]
    
    if (nextUser) {
      console.log('Video match found! Connecting:', socket.id, 'with', nextUser)
      videoWaitingUsers.delete(nextUser)
      videoWaitingUsers.delete(socket.id)
      
      // Record the connection
      activeConnections.set(socket.id, nextUser)
      activeConnections.set(nextUser, socket.id)
      
      // Reset video streams for new connection
      videoStreams.delete(socket.id)
      videoStreams.delete(nextUser)
      
      // Tell both users about each other and initiate video
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
    console.log('\n=== Finding Match ===')
    console.log('Request from:', socket.id)
    
    // Remove from waiting and any existing connections
    waitingUsers.delete(socket.id)
    const currentPeer = activeConnections.get(socket.id)
    if (currentPeer) {
      // Notify current peer they're being moved to next
      io.to(String(currentPeer)).emit('move-to-next')
      
      activeConnections.delete(currentPeer)
      activeConnections.delete(socket.id)
      io.to(String(currentPeer)).emit('peer-left', { peerId: socket.id })
      
      // Add the peer back to waiting list
      waitingUsers.add(currentPeer)
    }
    
    // Find an available user who isn't the requester and isn't in an active connection
    const availableUsers = Array.from(waitingUsers).filter(userId => 
      userId !== socket.id && !activeConnections.has(userId)
    )
    
    const nextUser = availableUsers[0]
    
    if (nextUser) {
      console.log('Match found! Connecting:', socket.id, 'with', nextUser)
      waitingUsers.delete(nextUser)
      
      // Record the connection
      activeConnections.set(socket.id, nextUser)
      activeConnections.set(nextUser, socket.id)
      
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
    console.log('\n=== Leave Chat ===')
    console.log('User leaving:', socket.id)
    
    waitingUsers.delete(socket.id)
    const peerId = activeConnections.get(socket.id)
    
    if (peerId) {
      activeConnections.delete(peerId)
      activeConnections.delete(socket.id)
      io.to(peerId).emit('peer-left', { peerId: socket.id })
    }
    
    debugState()
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

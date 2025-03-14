import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Load environment variables
dotenv.config()

const app = express()

// Enhanced CORS configuration
const PORT = process.env.PORT || 3003
const CORS_ORIGINS = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
  'https://meetopia-qpqrimjnj-bthecoders-projects.vercel.app',
  'https://meetopia-app.vercel.app',
  'https://meetopia-signaling.onrender.com',
  'http://localhost:3000',
  'http://localhost:3003',
  '*'  // Allow all origins for development
] as string[]

console.log('Server starting with configuration:')
console.log('PORT:', PORT)
console.log('CORS_ORIGINS:', CORS_ORIGINS)
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('Current directory:', process.cwd())

// Create HTTP server first
const httpServer = createServer(app)

// Socket.IO setup with enhanced configuration
const io = new Server(httpServer, {
  cors: {
    origin: '*',  // Allow all origins for development
    methods: ["GET", "POST", "OPTIONS"],
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
  res.setHeader('Access-Control-Allow-Origin', '*')  // Allow all origins for development
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  next()
})

// Add a route handler for the root path
app.get('/', (req, res) => {
  res.send({
    status: 'ok',
    message: 'Meetopia Signaling Server is running',
    version: '1.0.0'
  })
})

// Track connected clients and their status
const connectedClients = new Map<string, any>()
const waitingUsers = new Set<string>()
// Separate waiting queues for different modes
const regularWaitingUsers = new Set<string>()
const speedWaitingUsers = new Set<string>()
const activeConnections = new Map<string, string>() // Track who is connected to whom
const videoStreams = new Map<string, boolean>() // Track active video streams
const videoWaitingUsers = new Set<string>() // Track users waiting for video matches
const userIPs = new Map<string, string>() // Track user IPs to prevent self-matching
// Track user preferences
const userPreferences = new Map<string, { type: string, mode: string, blindDate: boolean }>()

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  console.log('Total connected clients:', io.engine.clientsCount)
  
  // Store client IP
  const clientIP = socket.handshake.address
  userIPs.set(socket.id, clientIP)
  
  // Handle room joining
  socket.on('join-room', (roomId) => {
    console.log(`User ${socket.id} joining room: ${roomId}`)
    socket.join(roomId)
    
    // Notify others in the room
    socket.to(roomId).emit('user-connected', socket.id)
    
    // Handle disconnection from room
    socket.on('disconnect', () => {
      console.log(`User ${socket.id} disconnected from room: ${roomId}`)
      socket.to(roomId).emit('user-disconnected', socket.id)
    })
  })
  
  socket.on('find-user', () => {
    console.log('User searching for match:', socket.id)
    console.log('Current waiting users:', Array.from(waitingUsers))
    
    const availableUsers = Array.from(waitingUsers)
    const match = availableUsers.find(userId => userId !== socket.id)
    
    if (match) {
      console.log('Match found:', match)
      waitingUsers.delete(match)
      // Track the connection between users
      activeConnections.set(socket.id, match)
      activeConnections.set(match, socket.id)
      socket.emit('user-found', { partnerId: match })
      io.to(match as string).emit('user-found', { partnerId: socket.id })
    } else {
      console.log('No match found, adding to waiting list:', socket.id)
      waitingUsers.add(socket.id)
    }
  })
  
  // Enhanced find-match with mode support
  socket.on('find-match', ({ type, mode, blindDate, userId }) => {
    console.log(`User ${socket.id} searching for ${mode} ${type} match with blindDate: ${blindDate}`)
    
    // Store user preferences
    userPreferences.set(socket.id, { type, mode, blindDate })
    
    // Choose the appropriate waiting queue based on mode
    const waitingQueue = mode === 'speed' ? speedWaitingUsers : regularWaitingUsers
    
    // Find a match with the same preferences
    const availableUsers = Array.from(waitingQueue)
    const match = availableUsers.find(userId => {
      // Don't match with self
      if (userId === socket.id) return false
      
      // Check if user has same preferences
      const userPref = userPreferences.get(userId)
      return userPref && userPref.type === type && userPref.mode === mode
    })
    
    if (match) {
      console.log('Match found:', match)
      waitingQueue.delete(match)
      
      // Generate a room ID
      const roomId = `room_${Date.now()}`
      
      // Track the connection between users
      activeConnections.set(socket.id, match)
      activeConnections.set(match, socket.id)
      
      // Notify both users about the match
      socket.emit('match-found', { roomId, peer: match })
      io.to(match).emit('match-found', { roomId, peer: socket.id })
    } else {
      console.log('No match found, adding to waiting list:', socket.id)
      waitingQueue.add(socket.id)
    }
  })

  // WebRTC signaling events
  socket.on('call-user', ({ offer, to }) => {
    console.log('Forwarding call offer to:', to)
    io.to(to).emit('call-made', { offer, from: socket.id })
  })

  socket.on('make-answer', ({ answer, to }) => {
    console.log('Forwarding call answer to:', to)
      io.to(to).emit('answer-made', { answer, from: socket.id })
  })

  socket.on('ice-candidate', ({ candidate, to }) => {
    console.log('Forwarding ICE candidate to:', to)
      io.to(to).emit('ice-candidate', { candidate, from: socket.id })
  })

  // Handle chat messages
  socket.on('chat-message', (messageData) => {
    console.log('Forwarding message to:', messageData.to)
    io.to(messageData.to).emit('chat-message', messageData)
  })

  socket.on('find-next-user', () => {
    console.log('User searching for next match:', socket.id)
    
    // Get user preferences
    const userPref = userPreferences.get(socket.id) || { type: 'video', mode: 'regular', blindDate: false }
    
    // Clean up previous connection if any
    const previousPeer = activeConnections.get(socket.id)
    if (previousPeer) {
      io.to(previousPeer).emit('peer-left')
      activeConnections.delete(previousPeer)
      activeConnections.delete(socket.id)
    }
    
    // Choose the appropriate waiting queue based on mode
    const waitingQueue = userPref.mode === 'speed' ? speedWaitingUsers : regularWaitingUsers
    
    // Find new match with same preferences
    const availableUsers = Array.from(waitingQueue)
    const match = availableUsers.find(userId => {
      // Don't match with self
      if (userId === socket.id) return false
      
      // Check if user has same preferences
      const matchPref = userPreferences.get(userId)
      return matchPref && matchPref.type === userPref.type && matchPref.mode === userPref.mode
    })
    
    if (match) {
      waitingQueue.delete(match)
      
      // Generate a room ID
      const roomId = `room_${Date.now()}`
      
      // Track the new connection
      activeConnections.set(socket.id, match)
      activeConnections.set(match, socket.id)
      
      // Notify both users about the match
      socket.emit('match-found', { roomId, peer: match })
      io.to(match).emit('match-found', { roomId, peer: socket.id })
    } else {
      waitingQueue.add(socket.id)
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
    waitingUsers.delete(socket.id)
    regularWaitingUsers.delete(socket.id)
    speedWaitingUsers.delete(socket.id)
    userIPs.delete(socket.id)
    userPreferences.delete(socket.id)
    
    const peer = activeConnections.get(socket.id)
    if (peer) {
      io.to(peer).emit('peer-left')
      activeConnections.delete(peer)
    }
    activeConnections.delete(socket.id)
  })
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

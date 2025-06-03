import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'
import rateLimit from 'express-rate-limit'
import crypto from 'crypto'

// Enhanced connection management interfaces
interface UserConnection {
  socketId: string
  userId: string
  joinTime: number
  lastSeen: number
  networkQuality: 'good' | 'fair' | 'poor'
  reconnectCount: number
  region?: string
}

interface ConnectionPool {
  active: Map<string, UserConnection>
  standby: Map<string, UserConnection>
  reconnecting: Map<string, UserConnection>
}

// Security and validation utilities
const validateMessage = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false
  if (text.length > 500) return false // Max message length
  // Basic XSS prevention - no HTML tags
  const htmlTagPattern = /<[^>]*>/g
  return !htmlTagPattern.test(text)
}

const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

const checkRateLimit = (socketId: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now()
  const userLimit = rateLimitMap.get(socketId)
  
  if (!userLimit || now - userLimit.lastReset > windowMs) {
    rateLimitMap.set(socketId, { count: 1, lastReset: now })
    return true
  }
  
  if (userLimit.count >= maxRequests) {
    return false
  }
  
  userLimit.count++
  return true
}

// Enhanced logging utility for server
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
const CORS_ORIGINS = [
  'https://meetopia.vercel.app',
  'https://meetopiaapp.onrender.com',
  'https://meetopia-80ipqfy65-bthecoders-projects.vercel.app',
  'https://meetopia-muc14ebpx-bthecoders-projects.vercel.app',
  'https://vercel.com',
  'https://*.vercel.app',
  'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:3003'
]

logger.info('Server starting with configuration:', {
  PORT,
  CORS_ORIGINS,
  NODE_ENV: process.env.NODE_ENV,
  currentDirectory: process.cwd()
})

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})

// CORS configuration with dynamic origin checking
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true)
    
    // Check if origin is in our allowed list
    if (CORS_ORIGINS.includes(origin)) {
      return callback(null, true)
    }
    
    // Allow any Vercel preview URLs
    if (origin.includes('vercel.app') || origin.includes('vercel.com')) {
      logger.info('Allowing Vercel preview URL:', { origin })
      return callback(null, true)
    }
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true)
    }
    
    logger.warn('CORS rejected origin:', { origin })
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

// JSON parsing middleware with size limit
app.use(express.json({ limit: '1mb' }))

// Enhanced Socket.IO configuration for robust networking
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true)
      
      // Check if origin is in our allowed list
      if (CORS_ORIGINS.includes(origin)) {
        return callback(null, true)
      }
      
      // Allow any Vercel preview URLs
      if (origin.includes('vercel.app') || origin.includes('vercel.com')) {
        logger.info('Socket.IO allowing Vercel preview URL:', { origin })
        return callback(null, true)
      }
      
      // Allow localhost for development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true)
      }
      
      logger.warn('Socket.IO CORS rejected origin:', { origin })
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true
  },
  // Enhanced transport settings for better connectivity
  transports: ['websocket', 'polling'],
  allowEIO3: true, // Allow Engine.IO v3 clients for broader compatibility
  
  // Robust connection settings
  pingTimeout: 120000, // 2 minutes - increased from 60s
  pingInterval: 25000,  // 25 seconds
  
  // Connection resilience settings
  upgradeTimeout: 30000, // 30 seconds for transport upgrade
  maxHttpBufferSize: 1e6, // 1MB limit
  
  // Enhanced connection options
  connectTimeout: 60000,  // 60 seconds connection timeout
  serveClient: false,     // Don't serve client files
  
  // Connection pooling and management
  allowUpgrades: true,
  perMessageDeflate: {
    threshold: 1024,      // Compress messages over 1KB
    concurrencyLimit: 10,
    memLevel: 7
  }
})

// Enhanced data structures with connection pooling
const connectionPool: ConnectionPool = {
  active: new Map<string, UserConnection>(),
  standby: new Map<string, UserConnection>(),
  reconnecting: new Map<string, UserConnection>()
}

const waitingUsers = new Map<string, any>()
const activeConnections = new Map<string, string>()
const connectionTimes = new Map<string, number>()
const MAX_CONNECTIONS_PER_IP = 5 // Increased from 3
const MAX_RECONNECT_ATTEMPTS = 5 // Allow more reconnection attempts

// Network quality assessment
const assessNetworkQuality = (socket: any): 'good' | 'fair' | 'poor' => {
  const latency = socket.handshake.query.latency ? parseInt(socket.handshake.query.latency as string) : 0
  
  if (latency < 100) return 'good'
  if (latency < 300) return 'fair'
  return 'poor'
}

// Connection cleanup with graceful handling
const cleanupConnection = (socketId: string, reason: string) => {
  const connection = connectionPool.active.get(socketId) || 
                    connectionPool.standby.get(socketId) || 
                    connectionPool.reconnecting.get(socketId)
  
  if (connection) {
    logger.info('Cleaning up connection', { socketId, reason, userId: connection.userId })
    
    // Remove from all pools
    connectionPool.active.delete(socketId)
    connectionPool.standby.delete(socketId)
    connectionPool.reconnecting.delete(socketId)
    
    // Clean up active connections
    const peerId = activeConnections.get(socketId)
    if (peerId) {
      activeConnections.delete(socketId)
      activeConnections.delete(peerId)
      
      // Notify peer with enhanced information
      io.to(peerId).emit('peer-disconnected', {
        reason,
        timestamp: Date.now(),
        canReconnect: reason === 'network-issue'
      })
    }
    
    // Remove from waiting users
    waitingUsers.delete(socketId)
    connectionTimes.delete(socketId)
  }
}

// Enhanced connection persistence
const moveToStandby = (socketId: string) => {
  const connection = connectionPool.active.get(socketId)
  if (connection) {
    connection.lastSeen = Date.now()
    connectionPool.standby.set(socketId, connection)
    connectionPool.active.delete(socketId)
    logger.info('Moved connection to standby', { socketId, userId: connection.userId })
  }
}

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Meetopia signaling server is running',
    timestamp: new Date().toISOString(),
    connections: {
      active: connectionPool.active.size,
      standby: connectionPool.standby.size,
      reconnecting: connectionPool.reconnecting.size,
      waiting: waitingUsers.size
    },
    uptime: process.uptime()
  })
})

// Health check endpoint for monitoring and keep-alive
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connections: connectionPool.active.size + connectionPool.standby.size,
    memory: process.memoryUsage()
  })
})

// Rate limited API endpoints
app.use('/api', apiLimiter)

// Enhanced status endpoint for monitoring
app.get('/status', (req, res) => {
  const status = {
    server: 'Meetopia Signaling Server',
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: {
      total: io.engine.clientsCount,
      active: connectionPool.active.size,
      standby: connectionPool.standby.size,
      reconnecting: connectionPool.reconnecting.size,
      waiting: waitingUsers.size,
      paired: activeConnections.size / 2
    },
    networkHealth: {
      avgLatency: Array.from(connectionPool.active.values())
        .reduce((sum, conn) => sum + (conn.networkQuality === 'good' ? 50 : conn.networkQuality === 'fair' ? 200 : 400), 0) / 
        Math.max(connectionPool.active.size, 1),
      qualityDistribution: {
        good: Array.from(connectionPool.active.values()).filter(c => c.networkQuality === 'good').length,
        fair: Array.from(connectionPool.active.values()).filter(c => c.networkQuality === 'fair').length,
        poor: Array.from(connectionPool.active.values()).filter(c => c.networkQuality === 'poor').length
      }
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  }
  
  logger.info('Status check requested', status)
  res.json(status)
})

// Periodic cleanup of stale connections
setInterval(() => {
  const now = Date.now()
  const staleTimeout = 5 * 60 * 1000 // 5 minutes
  
  // Clean up stale standby connections
  for (const [socketId, connection] of connectionPool.standby.entries()) {
    if (now - connection.lastSeen > staleTimeout) {
      logger.info('Removing stale standby connection', { socketId, userId: connection.userId })
      connectionPool.standby.delete(socketId)
    }
  }
  
  // Clean up stale reconnecting connections
  for (const [socketId, connection] of connectionPool.reconnecting.entries()) {
    if (now - connection.lastSeen > staleTimeout) {
      logger.info('Removing stale reconnecting connection', { socketId, userId: connection.userId })
      connectionPool.reconnecting.delete(socketId)
    }
  }
}, 60000) // Run every minute

// 🧹 AGGRESSIVE cleanup of stale connections every 10 seconds
setInterval(() => {
  let cleanedCount = 0
  
  // Clean up activeConnections for disconnected sockets
  const staleActiveConnections: string[] = []
  for (const [socketId, peerId] of activeConnections.entries()) {
    if (!io.sockets.sockets.get(socketId)) {
      staleActiveConnections.push(socketId)
      staleActiveConnections.push(peerId)
      cleanedCount++
    }
  }
  
  // Remove stale active connections
  for (const staleId of staleActiveConnections) {
    activeConnections.delete(staleId)
  }
  
  // Clean up waiting users for disconnected sockets
  const staleWaitingUsers: string[] = []
  for (const [socketId] of waitingUsers.entries()) {
    if (!io.sockets.sockets.get(socketId)) {
      staleWaitingUsers.push(socketId)
      cleanedCount++
    }
  }
  
  // Remove stale waiting users
  for (const staleId of staleWaitingUsers) {
    waitingUsers.delete(staleId)
  }
  
  // Clean up connection pool
  const stalePoolConnections: string[] = []
  for (const [socketId] of connectionPool.active.entries()) {
    if (!io.sockets.sockets.get(socketId)) {
      stalePoolConnections.push(socketId)
      cleanedCount++
    }
  }
  
  // Remove stale pool connections
  for (const staleId of stalePoolConnections) {
    connectionPool.active.delete(staleId)
  }
  
  if (cleanedCount > 0) {
    logger.info('🧹 AGGRESSIVE CLEANUP: Removed stale connections', {
      removedCount: cleanedCount,
      currentActive: connectionPool.active.size,
      currentWaiting: waitingUsers.size,
      currentPaired: activeConnections.size / 2
    })
  }
}, 10000) // Run every 10 seconds

// Socket.IO connection handling with enhanced resilience
io.on('connection', (socket) => {
  const networkQuality = assessNetworkQuality(socket)
  const userConnection: UserConnection = {
    socketId: socket.id,
    userId: socket.handshake.query.userId as string || socket.id,
    joinTime: Date.now(),
    lastSeen: Date.now(),
    networkQuality,
    reconnectCount: 0,
    region: socket.handshake.query.region as string
  }
  
  connectionPool.active.set(socket.id, userConnection)
  
  // Enhanced logging for debugging remote connections
  logger.info('Client connected with enhanced tracking', { 
    socketId: socket.id, 
    networkQuality,
    totalClients: io.engine.clientsCount,
    activeConnections: connectionPool.active.size,
    origin: socket.handshake.headers.origin,
    userAgent: socket.handshake.headers['user-agent'],
    remoteAddress: socket.handshake.address
  })

  // TURN credential generation
  socket.on('request-turn-credentials', () => {
    try {
      const turnSecret = process.env.TURN_SECRET || 'meetopia-default-secret'
      const username = `${Math.floor(Date.now() / 1000) + 3600}:${socket.id}`
      const credential = crypto
        .createHmac('sha1', turnSecret)
        .update(username)
        .digest('base64')
      
      logger.info('Generated TURN credentials', { 
        socketId: socket.id,
        username: username.split(':')[0] // Log timestamp only for privacy
      })
      
      socket.emit('turn-credentials', {
        username,
        credential,
        ttl: 3600,
        uris: [
          'turn:turn.meetopia.app:3478',
          'turn:turn.meetopia.app:3478?transport=tcp',
          'turns:turn.meetopia.app:5349'
        ]
      })
    } catch (error) {
      logger.error('Failed to generate TURN credentials', { 
        socketId: socket.id, 
        error: error instanceof Error ? error.message : String(error)
      })
      socket.emit('turn-credentials-error', { message: 'Failed to generate credentials' })
    }
  })
  
  // Enhanced connection monitoring
  socket.on('ping', (data, callback) => {
    const connection = connectionPool.active.get(socket.id)
    if (connection) {
      connection.lastSeen = Date.now()
    }
    
    // Respond with pong and connection info
    const pongResponse = {
      timestamp: Date.now(),
      connectionQuality: connection?.networkQuality || 'unknown',
      serverLoad: {
        activeConnections: connectionPool.active.size,
        waitingUsers: waitingUsers.size
      }
    }
    
    if (callback) {
      callback(pongResponse)
    } else {
      socket.emit('pong', pongResponse)
    }
  })
  
  // Handle user reconnection
  socket.on('reconnect-attempt', (data: { previousSocketId: string, userId: string }) => {
    logger.info('Reconnection attempt detected', { 
      newSocketId: socket.id, 
      previousSocketId: data.previousSocketId,
      userId: data.userId
    })
    
    // Try to restore previous connection state
    const previousConnection = connectionPool.standby.get(data.previousSocketId) || 
                              connectionPool.reconnecting.get(data.previousSocketId)
    
    if (previousConnection) {
      // Update connection with new socket
      const restoredConnection: UserConnection = {
        ...previousConnection,
        socketId: socket.id,
        lastSeen: Date.now(),
        reconnectCount: previousConnection.reconnectCount + 1
      }
      
      connectionPool.active.set(socket.id, restoredConnection)
      connectionPool.standby.delete(data.previousSocketId)
      connectionPool.reconnecting.delete(data.previousSocketId)
      
      // Restore active connection if it existed
      const peerId = activeConnections.get(data.previousSocketId)
      if (peerId) {
        activeConnections.delete(data.previousSocketId)
        activeConnections.set(socket.id, peerId)
        activeConnections.set(peerId, socket.id)
        
        // Notify peer of successful reconnection
        io.to(peerId).emit('peer-reconnected', {
          socketId: socket.id,
          networkQuality: restoredConnection.networkQuality
        })
        
        // Notify reconnected user
        socket.emit('reconnection-successful', {
          peerId,
          sessionRestored: true
        })
      }
      
      logger.info('Connection successfully restored', {
        socketId: socket.id,
        userId: data.userId,
        reconnectCount: restoredConnection.reconnectCount
      })
    }
  })

  // BULLETPROOF find-match with comprehensive cleanup
  socket.on('find-match', (data, callback) => {
    const connection = connectionPool.active.get(socket.id)
    if (!connection) {
      logger.warn('Find-match called but connection not found', { socketId: socket.id })
      if (callback) callback({ status: 'error', message: 'Connection not found' })
      return
    }
    
    // 🧹 FIRST: Clean up any stale connections for this user
    const currentPeer = activeConnections.get(socket.id)
    if (currentPeer) {
      logger.info('🧹 Cleaning up existing connection before new match', {
        user: socket.id,
        oldPeer: currentPeer
      })
      
      // Remove the old pairing
      activeConnections.delete(socket.id)
      activeConnections.delete(currentPeer)
      
      // Notify old peer if still connected
      if (io.sockets.sockets.get(currentPeer)) {
        io.to(currentPeer).emit('peer-disconnected', {
          reason: 'partner-searching-new',
          timestamp: Date.now()
        })
      }
    }
    
    // 🧹 SECOND: Remove from waiting list if somehow still there
    if (waitingUsers.has(socket.id)) {
      waitingUsers.delete(socket.id)
      logger.info('🧹 Removed user from waiting list before new search', { socketId: socket.id })
    }
    
    logger.info('🔍 CLEAN MATCH: User looking for match', { 
      socketId: socket.id, 
      waitingUsersCount: waitingUsers.size,
      waitingUsersList: Array.from(waitingUsers.keys()),
      activeConnectionsCount: activeConnections.size
    })
    
    // 🧹 THIRD: Validate waiting users are still connected
    const validWaitingUsers = new Map()
    for (const [waitingId, waitingSocket] of waitingUsers.entries()) {
      if (io.sockets.sockets.get(waitingId)) {
        validWaitingUsers.set(waitingId, waitingSocket)
      } else {
        logger.info('🧹 Removed stale waiting user', { staleSocketId: waitingId })
      }
    }
    waitingUsers.clear()
    for (const [id, socket] of validWaitingUsers.entries()) {
      waitingUsers.set(id, socket)
    }
    
    // NOW TRY TO MATCH with clean data
    if (waitingUsers.size > 0) {
      // Get the first waiting user
      const waitingEntry = waitingUsers.entries().next().value
      if (!waitingEntry) {
        logger.warn('Waiting users exist but could not get entry')
        return
      }
      
      const [waitingUserId, waitingUserSocket] = waitingEntry
      
      // Double-check the waiting user is still connected
      if (!io.sockets.sockets.get(waitingUserId)) {
        logger.warn('🧹 Waiting user disconnected, cleaning up', { waitingUserId })
        waitingUsers.delete(waitingUserId)
        // Try again recursively
        socket.emit('find-match', data)
        return
      }
      
      // Remove from waiting list
      waitingUsers.delete(waitingUserId)
      
      // Create connection between users
      activeConnections.set(socket.id, waitingUserId)
      activeConnections.set(waitingUserId, socket.id)
      
      logger.info('🎉 CLEAN MATCH: Connecting users!', { 
        user1: socket.id, 
        user2: waitingUserId,
        totalActiveConnections: activeConnections.size / 2,
        remainingWaiting: waitingUsers.size
      })
      
      // Send simple match data
      const matchData = { peerId: waitingUserId }
      const reverseMatchData = { peerId: socket.id }
      
      // Send acknowledgment to requesting user
      if (callback) callback({ status: 'matched', matchData })
      
      // Emit to both users
      socket.emit('match-found', matchData)
      waitingUserSocket.emit('match-found', reverseMatchData)
      
      logger.info('✅ CLEAN MATCH: Events emitted to both users')
      
    } else {
      // Add user to waiting list
      waitingUsers.set(socket.id, socket)
      
      logger.info('⏳ CLEAN MATCH: Added to waiting list', { 
        socketId: socket.id, 
        waitingCount: waitingUsers.size,
        allWaitingUsers: Array.from(waitingUsers.keys())
      })
      
      const waitingResponse = {
        position: waitingUsers.size,
        estimatedWaitTime: 5
      }
      
      // Send acknowledgment to requesting user
      if (callback) callback({ status: 'waiting', ...waitingResponse })
      
      socket.emit('waiting', waitingResponse)
    }
  })

  // Enhanced WebRTC signaling with connection monitoring
  socket.on('offer', (offer) => {
    const peerId = activeConnections.get(socket.id)
    if (peerId) {
      // Update connection activity
      const connection = connectionPool.active.get(socket.id)
      if (connection) connection.lastSeen = Date.now()
      
      logger.info('🎯 Forwarding WebRTC offer', { 
        from: socket.id, 
        to: peerId,
        offerType: offer.type,
        hasIceCandidates: offer.sdp?.includes('candidate') || false
      })
      socket.to(peerId).emit('offer', offer)
    } else {
      logger.warn('❌ Received offer but no active connection found', { socketId: socket.id })
      socket.emit('connection-error', { message: 'No active peer connection' })
    }
  })

  socket.on('answer', (answer) => {
    const peerId = activeConnections.get(socket.id)
    if (peerId) {
      // Update connection activity
      const connection = connectionPool.active.get(socket.id)
      if (connection) connection.lastSeen = Date.now()
      
      logger.info('🎯 Forwarding WebRTC answer', { 
        from: socket.id, 
        to: peerId,
        answerType: answer.type,
        hasIceCandidates: answer.sdp?.includes('candidate') || false
      })
      socket.to(peerId).emit('answer', answer)
    } else {
      logger.warn('❌ Received answer but no active connection found', { socketId: socket.id })
      socket.emit('connection-error', { message: 'No active peer connection' })
    }
  })

  socket.on('ice-candidate', (candidate) => {
    const peerId = activeConnections.get(socket.id)
    if (peerId) {
      // Update connection activity (silent for ICE candidates to avoid spam)
      const connection = connectionPool.active.get(socket.id)
      if (connection) connection.lastSeen = Date.now()
      
      // Log ICE candidates for debugging
      logger.debug('🧊 Forwarding ICE candidate', {
        from: socket.id,
        to: peerId,
        candidateType: candidate.candidate?.split(' ')[7] || 'unknown',
        protocol: candidate.candidate?.includes('udp') ? 'UDP' : 
                 candidate.candidate?.includes('tcp') ? 'TCP' : 'unknown'
      })
      
      socket.to(peerId).emit('ice-candidate', candidate)
    } else {
      // Only warn occasionally for ICE candidates to avoid spam
      if (Math.random() < 0.1) {
        logger.warn('❌ Received ICE candidate but no active connection found', { 
          socketId: socket.id,
          candidateType: candidate.candidate?.split(' ')[7] || 'unknown'
        })
      }
    }
  })

  // Handle connection quality reporting
  socket.on('report-quality', (data: { latency: number, packetLoss: number, bandwidth: number }) => {
    const connection = connectionPool.active.get(socket.id)
    if (connection) {
      // Update network quality based on reported metrics
      const oldQuality = connection.networkQuality
      
      if (data.latency < 100 && data.packetLoss < 0.01) {
        connection.networkQuality = 'good'
      } else if (data.latency < 300 && data.packetLoss < 0.05) {
        connection.networkQuality = 'fair'
      } else {
        connection.networkQuality = 'poor'
      }
      
      if (oldQuality !== connection.networkQuality) {
        logger.info('Network quality updated', {
          socketId: socket.id,
          oldQuality,
          newQuality: connection.networkQuality,
          metrics: data
        })
        
        // Notify peer of quality change
        const peerId = activeConnections.get(socket.id)
        if (peerId) {
          io.to(peerId).emit('peer-quality-changed', {
            quality: connection.networkQuality,
            metrics: data
          })
        }
      }
      
      connection.lastSeen = Date.now()
    }
  })

  // **CRITICAL**: Handle connection restoration after socket reconnect
  socket.on('restore-connection', (data: { peerId: string }) => {
    logger.info('🔄 Attempting to restore peer connection', {
      socketId: socket.id,
      requestedPeerId: data.peerId
    })
    
    // Check if the peer is still connected
    const peerSocket = io.sockets.sockets.get(data.peerId)
    if (!peerSocket) {
      logger.warn('❌ Cannot restore - peer no longer connected', {
        socketId: socket.id,
        peerId: data.peerId
      })
      socket.emit('peer-disconnected', {
        reason: 'peer-not-found',
        timestamp: Date.now()
      })
      return
    }
    
    // Check if both users are still in active connections
    const existingPeerForSocket = activeConnections.get(socket.id)
    const existingSocketForPeer = activeConnections.get(data.peerId)
    
    if (existingPeerForSocket === data.peerId && existingSocketForPeer === socket.id) {
      logger.info('✅ Peer connection already active - confirming', {
        socketId: socket.id,
        peerId: data.peerId
      })
      
      // Just confirm the connection is still valid
      socket.emit('connection-restored', {
        peerId: data.peerId,
        status: 'active'
      })
      
      peerSocket.emit('connection-restored', {
        peerId: socket.id,
        status: 'active'
      })
      
    } else {
      logger.warn('❌ Connection state mismatch during restore', {
        socketId: socket.id,
        requestedPeerId: data.peerId,
        currentPeerForSocket: existingPeerForSocket,
        currentSocketForPeer: existingSocketForPeer
      })
      
      // Clear any stale connections and notify
      if (existingPeerForSocket) {
        activeConnections.delete(socket.id)
        activeConnections.delete(existingPeerForSocket)
      }
      if (existingSocketForPeer && existingSocketForPeer !== socket.id) {
        activeConnections.delete(data.peerId)
        activeConnections.delete(existingSocketForPeer)
      }
      
      socket.emit('peer-disconnected', {
        reason: 'connection-lost',
        timestamp: Date.now()
      })
    }
  })

  // Chat message forwarding with enhanced security and resilience
  socket.on('chat-message', (messageData) => {
    // Rate limiting check
    if (!checkRateLimit(socket.id, 20, 60000)) { // 20 messages per minute
      logger.warn('Chat message rate limit exceeded', { socketId: socket.id })
      socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' })
      return
    }
    
    // Validate message content
    if (!messageData || !validateMessage(messageData.text)) {
      logger.warn('Invalid chat message received', { socketId: socket.id, message: messageData })
      socket.emit('error', { message: 'Invalid message content' })
      return
    }
    
    const peerId = activeConnections.get(socket.id)
    if (peerId) {
      // Update connection activity
      const connection = connectionPool.active.get(socket.id)
      if (connection) connection.lastSeen = Date.now()
      
      // Forward message with additional metadata
      socket.to(peerId).emit('chat-message', {
        ...messageData,
        timestamp: Date.now(),
        verified: true
      })
      
      logger.debug('Chat message forwarded', { 
        from: socket.id, 
        to: peerId,
        messageLength: messageData.text.length
      })
    } else {
      logger.warn('Received chat message but no active connection found', { socketId: socket.id })
      socket.emit('connection-error', { message: 'No active chat connection' })
    }
  })

  // Enhanced disconnect handling
  socket.on('disconnect', (reason) => {
    const connection = connectionPool.active.get(socket.id) || 
                      connectionPool.standby.get(socket.id) || 
                      connectionPool.reconnecting.get(socket.id)
    
    if (connection) {
      const connectionDuration = Date.now() - connection.joinTime
      
      logger.info('Client disconnected', {
        socketId: socket.id,
        userId: connection.userId,
        reason,
        connectionDuration,
        networkQuality: connection.networkQuality
      })
    }
    
    // Clean up waiting list
    if (waitingUsers.has(socket.id)) {
      waitingUsers.delete(socket.id)
      logger.info('🧹 Removed user from waiting list on disconnect', { 
        socketId: socket.id,
        remainingWaiting: waitingUsers.size 
      })
    }
    
    // Clean up connection
    cleanupConnection(socket.id, reason)
  })

  // Handle connection errors
  socket.on('connect_error', (error) => {
    logger.error('Socket connection error', { socketId: socket.id, error: error.message })
  })

  // Handle custom error reporting
  socket.on('report-error', (errorData) => {
    logger.error('Client reported error', { 
      socketId: socket.id, 
      error: errorData,
      timestamp: Date.now()
    })
    
    // Update connection quality if network-related
    const connection = connectionPool.active.get(socket.id)
    if (connection && errorData.type === 'network') {
      connection.networkQuality = 'poor'
      connection.lastSeen = Date.now()
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
  
  // Initialize keep-alive system to prevent server sleeping
  keepServerAlive()
})

// Keep-alive system to prevent server sleeping
const KEEP_ALIVE_INTERVAL = 14 * 60 * 1000 // 14 minutes
const SERVER_URL = process.env.RENDER_EXTERNAL_URL || 'https://meetopiaapp.onrender.com'

const keepServerAlive = () => {
  if (process.env.NODE_ENV === 'production' && SERVER_URL.includes('render')) {
    setInterval(async () => {
      try {
        const response = await fetch(SERVER_URL + '/health')
        logger.info('Keep-alive ping successful', { 
          status: response.status,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        logger.warn('Keep-alive ping failed', { error })
      }
    }, KEEP_ALIVE_INTERVAL)
    
    logger.info('Keep-alive system initialized', { 
      interval: KEEP_ALIVE_INTERVAL / 1000 / 60 + ' minutes',
      url: SERVER_URL 
    })
  }
}

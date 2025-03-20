import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Enhanced CORS configuration
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

interface User {
  id: string
  socketId: string
  preferences: {
    type: 'video' | 'text'
    mode: 'regular' | 'speed'
    blindDate: boolean
    chatMode: 'chat' | 'dating'
    bio?: string
    interests?: string[]
  }
}

interface Room {
  id: string
  users: string[]
}

interface MatchedPair {
  user1: string
  user2: string
  roomId: string
}

// In-memory storage
const users: Record<string, User> = {}
const rooms: Record<string, Room> = {}
const videoWaitingQueue: string[] = []
const textWaitingQueue: string[] = []
const speedVideoWaitingQueue: string[] = []
const speedTextWaitingQueue: string[] = []
const datingWaitingQueue: string[] = []
const matchedPairs: MatchedPair[] = []
const userLikes: Record<string, string[]> = {} // userId -> array of liked userIds

// Helper function to find a compatible user
function findCompatibleUser(userId: string, queue: string[]): string | null {
  const user = users[userId]
  if (!user) return null

  for (let i = 0; i < queue.length; i++) {
    const potentialMatchId = queue[i]
    if (potentialMatchId === userId) continue
    
    const potentialMatch = users[potentialMatchId]
    if (!potentialMatch) continue
    
    // Check if users are compatible based on preferences
    const isTypeCompatible = user.preferences.type === potentialMatch.preferences.type
    const isModeCompatible = user.preferences.mode === potentialMatch.preferences.mode
    const isChatModeCompatible = user.preferences.chatMode === potentialMatch.preferences.chatMode
    
    if (isTypeCompatible && isModeCompatible && isChatModeCompatible) {
      // Remove the matched user from the queue
      queue.splice(i, 1)
      return potentialMatchId
    }
  }
  
  return null
}

// API endpoint to create a match
app.post('/api/match', (req, res) => {
  const userId = uuidv4()
  const { type, mode, blindDate, chatMode, bio, interests } = req.body
  
  users[userId] = {
    id: userId,
    socketId: '', // Will be set when socket connects
    preferences: {
      type: type || 'video',
      mode: mode || 'regular',
      blindDate: blindDate || false,
      chatMode: chatMode || 'chat',
      bio: bio || '',
      interests: interests || []
    }
  }
  
  res.json({
    success: true,
    match: { userId }
  })
})

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  // Store client IP
  const clientIP = socket.handshake.address
  
  // Initialize user likes
  userLikes[socket.id] = []
  
  // Handle room joining
  socket.on('join-room', ({ roomId }) => {
    console.log(`User ${socket.id} joined room: ${roomId}`)
    socket.join(roomId)
    socket.to(roomId).emit('user-joined')
    
    // Find the user ID for this socket
    const userId = Object.keys(users).find(id => users[id].socketId === socket.id)
    if (userId) {
      // Find the room
      const room = rooms[roomId]
      if (room) {
        // Find the peer in the room
        const peerId = room.users.find(id => id !== userId)
        if (peerId) {
          // Send peer profile info
          socket.emit('peer-profile', {
            bio: users[peerId].preferences.bio,
            interests: users[peerId].preferences.interests
          })
        }
      }
    }
  })
  
  // Handle find-match event
  socket.on('find-match', ({ userId, type, mode, blindDate, chatMode, bio, interests }) => {
    console.log('Find match request:', { userId, type, mode, blindDate, chatMode })
    
    if (!userId || !users[userId]) {
      console.log('Invalid user ID')
      return
    }
    
    // Update user with socket ID and preferences
    users[userId].socketId = socket.id
    users[userId].preferences = {
      type: type || 'video',
      mode: mode || 'regular',
      blindDate: blindDate || false,
      chatMode: chatMode || 'chat',
      bio: bio || '',
      interests: interests || []
    }
    
    // Clean up any previous connections for this user
    cleanupUserConnections(userId)
    
    // Choose the appropriate waiting queue
    let waitingQueue: string[]
    if (chatMode === 'dating') {
      waitingQueue = datingWaitingQueue
    } else if (type === 'video' && mode === 'speed') {
      waitingQueue = speedVideoWaitingQueue
    } else if (type === 'text' && mode === 'speed') {
      waitingQueue = speedTextWaitingQueue
    } else if (type === 'video') {
      waitingQueue = videoWaitingQueue
    } else {
      waitingQueue = textWaitingQueue
    }
    
    // Try to find a match
    const matchedUserId = findCompatibleUser(userId, waitingQueue)
    
    if (matchedUserId) {
      // Match found
      const roomId = `room_${Date.now()}`
      
      // Create a room
      rooms[roomId] = {
        id: roomId,
        users: [userId, matchedUserId]
      }
      
      // Add to matched pairs
      matchedPairs.push({
        user1: userId,
        user2: matchedUserId,
        roomId
      })
      
      // Notify both users
      const user1Socket = users[userId].socketId
      const user2Socket = users[matchedUserId].socketId
      
      io.to(user1Socket).emit('match-found', {
        roomId,
        peer: {
          id: matchedUserId,
          bio: users[matchedUserId].preferences.bio,
          interests: users[matchedUserId].preferences.interests
        }
      })
      
      io.to(user2Socket).emit('match-found', {
        roomId,
        peer: {
          id: userId,
          bio: users[userId].preferences.bio,
          interests: users[userId].preferences.interests
        }
      })
      
      console.log('Match found:', { roomId, user1: userId, user2: matchedUserId })
    } else {
      // No match found, add to waiting queue
      waitingQueue.push(userId)
      console.log('Added to waiting queue:', { userId, queueLength: waitingQueue.length })
    }
  })
  
  // WebRTC signaling events
  socket.on('offer', ({ roomId, offer }) => {
    console.log('Forwarding offer to room:', roomId)
    socket.to(roomId).emit('offer', { offer })
  })
  
  socket.on('answer', ({ roomId, answer }) => {
    console.log('Forwarding answer to room:', roomId)
    socket.to(roomId).emit('answer', { answer })
  })
  
  socket.on('ice-candidate', ({ roomId, candidate }) => {
    console.log('Forwarding ICE candidate to room:', roomId)
    socket.to(roomId).emit('ice-candidate', { candidate })
  })
  
  // Handle like event
  socket.on('like', ({ roomId }) => {
    console.log('Like received for room:', roomId)
    
    // Find the user ID for this socket
    const userId = Object.keys(users).find(id => users[id].socketId === socket.id)
    if (!userId) return
    
    // Find the room
    const room = rooms[roomId]
    if (!room) return
    
    // Find the peer in the room
    const peerId = room.users.find(id => id !== userId)
    if (!peerId) return
    
    // Add to likes
    if (!userLikes[userId]) {
      userLikes[userId] = []
    }
    userLikes[userId].push(peerId)
    
    // Check if mutual like
    const mutualLike = userLikes[peerId]?.includes(userId)
    
    // Notify peer about the like
    const peerSocket = users[peerId]?.socketId
    if (peerSocket) {
      io.to(peerSocket).emit('peer-liked')
    }
    
    // If mutual like, notify both users
    if (mutualLike) {
      io.to(roomId).emit('matched')
    }
  })
  
  // Handle find-next-user
  socket.on('find-next-user', () => {
    console.log('User searching for next match:', socket.id)
    
    // Find the user ID for this socket
    const userId = Object.keys(users).find(id => users[id].socketId === socket.id)
    if (!userId) return
    
    // Get user preferences
    const userPref = users[userId]?.preferences || { 
      type: 'video', 
      mode: 'regular', 
      blindDate: false,
      chatMode: 'chat'
    }
    
    // Clean up previous connection if any
    const previousPeer = Object.keys(users).find(id => {
      const user = users[id]
      return user && user.socketId && user.socketId !== socket.id && 
             matchedPairs.some(pair => 
               (pair.user1 === userId && pair.user2 === id) || 
               (pair.user1 === id && pair.user2 === userId)
             )
    })
    
    if (previousPeer) {
      const previousPeerSocketId = users[previousPeer]?.socketId
      if (previousPeerSocketId) {
        io.to(previousPeerSocketId).emit('peer-left')
      }
      
      // Reset likes between these users
      if (userLikes[userId]) {
        userLikes[userId] = userLikes[userId].filter(id => id !== previousPeer)
      }
      
      if (userLikes[previousPeer]) {
        userLikes[previousPeer] = userLikes[previousPeer].filter(id => id !== userId)
      }
      
      // Remove any matched pair
      const pairIndex = matchedPairs.findIndex(pair => 
        (pair.user1 === userId && pair.user2 === previousPeer) || 
        (pair.user1 === previousPeer && pair.user2 === userId)
      )
      
      if (pairIndex !== -1) {
        matchedPairs.splice(pairIndex, 1)
      }
    }
    
    // Choose the appropriate waiting queue based on mode and type
    let waitingQueue: string[]
    if (userPref.chatMode === 'dating') {
      waitingQueue = datingWaitingQueue
    } else if (userPref.type === 'video' && userPref.mode === 'speed') {
      waitingQueue = speedVideoWaitingQueue
    } else if (userPref.type === 'text' && userPref.mode === 'speed') {
      waitingQueue = speedTextWaitingQueue
    } else if (userPref.type === 'video') {
      waitingQueue = videoWaitingQueue
    } else {
      waitingQueue = textWaitingQueue
    }
    
    // Find new match with same preferences
    const matchedUserId = findCompatibleUser(userId, waitingQueue)
    
    if (matchedUserId) {
      // Match found
      const roomId = `room_${Date.now()}`
      
      // Create a room
      rooms[roomId] = {
        id: roomId,
        users: [userId, matchedUserId]
      }
      
      // Add to matched pairs
      matchedPairs.push({
        user1: userId,
        user2: matchedUserId,
        roomId
      })
      
      // Notify both users
      const user1Socket = users[userId].socketId
      const user2Socket = users[matchedUserId].socketId
      
      io.to(user1Socket).emit('match-found', {
        roomId,
        peer: {
          id: matchedUserId,
          bio: users[matchedUserId].preferences.bio,
          interests: users[matchedUserId].preferences.interests
        }
      })
      
      io.to(user2Socket).emit('match-found', {
        roomId,
        peer: {
          id: userId,
          bio: users[userId].preferences.bio,
          interests: users[userId].preferences.interests
        }
      })
    } else {
      // No match found, add to waiting queue
      waitingQueue.push(userId)
      console.log('Added to waiting queue:', { userId, queueLength: waitingQueue.length })
    }
  })
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
    
    // Find the user ID for this socket
    const userId = Object.keys(users).find(id => users[id].socketId === socket.id)
    if (!userId) return
    
    // Clean up user connections
    cleanupUserConnections(userId)
    
    // Remove user from users object
    delete users[userId]
  })
})

// Helper function to clean up user connections
function cleanupUserConnections(userId: string) {
  // Remove from waiting queues
  const queues = [videoWaitingQueue, textWaitingQueue, speedVideoWaitingQueue, speedTextWaitingQueue, datingWaitingQueue]
  queues.forEach(queue => {
    const index = queue.indexOf(userId)
    if (index !== -1) {
      queue.splice(index, 1)
    }
  })
  
  // Find rooms the user is in
  const userRooms = Object.values(rooms).filter(room => room.users.includes(userId))
  
  userRooms.forEach(room => {
    // Notify other users in the room
    const otherUsers = room.users.filter(id => id !== userId)
    otherUsers.forEach(otherUserId => {
      const otherUserSocketId = users[otherUserId]?.socketId
      if (otherUserSocketId) {
        io.to(otherUserSocketId).emit('user-disconnected')
      }
    })
    
    // Remove room
    delete rooms[room.id]
  })
  
  // Remove from matched pairs
  const pairIndex = matchedPairs.findIndex(pair => pair.user1 === userId || pair.user2 === userId)
  if (pairIndex !== -1) {
    matchedPairs.splice(pairIndex, 1)
  }
  
  // Reset likes
  delete userLikes[userId]
  // Also remove this user from other users' likes
  Object.keys(userLikes).forEach(id => {
    const index = userLikes[id].indexOf(userId)
    if (index !== -1) {
      userLikes[id].splice(index, 1)
    }
  })
}

// Start server
const PORT = process.env.PORT || 3003
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

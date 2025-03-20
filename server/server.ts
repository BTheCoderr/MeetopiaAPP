import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

interface UserPreferences {
  type: 'video' | 'text';
  mode: 'regular' | 'speed';
  blindDate: boolean;
  chatMode: 'chat' | 'dating';
  bio?: string;
  interests?: string[];
}

interface User {
  id: string;
  socketId: string;
  preferences: UserPreferences;
  searching: boolean;
  likes: Set<string>;
  likedBy: Set<string>;
}

interface Room {
  id: string;
  users: string[];
}

const app = express();
const server = http.createServer(app);

// Configure CORS for socket.io
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001', 'https://meetopia-app.vercel.app'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: allowedOrigins
}));

// Health check route
app.get('/', (req, res) => {
  res.send('Meetopia signaling server is running');
});

// Users and rooms storage
const users = new Map<string, User>();
const rooms = new Map<string, Room>();

// Waiting queues for different match types and modes
const waitingQueues = {
  video: {
    regular: {
      chat: new Set<string>(),
      dating: new Set<string>(),
    },
    speed: {
      chat: new Set<string>(),
      dating: new Set<string>(),
    }
  },
  text: {
    regular: {
      chat: new Set<string>(),
      dating: new Set<string>(),
    },
    speed: {
      chat: new Set<string>(),
      dating: new Set<string>(),
    }
  }
};

// Cleanup function for when users disconnect or find a new match
function cleanupUserConnections(userId: string) {
  // Find and clean up any existing rooms
  for (const [roomId, room] of rooms.entries()) {
    if (room.users.includes(userId)) {
      // Remove user from room
      room.users = room.users.filter(id => id !== userId);
      
      // If room is empty, remove it
      if (room.users.length === 0) {
        rooms.delete(roomId);
      } else {
        // Notify other user in the room
        const otherUserId = room.users[0];
        const otherUser = users.get(otherUserId);
        if (otherUser) {
          io.to(otherUser.socketId).emit('peer-left');
        }
      }
    }
  }
  
  // Reset likes for this user
  const user = users.get(userId);
  if (user) {
    user.likes.clear();
    user.likedBy.clear();
    
    // Remove user from all waiting queues
    for (const type of ['video', 'text'] as const) {
      for (const mode of ['regular', 'speed'] as const) {
        for (const chatMode of ['chat', 'dating'] as const) {
          waitingQueues[type][mode][chatMode].delete(userId);
        }
      }
    }
  }
}

// Socket connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle user searching for a match
  socket.on('find-match', async (data: {
    userId: string,
    type: 'video' | 'text',
    mode: 'regular' | 'speed',
    blindDate: boolean,
    chatMode: 'chat' | 'dating',
    bio?: string,
    interests?: string[]
  }) => {
    console.log('Find match request:', data);
    
    // Create or update user
    const user: User = {
      id: data.userId,
      socketId: socket.id,
      preferences: {
        type: data.type,
        mode: data.mode,
        blindDate: data.blindDate,
        chatMode: data.chatMode,
        bio: data.bio,
        interests: data.interests
      },
      searching: true,
      likes: new Set<string>(),
      likedBy: new Set<string>()
    };
    
    // Clean up previous connections first
    cleanupUserConnections(data.userId);
    
    // Add/update user in our map
    users.set(data.userId, user);
    
    // Choose the appropriate waiting queue
    const queue = waitingQueues[data.type][data.mode][data.chatMode];
    
    // Check for matching user in the waiting queue
    let matchFound = false;
    
    for (const waitingUserId of queue) {
      const waitingUser = users.get(waitingUserId);
      
      // Skip if user not found or no longer searching
      if (!waitingUser || !waitingUser.searching) {
        queue.delete(waitingUserId);
        continue;
      }
      
      // Check compatibility (blind date must match)
      if (
        waitingUser.preferences.type === data.type &&
        waitingUser.preferences.mode === data.mode &&
        waitingUser.preferences.blindDate === data.blindDate &&
        waitingUser.preferences.chatMode === data.chatMode
      ) {
        // Match found!
        matchFound = true;
        
        // Remove waiting user from queue
        queue.delete(waitingUserId);
        
        // Set users as not searching
        user.searching = false;
        waitingUser.searching = false;
        
        // Create room
        const roomId = uuidv4();
        const room: Room = {
          id: roomId,
          users: [data.userId, waitingUserId]
        };
        rooms.set(roomId, room);
        
        // Extract profile data
        const userProfile = {
          bio: user.preferences.bio || '',
          interests: user.preferences.interests || []
        };
        
        const waitingUserProfile = {
          bio: waitingUser.preferences.bio || '',
          interests: waitingUser.preferences.interests || []
        };
        
        // Notify both users about the match
        io.to(user.socketId).emit('match-found', {
          roomId,
          peer: waitingUserId,
          peerProfile: waitingUserProfile
        });
        
        io.to(waitingUser.socketId).emit('match-found', {
          roomId,
          peer: data.userId,
          peerProfile: userProfile
        });
        
        break;
      }
    }
    
    // If no match found, add user to queue
    if (!matchFound) {
      queue.add(data.userId);
    }
  });
  
  // Handle joining a room
  socket.on('join-room', (data: { roomId: string, bio?: string, interests?: string[] }) => {
    console.log('Join room request:', data.roomId);
    
    const room = rooms.get(data.roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    // Find user and their peer in the room
    let userId = '';
    let peerId = '';
    
    for (const [id, user] of users.entries()) {
      if (user.socketId === socket.id) {
        userId = id;
      }
    }
    
    if (!userId) {
      // If socket isn't associated with a user, try to find by room
      for (const id of room.users) {
        const user = users.get(id);
        if (user && user.socketId === socket.id) {
          userId = id;
        } else if (user) {
          peerId = id;
        }
      }
    } else {
      // Find peer ID (other user in the room)
      peerId = room.users.find(id => id !== userId) || '';
    }
    
    // Join socket to room
    socket.join(data.roomId);
    
    // Get peer's user object
    const peer = users.get(peerId);
    
    // Create profile info to share
    const peerProfile = peer ? {
      bio: peer.preferences.bio || '',
      interests: peer.preferences.interests || []
    } : null;
    
    // Update user's profile if new info provided
    if (userId) {
      const user = users.get(userId);
      if (user && (data.bio || data.interests)) {
        user.preferences.bio = data.bio;
        user.preferences.interests = data.interests;
      }
    }
    
    // Notify user they joined the room with peer info
    socket.emit('room-joined', {
      peerId,
      peerProfile
    });
  });
  
  // Handle likes
  socket.on('like-peer', (data: { roomId: string, peerId: string }) => {
    console.log('Like peer:', data);
    
    // Find current user
    let userId = '';
    for (const [id, user] of users.entries()) {
      if (user.socketId === socket.id) {
        userId = id;
        break;
      }
    }
    
    if (!userId) return;
    
    const user = users.get(userId);
    const peer = users.get(data.peerId);
    
    if (!user || !peer) return;
    
    // Record the like
    user.likes.add(data.peerId);
    peer.likedBy.add(userId);
    
    // Notify peer about the like
    io.to(peer.socketId).emit('peer-like');
  });
  
  // Handle disconnects
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Find user by socket ID
    let userId = '';
    for (const [id, user] of users.entries()) {
      if (user.socketId === socket.id) {
        userId = id;
        break;
      }
    }
    
    if (userId) {
      // Clean up user's connections
      cleanupUserConnections(userId);
      
      // Mark user as not searching
      const user = users.get(userId);
      if (user) {
        user.searching = false;
      }
    }
  });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
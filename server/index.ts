import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import path from 'path'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.get('/', (_req, res) => {
  res.status(200).send(`
    <html>
      <head>
        <title>Meetopia Signaling Server</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <script src="/socket.io/socket.io.js"></script>
      </head>
      <body class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div class="max-w-2xl w-full">
          <h1 class="text-4xl font-bold mb-8 text-center">
            <span class="text-blue-500">Meet</span><span class="text-gray-700">opia</span>
            <span class="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">Signaling Server</span>
          </h1>
          
          <div class="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <div class="flex items-center space-x-3">
              <div class="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <p class="text-gray-700">Status: <span class="font-semibold text-green-500">Running</span></p>
            </div>

            <div class="border-t border-gray-100 pt-6">
              <h2 class="text-lg font-semibold mb-4 text-gray-700">Connection Details</h2>
              <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                <p class="mb-2">WebSocket endpoint:</p>
                <code class="bg-gray-100 px-2 py-1 rounded text-blue-600">ws://localhost:3001</code>
              </div>
            </div>

            <div class="border-t border-gray-100 pt-6">
              <h2 class="text-lg font-semibold mb-4 text-gray-700">Active Connections</h2>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Connected Clients:</span>
                  <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full" id="clientCount">0</span>
                </div>
              </div>
            </div>
          </div>

          <p class="text-center mt-8 text-gray-500 text-sm">
            © ${new Date().getFullYear()} Meetopia. All rights reserved.
          </p>
        </div>

        <script>
          document.addEventListener('DOMContentLoaded', () => {
            try {
              const socket = io();
              
              socket.on('connect', () => {
                console.log('Connected to signaling server');
              });

              socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
              });

              socket.on('clients-count', (count) => {
                console.log('Received client count:', count);
                const countElement = document.getElementById('clientCount');
                if (countElement) {
                  countElement.textContent = count;
                }
              });
            } catch (error) {
              console.error('Error initializing socket:', error);
            }
          });
        </script>
      </body>
    </html>
  `)
})

// Error handling
app.use((_req, res) => {
  res.status(404).send('Not Found')
})

app.use((err: Error, _req: express.Request, res: express.Response) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
})

// Track connected clients
const connectedClients = new Map()
const waitingUsers = new Set()

// At the top, add a debug function
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
    
    // Debug current state
    console.log('Waiting users:', Array.from(waitingUsers))
  })

  socket.on('call-user', ({ offer, to }) => {
    console.log('Call request from:', socket.id, 'to:', to)
    if (to) {
      io.to(String(to)).emit('call-made', { 
        offer, 
        from: socket.id 
      })
    } else {
      console.log('No target user specified for call')
    }
  })

  socket.on('make-answer', ({ answer, to }) => {
    io.to(to).emit('answer-made', { answer, from: socket.id })
  })

  socket.on('ice-candidate', ({ candidate, to }) => {
    console.log('Forwarding ICE candidate to:', to)
    if (connectedClients.get(to)) {
      if (connectedClients.get(to).peerConnection && connectedClients.get(to).peerConnection.remoteDescription) {
        connectedClients.get(to).peerConnection.addIceCandidate(candidate)
      } else {
        console.log('Skipping ICE candidate - no remote description yet')
      }
    }
  })

  socket.on('chat-message', ({ message, to }) => {
    io.to(to).emit('chat-message', { text: message, from: socket.id })
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

const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`Signaling server running on http://localhost:${PORT}`)
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing HTTP server')
  httpServer.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})

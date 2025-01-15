import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Serve static files (optional)
app.use(express.static('public'));

// Serve the HTML page
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🚀 Meetopia Signaling Server</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
            color: #fff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          .loader {
            width: 80px;
            height: 80px;
            position: relative;
            margin: 30px auto;
          }
          .loader:before,
          .loader:after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 5px solid transparent;
            border-top-color: #3498db;
          }
          .loader:before {
            animation: spin 2s linear infinite;
          }
          .loader:after {
            border-top-color: #e74c3c;
            animation: spin 3s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .status {
            font-size: 1.5em;
            margin: 20px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .connections {
            font-size: 1.1em;
            color: #3498db;
            margin: 15px 0;
          }
          .pulse {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
        <script src="/socket.io/socket.io.js"></script>
      </head>
      <body>
        <div class="container">
          <h1 class="pulse">🌐 Meetopia Signaling Server</h1>
          <div class="loader"></div>
          <div class="status">Server is Running</div>
          <div class="connections">Waiting for connections...</div>
          <div class="stats">
            <div class="stat-box">
              <div>🔌 Port: ${process.env.PORT || 3001}</div>
              <div>👥 Users: <span id="user-count">0</span></div>
            </div>
          </div>
        </div>

        <script>
          const messages = [
            "🔄 Connecting the dots...",
            "🚀 Warming up the engines...",
            "🛠️ Preparing for takeoff...",
            "✨ Ready for action!",
            "🌟 Awaiting connections...",
            "🎮 Game on!"
          ];
          
          let count = 0;
          setInterval(() => {
            const status = document.querySelector('.connections');
            status.textContent = messages[count % messages.length];
            count++;
          }, 2000);

          // Update user count when receiving updates
          const socket = io();
          socket.on('clientCount', (count) => {
            document.getElementById('user-count').textContent = count;
          });
        </script>
      </body>
    </html>
  `);
});

// Add a variable to track connected clients
let connectedClients = 0;

io.on('connection', (socket) => {
  connectedClients++;
  console.log(`Client connected: ${socket.id}`);
  console.log(`Total connected clients: ${connectedClients}`);
  
  io.emit('clientCount', connectedClients);

  // Handle offer
  socket.on('offer', ({ offer, from }) => {
    console.log(`Received offer from: ${from}`);
    // Broadcast to everyone except sender
    socket.broadcast.emit('offer', { offer, from });
  });

  // Handle answer
  socket.on('answer', ({ answer, to, from }) => {
    console.log(`Received answer from: ${from} to: ${to}`);
    // Send only to the specific peer
    io.to(to).emit('answer', { answer, from });
  });

  // Handle ICE candidate
  socket.on('ice-candidate', ({ candidate, from, to }) => {
    console.log(`Received ICE candidate from: ${from}`);
    if (to) {
      // Send to specific peer if 'to' is provided
      io.to(to).emit('ice-candidate', { candidate, from });
    } else {
      // Broadcast to all other peers if no specific target
      socket.broadcast.emit('ice-candidate', { candidate, from });
    }
  });

  socket.on('disconnect', (reason) => {
    connectedClients--;
    console.log(`Client disconnected: ${socket.id} Reason: ${reason}`);
    console.log(`Remaining connected clients: ${connectedClients}`);
    io.emit('clientCount', connectedClients);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`
\x1b[36m╔════════════════════════════════════════╗
║     🚀 Meetopia Signaling Server 🚀     ║
╠════════════════════════════════════════╣
║                                        ║
║   🌟 Server Status: \x1b[32mONLINE\x1b[36m           ║
║   🎯 Port: ${PORT}                         ║
║   🌐 WebSocket: \x1b[32mREADY\x1b[36m              ║
║                                        ║
║   Waiting for connections... 🎮         ║
║                                        ║
╚════════════════════════════════════════╝\x1b[0m
  `);
}); 
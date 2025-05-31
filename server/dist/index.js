"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Enhanced CORS configuration
const PORT = process.env.PORT || 3003;
const CORS_ORIGINS = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
    'https://meetopia-qpqrimjnj-bthecoders-projects.vercel.app',
    'https://meetopia-app.vercel.app',
    'https://meetopia-signaling.onrender.com',
    'http://localhost:3000',
    'http://localhost:3003'
];
console.log('Server starting with configuration:');
console.log('PORT:', PORT);
console.log('CORS_ORIGINS:', CORS_ORIGINS);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current directory:', process.cwd());
// Create HTTP server first
const httpServer = (0, http_1.createServer)(app);
// Socket.IO setup with enhanced configuration
const io = new socket_io_1.Server(httpServer, {
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
});
// Add CORS middleware for Express
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && CORS_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
// Health check route
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'Meetopia Signaling Server is running',
        timestamp: new Date().toISOString(),
        connections: io.engine.clientsCount,
        waitingUsers: waitingUsers.size,
        activeConnections: activeConnections.size / 2 // Divide by 2 since each connection is stored twice
    });
});
// Status endpoint for monitoring
app.get('/status', (req, res) => {
    res.json({
        server: 'Meetopia Signaling Server',
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        connections: {
            total: io.engine.clientsCount,
            waiting: waitingUsers.size,
            active: activeConnections.size / 2
        },
        environment: process.env.NODE_ENV || 'development'
    });
});
// Track connected clients and their status
const connectedClients = new Map();
const waitingUsers = new Set();
const activeConnections = new Map(); // Track who is connected to whom
const videoStreams = new Map(); // Track active video streams
const videoWaitingUsers = new Set(); // Track users waiting for video matches
const userIPs = new Map(); // Track user IPs to prevent self-matching
// Socket connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    console.log('Total connected clients:', io.engine.clientsCount);
    // Store client IP
    const clientIP = socket.handshake.address;
    userIPs.set(socket.id, clientIP);
    socket.on('find-user', () => {
        console.log('User searching for match:', socket.id);
        console.log('Current waiting users:', Array.from(waitingUsers));
        const availableUsers = Array.from(waitingUsers);
        const match = availableUsers.find(userId => userId !== socket.id);
        if (match) {
            console.log('Match found:', match);
            waitingUsers.delete(match);
            // Track the connection between users
            activeConnections.set(socket.id, match);
            activeConnections.set(match, socket.id);
            socket.emit('user-found', { partnerId: match });
            io.to(match).emit('user-found', { partnerId: socket.id });
        }
        else {
            console.log('No match found, adding to waiting list:', socket.id);
            waitingUsers.add(socket.id);
        }
    });
    // WebRTC signaling events
    socket.on('call-user', ({ offer, to }) => {
        console.log('Forwarding call offer to:', to);
        io.to(to).emit('call-made', { offer, from: socket.id });
    });
    socket.on('make-answer', ({ answer, to }) => {
        console.log('Forwarding call answer to:', to);
        io.to(to).emit('answer-made', { answer, from: socket.id });
    });
    socket.on('ice-candidate', ({ candidate, to }) => {
        console.log('Forwarding ICE candidate to:', to);
        io.to(to).emit('ice-candidate', { candidate, from: socket.id });
    });
    // Handle chat messages
    socket.on('chat-message', (messageData) => {
        console.log('Forwarding message to:', messageData.to);
        io.to(messageData.to).emit('chat-message', messageData);
    });
    socket.on('find-next-user', () => {
        console.log('User searching for next match:', socket.id);
        // Clean up previous connection if any
        const previousPeer = activeConnections.get(socket.id);
        if (previousPeer) {
            io.to(previousPeer).emit('peer-left');
            activeConnections.delete(previousPeer);
            activeConnections.delete(socket.id);
        }
        // Find new match
        const availableUsers = Array.from(waitingUsers);
        const match = availableUsers.find(userId => userId !== socket.id);
        if (match) {
            waitingUsers.delete(match);
            // Track the new connection
            activeConnections.set(socket.id, match);
            activeConnections.set(match, socket.id);
            socket.emit('user-found', { partnerId: match });
            io.to(match).emit('user-found', { partnerId: socket.id });
        }
        else {
            waitingUsers.add(socket.id);
        }
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        waitingUsers.delete(socket.id);
        userIPs.delete(socket.id);
        const peer = activeConnections.get(socket.id);
        if (peer) {
            io.to(peer).emit('peer-left');
            activeConnections.delete(peer);
        }
        activeConnections.delete(socket.id);
    });
});
// Start server
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

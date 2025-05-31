# Meetopia Signaling Server

This is the WebRTC signaling server for the Meetopia video chat application.

## Features

- WebRTC signaling for video/audio calls
- Real-time chat messaging
- User matching and pairing
- Health check endpoints
- CORS configuration for multiple origins

## Deployment

### Railway (Recommended)

1. Connect your GitHub repository to Railway
2. Deploy from the root directory
3. Railway will automatically detect the Node.js project and build it
4. The server will be available at your Railway domain

### Local Development

```bash
npm install
npm run build
npm start
```

The server will run on port 3003 by default.

## Environment Variables

- `PORT` - Server port (default: 3003)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGINS` - Comma-separated list of allowed origins

## Health Check

- `GET /` - Basic health check with server status
- `GET /status` - Detailed server status including metrics

## Socket.IO Events

- `find-user` - Find a random user to connect with
- `call-user` - Initiate WebRTC call
- `make-answer` - Respond to WebRTC call
- `ice-candidate` - Exchange ICE candidates
- `chat-message` - Send chat messages
- `find-next-user` - Find next user after current chat ends 
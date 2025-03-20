# Meetopia Signaling Server

This is the WebSocket signaling server for the Meetopia app. It handles:

- WebRTC signaling (offers, answers, ICE candidates)
- User matching based on preferences
- Room management for video/text chats
- Dating profile exchange

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run in production mode
npm start
```

## Environment Variables

- `PORT`: The port to run the server on (default: 3003)
- `NODE_ENV`: The environment to run the server in (development, production)
- `CORS_ORIGINS`: Comma-separated list of allowed origins

## Deployment

This server is deployed on Render.com as a Node.js web service. 
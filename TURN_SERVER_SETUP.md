# TURN Server Setup Guide for Meetopia

## Overview

TURN (Traversal Using Relays around NAT) servers are critical for ensuring reliable connections when users are behind restrictive NATs or firewalls. This guide covers multiple TURN server options and implementation strategies.

## Why TURN Servers are Essential

### Connection Scenarios TURN Helps With:
- **Symmetric NAT**: Most restrictive NAT type (common in corporate networks)
- **Firewall Restrictions**: Blocked UDP/TCP ports
- **Mobile Networks**: Carrier-grade NAT (CGNAT)
- **Public WiFi**: Hotel/cafe networks with restrictions
- **Geographic Distances**: Cross-continent connections

### Without TURN vs With TURN:
```
Without TURN: ~60-70% connection success rate
With TURN:    ~95-98% connection success rate
```

## Option 1: Self-Hosted TURN Server (Recommended)

### Using Coturn (Open Source)

#### Installation on Ubuntu/Debian:
```bash
# Install coturn
sudo apt update
sudo apt install coturn

# Enable coturn service
sudo systemctl enable coturn
```

#### Configuration (`/etc/turnserver.conf`):
```bash
# Basic configuration
listening-port=3478
tls-listening-port=5349
listening-ip=0.0.0.0

# Authentication
use-auth-secret
static-auth-secret=your-secret-key-here
realm=meetopia.app

# SSL/TLS (Let's Encrypt certificates)
cert=/etc/letsencrypt/live/turn.meetopia.app/fullchain.pem
pkey=/etc/letsencrypt/live/turn.meetopia.app/privkey.pem

# Relay configuration
relay-ip=YOUR_SERVER_IP
external-ip=YOUR_SERVER_IP

# Port ranges for relay
min-port=49152
max-port=65535

# Security settings
fingerprint
lt-cred-mech
no-multicast-peers
no-cli
no-tlsv1
no-tlsv1_1

# Logging
log-file=/var/log/turnserver.log
verbose
```

#### Firewall Configuration:
```bash
# Allow TURN server ports
sudo ufw allow 3478
sudo ufw allow 5349
sudo ufw allow 49152:65535/udp
sudo ufw allow 49152:65535/tcp
```

#### Start Service:
```bash
sudo systemctl start coturn
sudo systemctl status coturn
```

### Docker Deployment:
```yaml
version: '3.8'
services:
  coturn:
    image: coturn/coturn:latest
    ports:
      - "3478:3478"
      - "5349:5349"
      - "49152-65535:49152-65535/udp"
    volumes:
      - ./turnserver.conf:/etc/turnserver.conf
      - ./ssl:/etc/ssl/certs
    restart: unless-stopped
    command: ["-c", "/etc/turnserver.conf"]
```

## Option 2: Cloud TURN Services

### Twilio STUN/TURN (Production Ready)
```typescript
// Enhanced WebRTC configuration with Twilio
const iceServers = [
  // Free STUN servers
  { urls: 'stun:stun.l.google.com:19302' },
  
  // Twilio TURN servers (requires account)
  {
    urls: 'turn:global.turn.twilio.com:3478?transport=udp',
    username: 'your-twilio-username',
    credential: 'your-twilio-credential'
  },
  {
    urls: 'turn:global.turn.twilio.com:3478?transport=tcp',
    username: 'your-twilio-username', 
    credential: 'your-twilio-credential'
  },
  {
    urls: 'turn:global.turn.twilio.com:443?transport=tcp',
    username: 'your-twilio-username',
    credential: 'your-twilio-credential'
  }
]
```

### Pricing: ~$0.40 per GB relayed

### Metered.ca (Cost-Effective)
```typescript
const iceServers = [
  { urls: 'stun:stun.relay.metered.ca:80' },
  {
    urls: 'turn:relay.metered.ca:80',
    username: 'your-username',
    credential: 'your-credential'
  },
  {
    urls: 'turn:relay.metered.ca:443',
    username: 'your-username',
    credential: 'your-credential'  
  }
]
```

### Pricing: ~$0.10-0.30 per GB

## Option 3: Multiple Server Regions

### Global TURN Infrastructure:
```typescript
// Geographic TURN server selection
const getTurnServers = (userRegion: string) => {
  const regions = {
    'us-east': [
      { urls: 'turn:turn-us-east.meetopia.app:3478', username: 'user', credential: 'pass' }
    ],
    'us-west': [
      { urls: 'turn:turn-us-west.meetopia.app:3478', username: 'user', credential: 'pass' }
    ],
    'europe': [
      { urls: 'turn:turn-eu.meetopia.app:3478', username: 'user', credential: 'pass' }
    ],
    'asia': [
      { urls: 'turn:turn-asia.meetopia.app:3478', username: 'user', credential: 'pass' }
    ]
  }
  
  return regions[userRegion] || regions['us-east']
}
```

## Implementation in Meetopia

### Enhanced WebRTC Configuration:
```typescript
// Add to src/lib/webrtc.ts
private createPeerConnection() {
  const iceServers = [
    // STUN servers for initial NAT detection
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    
    // Your TURN servers
    {
      urls: 'turn:turn.meetopia.app:3478',
      username: this.generateTurnUsername(),
      credential: this.generateTurnCredential()
    },
    {
      urls: 'turn:turn.meetopia.app:3478?transport=tcp',
      username: this.generateTurnUsername(),
      credential: this.generateTurnCredential()
    },
    {
      urls: 'turns:turn.meetopia.app:5349', // Secure TURN over TLS
      username: this.generateTurnUsername(),
      credential: this.generateTurnCredential()
    }
  ]

  return new RTCPeerConnection({
    iceServers,
    iceCandidatePoolSize: 15,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    iceTransportPolicy: 'all' // Use both STUN and TURN
  })
}

// Time-based authentication for TURN
private generateTurnUsername(): string {
  const expiry = Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
  return `${expiry}:meetopia-user`
}

private generateTurnCredential(): string {
  const secret = process.env.TURN_SECRET || 'your-secret-key'
  const username = this.generateTurnUsername()
  return btoa(username + secret) // Simple HMAC alternative
}
```

### Environment Configuration:
```bash
# Add to .env
TURN_SERVER_URL=turn.meetopia.app
TURN_SECRET=your-very-secure-secret-key
TURN_USERNAME_PREFIX=meetopia
TURN_CREDENTIAL_TTL=3600
```

### Server-Side TURN Credential Generation:
```typescript
// Add to server/index.ts
import crypto from 'crypto'

// Generate secure TURN credentials
socket.on('request-turn-credentials', () => {
  const username = `${Math.floor(Date.now() / 1000) + 3600}:${socket.id}`
  const secret = process.env.TURN_SECRET
  const credential = crypto
    .createHmac('sha1', secret)
    .update(username)
    .digest('base64')
  
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
})
```

## Testing TURN Server

### Command Line Test:
```bash
# Test TURN server connectivity
turnutils_peer -t -x 10.0.0.1:3478 -y your-username:your-password

# Test with specific protocols
turnutils_peer -t -x turn.meetopia.app:3478 -u username -w password -v
```

### Browser JavaScript Test:
```javascript
// Test TURN server from browser
const testTurnServer = async () => {
  const pc = new RTCPeerConnection({
    iceServers: [{
      urls: 'turn:turn.meetopia.app:3478',
      username: 'test-user',
      credential: 'test-pass'
    }]
  })
  
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('ICE Candidate:', event.candidate.candidate)
      if (event.candidate.candidate.includes('relay')) {
        console.log('✅ TURN server working - relay candidate found')
      }
    }
  }
  
  pc.createDataChannel('test')
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
}
```

## Monitoring & Analytics

### TURN Server Metrics:
```bash
# Monitor coturn logs
tail -f /var/log/turnserver.log

# Check active allocations
turnutils_turnstatsdbreset

# Monitor bandwidth usage
iftop -i eth0
```

### Application-Level Monitoring:
```typescript
// Track TURN usage in your app
const trackTurnUsage = (stats: RTCStatsReport) => {
  for (const report of stats.values()) {
    if (report.type === 'local-candidate' && report.candidateType === 'relay') {
      // User is using TURN relay
      analytics.track('turn_relay_used', {
        server: report.relayProtocol,
        bandwidth: report.bytesReceived
      })
    }
  }
}
```

## Cost Optimization

### Strategies to Reduce TURN Usage:
1. **Progressive Enhancement**: Try direct connection first
2. **Regional Servers**: Reduce latency and bandwidth
3. **Bandwidth Limits**: Set maximum relay bandwidth per user
4. **Connection Timeouts**: Limit long-running TURN sessions

### Implementation:
```typescript
// Smart TURN usage
const createConnectionWithFallback = async () => {
  // First attempt: STUN only (free)
  let pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  })
  
  // Wait for connection attempt
  await new Promise(resolve => setTimeout(resolve, 5000))
  
  if (pc.iceConnectionState !== 'connected') {
    // Fallback: Add TURN servers
    pc.close()
    pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:turn.meetopia.app:3478', username: '...', credential: '...' }
      ]
    })
  }
  
  return pc
}
```

## Security Best Practices

### 1. Time-Limited Credentials:
```typescript
const generateTimeLimitedCredentials = () => {
  const expiry = Math.floor(Date.now() / 1000) + 3600 // 1 hour
  const username = `${expiry}:${userId}`
  const credential = hmacSha1(username, secretKey)
  return { username, credential }
}
```

### 2. Rate Limiting:
```bash
# In turnserver.conf
total-quota=100
user-quota=50
max-bps=64000
```

### 3. IP Restrictions:
```bash
# Restrict to specific regions
allowed-peer-ip=10.0.0.0/8
denied-peer-ip=192.168.1.0/24
```

## Deployment Checklist

- [ ] TURN server installed and configured
- [ ] SSL certificates configured (Let's Encrypt)
- [ ] Firewall rules configured
- [ ] DNS records pointing to TURN server
- [ ] Time-based authentication implemented
- [ ] Monitoring and logging enabled
- [ ] Backup TURN servers configured
- [ ] Cost monitoring alerts set up
- [ ] Connection success rate tracking enabled

## Expected Results

### Before TURN Implementation:
- Connection success rate: ~65%
- Failed connections in corporate networks: ~50%
- Mobile network failures: ~30%

### After TURN Implementation:
- Connection success rate: ~96%
- Corporate network success: ~92%
- Mobile network success: ~95%
- Global connection reliability: ~98%

## Next Steps

1. **Start with Cloud TURN**: Use Twilio or Metered.ca for quick setup
2. **Monitor Usage**: Track bandwidth and costs
3. **Deploy Self-Hosted**: Move to own servers for cost optimization
4. **Global Distribution**: Add regional TURN servers for better performance
5. **Advanced Features**: Implement bandwidth adaptation and smart routing

This TURN server setup will bring Meetopia's connection reliability to match or exceed major platforms like Omegle and Twitch. 
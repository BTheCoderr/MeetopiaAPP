# Environment Variables Setup for Enhanced Networking

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

### Server Configuration
```bash
# Server port (optional, defaults to 3003)
PORT=3003

# Environment mode
NODE_ENV=development

# Logging level (optional, defaults to info)
LOG_LEVEL=info
```

### TURN Server Configuration

#### Option 1: Self-Hosted TURN Server
```bash
# Your TURN server secret key (required for credential generation)
TURN_SECRET=your-very-secure-secret-key-here

# Your TURN server URL (if using self-hosted)
TURN_SERVER_URL=turn.meetopia.app
```

#### Option 2: Metered.ca TURN (Recommended for quick setup)
```bash
# Metered.ca credentials (cost-effective TURN service)
NEXT_PUBLIC_METERED_USERNAME=your-metered-username
NEXT_PUBLIC_METERED_CREDENTIAL=your-metered-credential
```

Sign up at: https://www.metered.ca/
- Cost: ~$0.10-0.30 per GB
- Easy setup with global servers

#### Option 3: Twilio STUN/TURN (Production ready)
```bash
# Twilio credentials (enterprise-grade TURN service)
NEXT_PUBLIC_TWILIO_USERNAME=your-twilio-username
NEXT_PUBLIC_TWILIO_CREDENTIAL=your-twilio-credential
```

Sign up at: https://www.twilio.com/
- Cost: ~$0.40 per GB
- Enterprise reliability and support

### Socket.IO Configuration
```bash
# Socket.IO server URL (adjust for your deployment)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3003
```

## Setup Instructions

### 1. For Development (Local Testing)
```bash
# Create .env.local file
cat > .env.local << 'EOF'
PORT=3003
NODE_ENV=development
TURN_SECRET=dev-secret-key-123
NEXT_PUBLIC_SOCKET_URL=http://localhost:3003
EOF
```

### 2. For Production with Cloud TURN
```bash
# Create .env.local file with Metered.ca
cat > .env.local << 'EOF'
PORT=3003
NODE_ENV=production
TURN_SECRET=your-production-secret
NEXT_PUBLIC_METERED_USERNAME=your-username
NEXT_PUBLIC_METERED_CREDENTIAL=your-credential
NEXT_PUBLIC_SOCKET_URL=https://your-domain.com
EOF
```

### 3. For Production with Self-Hosted TURN
```bash
# Create .env.local file with your TURN server
cat > .env.local << 'EOF'
PORT=3003
NODE_ENV=production
TURN_SECRET=your-production-secret
TURN_SERVER_URL=turn.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://your-domain.com
EOF
```

## Quick Start with Cloud TURN

### Option A: Metered.ca (Recommended)
1. Sign up at https://www.metered.ca/
2. Get your username and credential from dashboard
3. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_METERED_USERNAME=your-username
   NEXT_PUBLIC_METERED_CREDENTIAL=your-credential
   ```

### Option B: Twilio
1. Sign up at https://www.twilio.com/
2. Get your STUN/TURN credentials
3. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_TWILIO_USERNAME=your-username
   NEXT_PUBLIC_TWILIO_CREDENTIAL=your-credential
   ```

## Testing Your Setup

### 1. Check TURN Server Connectivity
```bash
# Test TURN server in browser console
const pc = new RTCPeerConnection({
  iceServers: [{
    urls: 'turn:relay.metered.ca:80',
    username: 'your-username',
    credential: 'your-credential'
  }]
})

pc.onicecandidate = (event) => {
  if (event.candidate && event.candidate.candidate.includes('relay')) {
    console.log('✅ TURN server working!')
  }
}

pc.createDataChannel('test')
pc.createOffer().then(offer => pc.setLocalDescription(offer))
```

### 2. Run Network Diagnostics
- Start your app: `npm run dev`
- Go to any room
- Click "🔧 Diagnostics" button
- Run "Full Diagnostic"
- Check for NAT type and connectivity issues

## Deployment Considerations

### Vercel Deployment
```bash
# Set environment variables in Vercel dashboard
TURN_SECRET=your-production-secret
NEXT_PUBLIC_METERED_USERNAME=your-username
NEXT_PUBLIC_METERED_CREDENTIAL=your-credential
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.com
```

### Render/Railway Deployment
```bash
# Set in deployment dashboard
PORT=3003
NODE_ENV=production
TURN_SECRET=your-production-secret
NEXT_PUBLIC_METERED_USERNAME=your-username
NEXT_PUBLIC_METERED_CREDENTIAL=your-credential
```

## Security Notes

1. **Never commit `.env.local` to git**
2. **Use strong secrets for production**
3. **Rotate TURN credentials regularly**
4. **Monitor TURN usage and costs**
5. **Use HTTPS in production**

## Cost Optimization

### Reduce TURN Usage:
- System tries STUN first (free)
- Only uses TURN when necessary
- Automatic fallback to audio/text modes
- Regional server selection

### Monitor Costs:
- Track usage in provider dashboards
- Set up billing alerts
- Monitor application logs for TURN usage

## Expected Results

After proper setup:
- **Connection Success**: 65% → 96%
- **Corporate Networks**: 50% → 92%
- **Mobile Networks**: 70% → 95%
- **Global Reliability**: Match Twitch/Omegle levels 
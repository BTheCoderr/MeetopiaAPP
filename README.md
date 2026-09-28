# Meetopia

Meetopia is a conversation-first social dating app for adults. Instead of swiping through profiles or relying on a compatibility score, two people meet live in a **Chemistry Check**, talk, and decide for themselves whether there is a vibe.

**Production frontend:** https://meetopia-live.netlify.app  
**Production signaling:** https://meetopia-signaling-v2.onrender.com

## Current product flow

1. Create an account or sign in.
2. Confirm that you are 18 or older.
3. Allow camera and microphone access.
4. Start a Chemistry Check.
5. Meet another available user on live video.
6. Chat, mute, turn the camera off, flip cameras, go full screen, report, block, leave, or move to the next person.
7. Tap **Vibe** if the conversation feels right.
8. A saved **Connection** is created only when both people Vibe.

## Core features

- Authenticated 18+ Chemistry Checks
- Random two-person matching
- WebRTC audio/video
- Socket.IO signaling
- In-call text chat and typing/read-state support
- Next-person matching
- Mutual Vibe detection
- Saved Connections
- Block and report flows
- Responsive mobile-first web UI
- FaceTime-style edge-to-edge call shell
- Front/rear camera switching
- Fullscreen/PWA support
- STUN/TURN fallback configuration

## Architecture

### Web app
- Next.js
- React
- Tailwind CSS
- Prisma
- Supabase Postgres
- Netlify

### Real-time/video
- Socket.IO signaling service on Render
- WebRTC peer-to-peer media
- Shared socket-auth secret between the web app and signaling service

### Data
- Users and sessions
- Adult confirmation
- Blocks and reports
- Vibes
- Connections

## Local development

Install the web dependencies:

```bash
npm install
```

Run the Next.js app and signaling server together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:next
npm run dev:server
```

The local web app defaults to `http://localhost:3000` and the local signaling server to `http://localhost:3003`.

Environment variables are documented in `.env.example` and `server/.env.example`.

## Production source of truth

- GitHub production branch: `main`
- Netlify production site: `meetopia-live`
- Render signaling service: `meetopia-signaling-v2`
- Supabase project: the dedicated Meetopia project configured in production environment variables

Legacy explicit-room WebRTC, old component showcase pages, public camera test pages, and abandoned Feed/Explore prototypes have been removed from the production code path.

## Product principle

**Talk first. Vibe after.**

The conversation is the profile.

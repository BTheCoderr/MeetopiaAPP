# Meetopia - Video Chat & Speed Dating App

Meetopia is a modern video chat and speed dating application that allows users to connect with others through video and text chat.

## Features

### 🎥 Video Chat
- Instant video connections with other users
- High-quality WebRTC video and audio
- Text chat alongside video

### ⏱️ Speed Dating Mode
- 3-minute timed rounds with automatic matching
- Perfect for meeting multiple people quickly
- Automatic transition to new matches when time expires

### 👀 Blind Date Feature
- Video starts blurred for the first 30 seconds
- Focus on conversation before seeing each other
- Creates a unique and exciting dating experience

### 🔄 Quick Next Match
- One-click to find a new match
- No waiting or swiping required
- Instant connections with new people

### 🛡️ Safety Features
- Report and block functionality
- Moderation system to prevent inappropriate behavior

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/meetopia.git
cd meetopia
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Start the signaling server
```bash
cd server
npm install
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## How to Use

1. **Start Matching**
   - Choose between Regular Chat or Speed Dating mode
   - Select Video Chat or Text Chat
   - Click "Start Matching Now"

2. **During a Match**
   - In Speed Dating mode, a 3-minute timer will count down
   - The first 30 seconds will have blurred video (Blind Date feature)
   - Use the chat box to send messages
   - Click "Next Match" at any time to find someone new

3. **Safety**
   - Use the "Report User" button if you encounter inappropriate behavior
   - Use the "Block User" button to prevent future matches with that person

## Technology Stack

- Next.js for the frontend
- Socket.IO for real-time communication
- WebRTC for peer-to-peer video
- Tailwind CSS for styling

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who have helped make Meetopia better
- Inspired by the need for meaningful connections in a digital world

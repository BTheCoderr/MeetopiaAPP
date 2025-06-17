# Daily.co Setup Guide for Meetopia

## Overview
This guide will help you set up Daily.co for real video calling functionality in your Meetopia mobile app.

## Current Status
✅ **Working Now**: Mock video calling with real camera preview  
🔄 **Next Step**: Connect to Daily.co for real peer-to-peer video calls

## What's Currently Working

1. **Real Camera Preview**: Your front-facing camera shows in the picture-in-picture window
2. **Mock Video Calls**: Simulated video call experience with UI/UX matching the web app
3. **Tutorial System**: Step-by-step tutorial matching the web app
4. **Light/Dark Mode**: Fully functional theme switching
5. **Navigation**: All screens properly connected

## Setting Up Daily.co (Optional - For Real Video Calls)

### Step 1: Get Daily.co API Key
1. Go to [Daily.co](https://www.daily.co/)
2. Sign up for a free account
3. Go to your Dashboard
4. Copy your API key

### Step 2: Configure Environment Variables
1. Create a `.env` file in your project root:
```bash
EXPO_PUBLIC_DAILY_API_KEY=your_actual_daily_api_key_here
```

### Step 3: Install Additional Dependencies (If Needed)
```bash
npm install @daily-co/react-native-daily-js @daily-co/react-native-webrtc --legacy-peer-deps
```

### Step 4: Update VideoCallScreen
Uncomment the Daily.co imports in `src/screens/VideoCallScreen.tsx` and enable real video calling.

## Current Mock Implementation

The app currently uses a **mock video calling system** that:
- Shows your real camera in the PiP window
- Simulates remote participants
- Provides all the UI/UX of real video calls
- Works without any API keys or external dependencies

## Features Working Right Now

### ✅ Home Screen
- Tutorial button (opens step-by-step guide)
- Light/Dark mode toggle (fully functional)
- Watch Demo button
- Explore Features navigation
- Create Profile navigation
- Start Video Chat navigation

### ✅ Tutorial System
- 9-step interactive tutorial
- Progress indicators
- Skip/Previous/Next navigation
- Matches web app content exactly

### ✅ Video Call Screen
- Real camera preview (front-facing)
- Mock remote participant simulation
- FaceTime-style UI
- Picture-in-picture controls
- Mute/unmute simulation
- Camera on/off toggle
- Call duration timer
- Professional action buttons

### ✅ Theme System
- Light/Dark mode toggle
- Dynamic colors throughout app
- Proper contrast ratios
- Smooth transitions

## Testing the App

1. **Tutorial**: Tap "? Tutorial" to see the step-by-step guide
2. **Light Mode**: Tap "☀ Light" to switch themes (should work immediately)
3. **Video Call**: Tap "Start Video Chat" to see the mock video call interface
4. **Camera**: Grant camera permissions to see your real camera in the PiP window

## Next Steps for Production

1. **Get Daily.co API Key**: Sign up at daily.co
2. **Add Environment Variables**: Configure your API key
3. **Enable Real Video Calls**: Uncomment Daily.co code
4. **Test with Multiple Devices**: Test real peer-to-peer calling
5. **Add Error Handling**: Handle network issues, permissions, etc.

## Troubleshooting

### Camera Not Working
- Make sure you granted camera permissions
- Try restarting the app
- Check if other apps can use your camera

### App Crashes
- Clear cache: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install --legacy-peer-deps`

### Daily.co Errors
- Check your API key is correct
- Verify your Daily.co account is active
- Check network connectivity

## Support

The app is currently fully functional for demo purposes. All UI/UX matches the web app, and the tutorial system works perfectly. The light/dark mode toggle should work immediately when you tap it.

For real video calling, follow the Daily.co setup steps above. 
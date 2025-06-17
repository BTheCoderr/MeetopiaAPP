# 🔧 Meetopia Mobile App - Troubleshooting Guide

## ✅ **Issues Fixed**

### **1. "Cannot determine which native SDK version" Error**
**Problem**: `ConfigError: Cannot determine which native SDK version your project uses because the module 'expo' is not installed.`

**Solution**: 
```bash
cd MeetopiaExpoApp
npm install expo
```

### **2. TypeScript Import Errors**
**Problem**: `Module has no exported member 'VideoCallService'`

**Solution**: Services are exported as default exports (singletons):
```typescript
// ✅ Correct
import VideoCallService from '../services/VideoCallService';
import ChatService from '../services/ChatService';
import MatchingService from '../services/MatchingService';

// ❌ Incorrect
import {VideoCallService} from '../services/VideoCallService';
```

### **3. "testAllServices" Not Found Error**
**Problem**: `'"../test/ServicesTest"' has no exported member named 'testAllServices'`

**Solution**: The function is named `testServices`:
```typescript
// ✅ Correct
import {testServices} from '../test/ServicesTest';

// ❌ Incorrect
import {testAllServices} from '../test/ServicesTest';
```

### **4. Animated.fadeOut/fadeIn Not Found**
**Problem**: `Property 'fadeOut' does not exist on type 'typeof Animated'`

**Solution**: Use `Animated.timing()` instead:
```typescript
// ✅ Correct
Animated.timing(fadeAnim, {
  toValue: 0,
  duration: 300,
  useNativeDriver: true,
}).start();

// ❌ Incorrect
Animated.fadeOut(fadeAnim, {...});
```

---

## 🚨 **Common Issues & Solutions**

### **Metro Bundler Issues**

#### **Clear Cache**
```bash
npx expo start --clear
# or
npx react-native start --reset-cache
```

#### **Node Modules Issues**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### **TypeScript Compilation Issues**

#### **Check TypeScript Configuration**
```bash
npx tsc --noEmit
```

#### **Fix Import Paths**
Make sure all import paths are correct:
```typescript
// Screens
import HomeScreen from './src/screens/HomeScreen';

// Services  
import VideoCallService from './src/services/VideoCallService';

// Components
import TabBarIcon from './src/components/TabBarIcon';
```

### **Expo Go Connection Issues**

#### **Network Issues**
- Ensure phone and computer are on same WiFi network
- Check firewall settings
- Try using tunnel mode: `npx expo start --tunnel`

#### **QR Code Not Working**
- Try typing the URL manually in Expo Go
- Use development build instead of Expo Go
- Check if port 8081 is available

### **Build Issues**

#### **EAS Build Errors**
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Create build
eas build --platform ios
eas build --platform android
```

#### **Missing Dependencies**
```bash
# Install all required dependencies
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-safe-area-context react-native-screens @react-native-async-storage/async-storage socket.io-client react-native-gesture-handler react-native-reanimated
```

---

## 🔍 **Debugging Tips**

### **1. Check Console Logs**
- Open browser developer tools when testing on web
- Use React Native Debugger for mobile debugging
- Check Expo Go logs on device

### **2. Service Testing**
```typescript
// Test services individually
import {testServices, testVideoCallFeatures, testChatFeatures, testMatchingFeatures} from './src/test/ServicesTest';

// Run tests
await testServices();
testVideoCallFeatures();
await testChatFeatures();
await testMatchingFeatures();
```

### **3. Navigation Debugging**
```typescript
// Add navigation logging
const navigation = useNavigation();

const navigateWithLog = (screen: string) => {
  console.log('Navigating to:', screen);
  navigation.navigate(screen);
};
```

### **4. State Debugging**
```typescript
// Add state logging
const [testResults, setTestResults] = useState<string>('');

useEffect(() => {
  console.log('Test results updated:', testResults);
}, [testResults]);
```

---

## 📱 **Device-Specific Issues**

### **iOS Issues**

#### **Simulator Not Working**
```bash
# Install iOS Simulator
npx expo install --ios

# Run on iOS simulator
npx expo run:ios
```

#### **Physical Device Issues**
- Ensure iOS device is on same network
- Check iOS version compatibility
- Try using development build

### **Android Issues**

#### **Emulator Not Working**
```bash
# Install Android emulator
npx expo install --android

# Run on Android emulator
npx expo run:android
```

#### **Physical Device Issues**
- Enable Developer Options
- Enable USB Debugging
- Check Android version compatibility

---

## 🌐 **Web Testing Issues**

### **Web Build Errors**
```bash
# Test web build
npx expo export:web

# Serve web build locally
npx serve web-build
```

### **Browser Compatibility**
- Test in Chrome, Firefox, Safari
- Check for WebRTC support
- Verify Socket.IO connection

---

## 🔧 **Performance Issues**

### **Slow Loading**
```bash
# Optimize bundle
npx expo export --dump-sourcemap

# Analyze bundle size
npx react-native-bundle-visualizer
```

### **Memory Issues**
- Check for memory leaks in services
- Properly cleanup Socket.IO connections
- Use React.memo for expensive components

---

## 📞 **Getting Help**

### **1. Check Logs**
- Expo CLI logs
- Device logs (Expo Go)
- Browser console (web testing)
- Metro bundler logs

### **2. Common Commands**
```bash
# Start fresh
npx expo start --clear

# Check dependencies
npm ls

# Update Expo
npx expo install --fix

# Check Expo doctor
npx expo doctor
```

### **3. Resources**
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Docs](https://reactnavigation.org/)
- [React Native Docs](https://reactnative.dev/)
- [Socket.IO Docs](https://socket.io/docs/)

---

## ✅ **Success Checklist**

- [ ] `npx tsc --noEmit` returns 0 errors
- [ ] `npx expo start` runs without errors
- [ ] QR code appears and is scannable
- [ ] App loads in Expo Go
- [ ] All navigation works
- [ ] Services test successfully
- [ ] No console errors

**Your Meetopia mobile app should now be running perfectly! 🎉** 
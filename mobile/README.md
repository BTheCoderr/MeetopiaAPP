# Meetopia Mobile App

A React Native mobile application for video calling and speed dating, designed for iOS and Android app stores.

## Features

- 🎥 **HD Video Calling** - High-quality video calls with WebRTC
- 💝 **Smart Matching** - AI-powered compatibility matching
- 💬 **Real-time Chat** - Instant messaging with multimedia support
- 🎨 **Modern UI** - Beautiful, responsive design with dark/light themes
- 🔒 **Secure Authentication** - JWT-based user authentication
- 📱 **Cross-platform** - Works on both iOS and Android
- 🌐 **Offline Support** - Basic functionality works offline
- 🔔 **Push Notifications** - Real-time notifications for matches and messages

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **React Native CLI** (`npm install -g @react-native-community/cli`)
- **Xcode** (for iOS development, macOS only)
- **Android Studio** (for Android development)
- **CocoaPods** (for iOS dependencies: `sudo gem install cocoapods`)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MeetopiaAPP-main/mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Android Setup**
   - Open Android Studio
   - Open the `android` folder
   - Let Gradle sync complete

## Development

### Running the App

1. **Start Metro bundler**
   ```bash
   npm start
   ```

2. **Run on iOS** (macOS only)
   ```bash
   npm run ios
   ```

3. **Run on Android**
   ```bash
   npm run android
   ```

### Environment Configuration

Create a `.env` file in the mobile directory:

```env
API_BASE_URL=https://your-api-server.com
SOCKET_URL=wss://your-socket-server.com
DAILY_API_KEY=your-daily-co-api-key
FIREBASE_API_KEY=your-firebase-api-key
```

## Building for Production

### Android (Google Play Store)

1. **Generate a signing key**
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore meetopia-upload-key.keystore -alias meetopia-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure signing in `android/gradle.properties`**
   ```properties
   MYAPP_UPLOAD_STORE_FILE=meetopia-upload-key.keystore
   MYAPP_UPLOAD_KEY_ALIAS=meetopia-key-alias
   MYAPP_UPLOAD_STORE_PASSWORD=your-store-password
   MYAPP_UPLOAD_KEY_PASSWORD=your-key-password
   ```

3. **Build release APK**
   ```bash
   npm run build:android
   ```

4. **Generate AAB for Play Store**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

### iOS (App Store)

1. **Open Xcode**
   ```bash
   open ios/MeetopiaApp.xcworkspace
   ```

2. **Configure signing**
   - Select your development team
   - Set bundle identifier (e.g., `com.yourcompany.meetopia`)
   - Configure provisioning profiles

3. **Archive for App Store**
   - Product → Archive
   - Upload to App Store Connect

## App Store Submission

### Google Play Store

1. **Create Play Console account**
2. **Upload AAB file** (`android/app/build/outputs/bundle/release/app-release.aab`)
3. **Fill app information**:
   - Title: "Meetopia - Video Dating & Chat"
   - Description: "Connect with amazing people through HD video calls and smart matching"
   - Category: Social
   - Content rating: Teen (13+)
4. **Add screenshots** (phone, tablet, TV if applicable)
5. **Set pricing** (Free with in-app purchases)
6. **Submit for review**

### Apple App Store

1. **Create App Store Connect account**
2. **Create new app** in App Store Connect
3. **Upload build** via Xcode or Application Loader
4. **Fill app information**:
   - Name: "Meetopia - Video Dating & Chat"
   - Subtitle: "HD Video Calls & Smart Matching"
   - Category: Social Networking
   - Age Rating: 17+ (due to dating features)
5. **Add screenshots** (iPhone, iPad if applicable)
6. **Set pricing** (Free with in-app purchases)
7. **Submit for review**

## Key Features Implementation

### Video Calling
- Uses `react-native-webrtc` for peer-to-peer video calls
- Supports camera switching, mute/unmute, speaker toggle
- Screen sharing capabilities
- Virtual backgrounds

### Smart Matching
- AI-powered compatibility scoring
- Location-based matching
- Interest and preference filtering
- Real-time match notifications

### Authentication
- JWT-based secure authentication
- Social login integration (Google, Apple)
- Biometric authentication support
- Secure token storage

### Real-time Features
- Socket.IO for real-time messaging
- Push notifications via Firebase
- Live typing indicators
- Online/offline status

## Performance Optimization

- **Code splitting** with React.lazy()
- **Image optimization** with react-native-fast-image
- **Memory management** for video streams
- **Background task handling**
- **Offline data caching**

## Security Features

- **End-to-end encryption** for messages
- **Secure video transmission**
- **User verification** system
- **Report and block** functionality
- **Privacy controls**

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests (if configured)
npm run test:e2e

# Run linting
npm run lint
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android build issues**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

### Performance Issues

- Check for memory leaks in video components
- Optimize image sizes and formats
- Use FlatList for large lists
- Implement proper cleanup in useEffect hooks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@meetopia.com or create an issue in the repository.

---

**Ready to launch your video dating app!** 🚀

The mobile app is fully configured for both iOS and Android app stores with all necessary permissions, build configurations, and deployment scripts. 
# Meetopia Mobile App - Deployment Guide

This guide walks you through deploying the Meetopia mobile app to both Google Play Store and Apple App Store.

## 🚀 Quick Start

1. **Run the setup script**
   ```bash
   ./scripts/setup.sh
   ```

2. **Update environment variables** in `.env`

3. **Add your app icons** and assets

4. **Configure signing** for production builds

5. **Build and deploy** to app stores

## 📱 App Store Requirements

### App Information
- **Name**: Meetopia - Video Dating & Chat
- **Subtitle**: HD Video Calls & Smart Matching
- **Description**: Connect with amazing people through high-quality video calls and AI-powered smart matching. Find your perfect match with Meetopia's advanced compatibility algorithm.
- **Keywords**: video dating, video chat, speed dating, matching, social, relationships
- **Category**: Social Networking
- **Age Rating**: 17+ (due to dating features)

### Required Assets

#### App Icons
- **iOS**: 1024x1024px (App Store), various sizes for device
- **Android**: 512x512px (Play Store), various densities

#### Screenshots
- **iPhone**: 6.7", 6.5", 5.5" displays
- **iPad**: 12.9", 11" displays (if supporting iPad)
- **Android**: Phone and tablet screenshots

#### Feature Graphic (Android)
- **Size**: 1024x500px
- **Content**: Showcase video calling and matching features

## 🤖 Android Deployment (Google Play Store)

### 1. Prepare for Release

1. **Update version in `android/app/build.gradle`**
   ```gradle
   defaultConfig {
       versionCode 1
       versionName "1.0.0"
   }
   ```

2. **Generate signing key**
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore meetopia-upload-key.keystore -alias meetopia-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

3. **Configure signing in `android/gradle.properties`**
   ```properties
   MYAPP_UPLOAD_STORE_FILE=meetopia-upload-key.keystore
   MYAPP_UPLOAD_KEY_ALIAS=meetopia-key-alias
   MYAPP_UPLOAD_STORE_PASSWORD=your-store-password
   MYAPP_UPLOAD_KEY_PASSWORD=your-key-password
   ```

### 2. Build Release

1. **Clean and build**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew bundleRelease
   ```

2. **Locate the AAB file**
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```

### 3. Google Play Console Setup

1. **Create Developer Account** ($25 one-time fee)
2. **Create New App**
   - App name: "Meetopia - Video Dating & Chat"
   - Default language: English (US)
   - App or game: App
   - Free or paid: Free

3. **App Content**
   - Privacy Policy: Required (create one)
   - App Access: All functionality available without restrictions
   - Content Rating: Complete questionnaire (likely Teen 13+)
   - Target Audience: 18+ (dating app)
   - News App: No

4. **Store Listing**
   - Short description (80 chars): "HD video dating with smart AI matching"
   - Full description (4000 chars): Detailed app description
   - App icon: 512x512px
   - Feature graphic: 1024x500px
   - Screenshots: At least 2, up to 8

5. **Release**
   - Upload AAB file
   - Release notes
   - Submit for review

### 4. App Permissions Explanation

When submitting, explain these permissions:
- **Camera**: For video calls and profile photos
- **Microphone**: For video calls and voice messages
- **Storage**: For saving photos and app data
- **Network**: For video calls and messaging
- **Location**: For location-based matching (optional)

## 🍎 iOS Deployment (Apple App Store)

### 1. Xcode Configuration

1. **Open project**
   ```bash
   open ios/MeetopiaApp.xcworkspace
   ```

2. **Configure Bundle Identifier**
   - Select project → Target → General
   - Bundle Identifier: `com.yourcompany.meetopia`

3. **Configure Signing**
   - Team: Select your Apple Developer team
   - Provisioning Profile: Automatic or manual

4. **Update Info.plist**
   - Display Name: "Meetopia"
   - Bundle Version: "1"
   - Bundle Version String: "1.0.0"

### 2. App Store Connect Setup

1. **Create App Store Connect Account** ($99/year)
2. **Create New App**
   - Platform: iOS
   - Name: "Meetopia - Video Dating & Chat"
   - Bundle ID: Match your Xcode bundle identifier
   - SKU: Unique identifier
   - User Access: Full Access

3. **App Information**
   - Subtitle: "HD Video Calls & Smart Matching"
   - Category: Social Networking
   - Secondary Category: Lifestyle
   - Content Rights: Check if you own rights

4. **Pricing and Availability**
   - Price: Free
   - Availability: All countries (or select specific)

### 3. Build and Upload

1. **Archive in Xcode**
   - Product → Archive
   - Wait for build to complete

2. **Upload to App Store**
   - Window → Organizer
   - Select archive → Distribute App
   - App Store Connect → Upload
   - Follow prompts

3. **App Store Connect Review**
   - Select uploaded build
   - Add app metadata
   - Screenshots and descriptions
   - Submit for review

### 4. App Review Information

Provide this information for Apple review:
- **Demo Account**: Create test account with sample data
- **Review Notes**: Explain video calling features, matching algorithm
- **Contact Information**: Your support email and phone

## 🔧 Pre-Submission Checklist

### Technical Requirements
- [ ] App builds without errors
- [ ] All features work on physical devices
- [ ] Video calling works properly
- [ ] Push notifications configured
- [ ] Crash-free for at least 95% of sessions
- [ ] App size under platform limits (150MB initial download)

### Content Requirements
- [ ] Privacy policy created and linked
- [ ] Terms of service created
- [ ] Age-appropriate content rating
- [ ] All text localized if supporting multiple languages
- [ ] Accessibility features implemented

### Store Requirements
- [ ] App icons in all required sizes
- [ ] Screenshots for all supported devices
- [ ] App description written and optimized
- [ ] Keywords researched and included
- [ ] Feature graphic created (Android)

## 📊 Post-Launch Monitoring

### Analytics Setup
- **Firebase Analytics**: User behavior tracking
- **Crashlytics**: Crash reporting
- **Performance Monitoring**: App performance metrics

### Key Metrics to Track
- **User Acquisition**: Downloads, installs
- **User Engagement**: Daily/Monthly active users
- **Feature Usage**: Video calls, matches, messages
- **Technical Metrics**: Crash rate, load times
- **Business Metrics**: User retention, conversion rates

### App Store Optimization (ASO)
- **Monitor Rankings**: Track keyword rankings
- **A/B Test**: Screenshots, descriptions, icons
- **Update Regularly**: New features, bug fixes
- **Respond to Reviews**: Engage with user feedback

## 🚨 Common Issues and Solutions

### Android Issues
1. **Build Failures**
   - Clean project: `./gradlew clean`
   - Check Java version compatibility
   - Update Android SDK tools

2. **Signing Issues**
   - Verify keystore path and passwords
   - Check gradle.properties configuration
   - Ensure keystore is not corrupted

### iOS Issues
1. **Provisioning Profile Issues**
   - Refresh profiles in Xcode
   - Check Apple Developer account status
   - Verify bundle identifier matches

2. **Archive Failures**
   - Clean build folder: Product → Clean Build Folder
   - Check for code signing issues
   - Verify all dependencies are compatible

### General Issues
1. **App Rejection**
   - Review rejection reasons carefully
   - Fix issues and resubmit
   - Contact app store support if needed

2. **Performance Issues**
   - Optimize images and assets
   - Implement lazy loading
   - Monitor memory usage

## 📞 Support and Resources

### Documentation
- [React Native Docs](https://reactnative.dev/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)

### Community
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

### Professional Services
- App store optimization consultants
- Mobile app marketing agencies
- React Native development services

---

## 🎉 Congratulations!

You're now ready to launch Meetopia on both app stores! Remember:

1. **Test thoroughly** on real devices
2. **Follow platform guidelines** strictly
3. **Prepare for review process** (can take 1-7 days)
4. **Plan your launch strategy** and marketing
5. **Monitor and iterate** based on user feedback

Good luck with your app launch! 🚀 
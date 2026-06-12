import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Meetopia',
  slug: 'meetopia',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'meetopia',
  userInterfaceStyle: 'dark',
  newArchEnabled: false,
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#000000',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.baheemferrell.meetopia',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription:
        'Meetopia uses your camera for live video Chemistry Checks with other members.',
      NSMicrophoneUsageDescription:
        'Meetopia uses your microphone so you can talk during video dates and meetings.',
    },
  },
  android: {
    package: 'com.baheemferrell.meetopia',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#000000',
    },
    permissions: ['CAMERA', 'RECORD_AUDIO', 'MODIFY_AUDIO_SETTINGS', 'INTERNET', 'ACCESS_NETWORK_STATE'],
  },
  plugins: [
    'expo-router',
    'expo-asset',
    'expo-font',
    [
      '@config-plugins/react-native-webrtc',
      {
        cameraPermission: 'Meetopia needs camera access for video Chemistry Checks.',
        microphonePermission: 'Meetopia needs microphone access for voice during video chat.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      // Run `eas init` and replace before cloud builds
      projectId: 'REPLACE_WITH_EAS_PROJECT_ID',
    },
    socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:3003',
  },
})

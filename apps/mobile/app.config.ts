import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Meetopia',
  owner: 'bferrell514',
  slug: 'meetopia-app',
  version: '1.0',
  orientation: 'portrait',
  scheme: 'meetopia',
  platforms: ['ios', 'android'],
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
    bundleIdentifier: 'com.meetopia.app',
    buildNumber: '16',
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLName: 'com.meetopia.app',
          CFBundleURLSchemes: ['meetopia'],
        },
        {
          CFBundleURLName: 'expo-development-client',
          CFBundleURLSchemes: ['exp+meetopia-app'],
        },
      ],
      NSCameraUsageDescription:
        'Meetopia uses your camera for live video Chemistry Checks with other members.',
      NSMicrophoneUsageDescription:
        'Meetopia uses your microphone so you can talk during video dates and meetings.',
    },
  },
  android: {
    package: 'com.meetopia.app',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#000000',
    },
    permissions: ['CAMERA', 'RECORD_AUDIO', 'MODIFY_AUDIO_SETTINGS', 'INTERNET', 'ACCESS_NETWORK_STATE'],
  },
  plugins: [
    'expo-dev-client',
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
      projectId: '37e69074-d079-4c60-a3c4-5d468645bcf1',
    },
    socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:3003',
  },
})

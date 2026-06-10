import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Meetopia',
  slug: 'meetopia',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'meetopia',
  userInterfaceStyle: 'dark',
  newArchEnabled: false,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.meetopia.app',
    infoPlist: {
      NSCameraUsageDescription:
        'Meetopia needs camera access for video chat with other users.',
      NSMicrophoneUsageDescription:
        'Meetopia needs microphone access for voice during video chat.',
    },
  },
  android: {
    package: 'com.meetopia.app',
    permissions: [
      'CAMERA',
      'RECORD_AUDIO',
      'MODIFY_AUDIO_SETTINGS',
      'INTERNET',
      'ACCESS_NETWORK_STATE',
    ],
  },
  plugins: [
    'expo-router',
    [
      'react-native-webrtc',
      {
        cameraPermission: 'Allow Meetopia to access your camera for video chat.',
        microphonePermission: 'Allow Meetopia to access your microphone for video chat.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'REPLACE_WITH_EAS_PROJECT_ID',
    },
    socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:3003',
  },
})

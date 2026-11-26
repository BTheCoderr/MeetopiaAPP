import { ExpoConfig, ConfigContext } from 'expo/config'

const IS_STAGING = process.env.MEETOPIA_DEPLOY_ENV === 'staging'

if (IS_STAGING) {
  if (process.env.EXPO_PUBLIC_STAGING !== 'true') {
    throw new Error('Staging Expo build requires EXPO_PUBLIC_STAGING=true.')
  }
  for (const [key, value, liveHost] of [
    ['EXPO_PUBLIC_API_URL', process.env.EXPO_PUBLIC_API_URL, 'meetopia-live.netlify.app'],
    ['EXPO_PUBLIC_SOCKET_URL', process.env.EXPO_PUBLIC_SOCKET_URL, 'meetopia-signaling-v2.onrender.com'],
  ]) {
    if (!value) throw new Error(`Staging build requires ${key}; refusing production fallback.`)
    let url: URL
    try { url = new URL(value) } catch { throw new Error(`Invalid staging ${key}.`) }
    if (url.protocol !== 'https:' || url.hostname === liveHost || url.hostname === 'localhost') {
      throw new Error(`Refusing staging build with a live/insecure ${key}.`)
    }
  }
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_STAGING ? 'Meetopia Staging' : 'Meetopia',
  owner: 'bferrell514',
  slug: 'meetopia-app',
  version: '1.0',
  orientation: 'portrait',
  scheme: IS_STAGING ? 'meetopia-staging' : 'meetopia',
  platforms: ['ios', 'android'],
  userInterfaceStyle: 'dark',
  icon: './assets/icon.png',
  ios: {
    supportsTablet: true,
    bundleIdentifier: IS_STAGING ? 'com.meetopia.app.staging' : 'com.meetopia.app',
    buildNumber: IS_STAGING ? '1' : '18',
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLName: IS_STAGING ? 'com.meetopia.app.staging' : 'com.meetopia.app',
          CFBundleURLSchemes: [IS_STAGING ? 'meetopia-staging' : 'meetopia'],
        },
        {
          CFBundleURLName: 'expo-development-client',
          CFBundleURLSchemes: ['exp+meetopia-app'],
        },
      ],
      ITSAppUsesNonExemptEncryption: false,
      NSCameraUsageDescription:
        'Meetopia uses your camera for live video Chemistry Checks with other members.',
      NSMicrophoneUsageDescription:
        'Meetopia uses your microphone so you can talk during video dates and meetings.',
      NSBluetoothAlwaysUsageDescription:
        'Meetopia uses Bluetooth so you can use a headset during video Chemistry Checks.',
    },
  },
  android: {
    package: IS_STAGING ? 'com.meetopia.app.staging' : 'com.meetopia.app',
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
    'expo-status-bar',
    'expo-asset',
    'expo-font',
    [
      '@config-plugins/react-native-webrtc',
      {
        cameraPermission: 'Meetopia uses your camera for live video Chemistry Checks with other members.',
        microphonePermission: 'Meetopia uses your microphone so you can talk during video dates and meetings.',
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
    socketUrl: IS_STAGING ? process.env.EXPO_PUBLIC_SOCKET_URL : (process.env.EXPO_PUBLIC_SOCKET_URL ?? 'https://meetopia-signaling-v2.onrender.com'),
  },
})

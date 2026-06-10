import Constants from 'expo-constants'

const STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export function getIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [...STUN_SERVERS]
  const turnUrl = process.env.EXPO_PUBLIC_TURN_URL
  const turnUser = process.env.EXPO_PUBLIC_TURN_USERNAME
  const turnCred = process.env.EXPO_PUBLIC_TURN_CREDENTIAL
  if (turnUrl && turnUser && turnCred) {
    servers.push({ urls: turnUrl, username: turnUser, credential: turnCred })
  }
  return servers
}

export const fallbackConfigurations: RTCConfiguration[] = [
  { iceServers: getIceServers(), iceCandidatePoolSize: 10 },
  { iceServers: getIceServers().slice(0, 2), iceCandidatePoolSize: 5 },
]

export function getSocketUrl(): string {
  return (
    process.env.EXPO_PUBLIC_SOCKET_URL ??
    (Constants.expoConfig?.extra?.socketUrl as string | undefined) ??
    'http://localhost:3003'
  )
}

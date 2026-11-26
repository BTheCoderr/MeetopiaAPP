import { useEffect, useRef } from 'react'
import { Alert, AppState } from 'react-native'
import { Stack, usePathname, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { accountStatus } from '@/lib/auth'
import { currentProduct } from '@/lib/currentProduct'
import { getAuthenticatedSocket } from '@/lib/socket'

export default function RootLayout() {
  const router = useRouter()
  const path = usePathname()
  const latestInvite = useRef<string | null>(null)

  useEffect(() => {
    if (path.startsWith('/auth/') || path === '/onboarding/age-gate') return
    let active = true
    let interval: ReturnType<typeof setInterval> | null = null
    let subscription: { remove: () => void } | null = null
    const beat = () => { void currentProduct.presence.touch().catch(() => {}) }
    void accountStatus().then(({ adultConfirmed }) => {
      if (!active || !adultConfirmed) return
      beat()
      interval = setInterval(() => {
        if (active && AppState.currentState === 'active') beat()
      }, 45_000)
      subscription = AppState.addEventListener('change', state => {
        if (state === 'active') beat()
      })
    }).catch(() => {})
    return () => { active = false; if (interval) clearInterval(interval); subscription?.remove() }
  }, [path])

  useEffect(() => {
    // Listen throughout the authenticated app, not only on its home screen.
    // Unauthenticated onboarding screens do not open a realtime connection.
    if (path.startsWith('/auth/') || path === '/onboarding/age-gate') return
    let active = true
    let unsubscribe: (() => void) | null = null
    void accountStatus().then(({ adultConfirmed }) => {
      if (!active || !adultConfirmed) return null
      return getAuthenticatedSocket()
    }).then(socket => {
      if (!socket || !active) return
      const onIncoming = (invite: {
        inviteId?: string; connectionId?: string; callerDisplayName?: string; expiresAt?: number
      }) => {
        if (!active || !invite.inviteId || !invite.connectionId) return
        if (invite.inviteId === latestInvite.current) return
        if (typeof invite.expiresAt === 'number' && invite.expiresAt <= Date.now()) return
        latestInvite.current = invite.inviteId
        Alert.alert('Incoming Connection call',
          `${invite.callerDisplayName || 'Your Connection'} wants to video chat.`, [
            { text: 'Decline', style: 'cancel', onPress: () => socket.emit('decline-connection-call', { inviteId: invite.inviteId }) },
            { text: 'Answer', onPress: () => router.push({ pathname: '/chat/video', params: {
              connectionId: invite.connectionId!, incomingCallId: invite.inviteId!,
            } }) },
          ])
      }
      socket.on('incoming-connection-call', onIncoming)
      unsubscribe = () => socket.off('incoming-connection-call', onIncoming)
    }).catch(() => {
      // HTTP screens still work if the signaling service is offline.
    })
    return () => { active = false; unsubscribe?.() }
  }, [path, router])

  return <SafeAreaProvider>
    <StatusBar style="light" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }} />
  </SafeAreaProvider>
}

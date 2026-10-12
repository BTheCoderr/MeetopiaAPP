import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { Stack, usePathname, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { getSessionId } from '@/lib/session'
import { isAgeVerified } from '@/lib/onboardingStorage'
import { colors } from '@/theme/theme'

export default function RootLayout() {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const [sessionId, ageOk] = await Promise.all([getSessionId(), isAgeVerified()])
      if (cancelled) return
      const onAuth = pathname.startsWith('/auth')
      const onAge = pathname.startsWith('/onboarding/age-gate')
      if (!sessionId && !onAuth) {
        router.replace('/auth/signin')
      } else if (sessionId && !ageOk && !onAge && !onAuth) {
        router.replace('/onboarding/age-gate')
      }
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [pathname, router])

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }} />
      {!ready ? (
        <View
          style={{
            ...{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
            backgroundColor: colors.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color="#fff" />
        </View>
      ) : null}
    </SafeAreaProvider>
  )
}

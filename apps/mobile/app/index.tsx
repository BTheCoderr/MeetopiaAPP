import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import Screen from '@/components/ui/Screen'
import Brandmark from '@/components/ui/Brandmark'
import GradientButton from '@/components/ui/GradientButton'
import { accountStatus, isAuthFailure } from '@/lib/auth'
import { currentProduct } from '@/lib/currentProduct'
import { colors, spacing } from '@/theme/theme'

export default function HomeScreen() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useFocusEffect(useCallback(() => {
    let active = true
    setReady(false)
    setError(null)
    void accountStatus().then(async ({ account, adultConfirmed }) => {
      if (!active) return
      if (!adultConfirmed) {
        router.replace('/onboarding/age-gate')
        return
      }
      const passport = await currentProduct.passport.get()
      if (!active) return
      if (!passport.complete) { router.replace('/onboarding/passport'); return }
      setName(account.name || account.username)
      setReady(true)
    }).catch(cause => {
      if (!active) return
      if (isAuthFailure(cause)) {
        router.replace('/auth/signin')
      } else {
        setError(cause instanceof Error ? cause.message : 'Could not connect to Meetopia.')
      }
    })
    return () => { active = false }
  }, [router, attempt]))

  if (!ready) return <Screen center>
    {error ? <>
      <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
      <Pressable onPress={() => setAttempt(n => n + 1)} style={styles.retry}><Text style={styles.retryText}>Retry</Text></Pressable>
    </> : <ActivityIndicator color={colors.brandPurple} />}
  </Screen>

  return <Screen center scroll>
    <View style={styles.hero}><Brandmark size={80} /></View>
    <Text style={styles.headline}>Find your chemistry.</Text>
    <Text style={styles.subtext}>Choose your Chemistry Passport, accept an introduction together, and discover your connection on video. Only mutual Vibes become lasting Connections.</Text>
    <Text style={styles.welcome}>Signed in as {name}</Text>
    <View style={styles.actions}>
      <GradientButton label="Start live Chemistry Check" onPress={() => router.push('/chat/video')} />
      <GradientButton label="My Connections" variant="outline" onPress={() => router.push('/connections')} style={styles.spaced} />
    </View>
    <View style={styles.links}>
      <Pressable onPress={() => router.push('/settings')} hitSlop={8}><Text style={styles.link}>Settings and safety</Text></Pressable>
    </View>
    <View style={styles.safety}><Text style={styles.safetyText}>For adults 18+. A real match requires another available person. Report, block and leave controls are available during calls.</Text></View>
  </Screen>
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  headline: { fontSize: 30, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', letterSpacing: -0.5, lineHeight: 36 },
  subtext: { color: colors.textSecondary, fontSize: 16, textAlign: 'center', marginTop: spacing.md, lineHeight: 23 },
  welcome: { color: colors.brandBlueLight, marginTop: spacing.md, fontSize: 14, textAlign: 'center' },
  actions: { marginTop: spacing.xxl, width: '100%' },
  spaced: { marginTop: spacing.md },
  links: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  link: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  safety: { marginTop: spacing.xxl, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14 },
  safetyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
  error: { color: colors.danger, fontSize: 15, textAlign: 'center', padding: spacing.lg },
  retry: { backgroundColor: colors.brandPurple, borderRadius: 14, padding: 14, marginTop: spacing.md },
  retryText: { color: '#fff', fontWeight: '800', textAlign: 'center' },
})

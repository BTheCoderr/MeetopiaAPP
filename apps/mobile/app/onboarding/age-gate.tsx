import { useState } from 'react'
import { View, Text, StyleSheet, Switch, Pressable, Linking, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { accountAuth, isAuthFailure } from '@/lib/auth'
import { PUBLIC_LINKS } from '@/config/links'
import Screen from '@/components/ui/Screen'
import Brandmark from '@/components/ui/Brandmark'
import { colors, spacing } from '@/theme/theme'

export default function AgeGateScreen() {
  const router = useRouter()
  const [confirmed, setConfirmed] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onContinue = async () => {
    if (!confirmed || working) return
    setWorking(true)
    setError(null)
    try {
      const result = await accountAuth.confirmAdult()
      if (!result.confirmed) throw new Error('We could not save your age confirmation.')
      router.replace('/onboarding/passport')
    } catch (cause) {
      if (isAuthFailure(cause)) router.replace('/auth/signin')
      else setError(cause instanceof Error ? cause.message : 'Could not confirm your age.')
    } finally {
      setWorking(false)
    }
  }

  const open = (url: string) => { void Linking.openURL(url).catch(() => {}) }

  return <Screen center scroll>
    <View style={styles.hero}><Brandmark size={72} /></View>
    <Text style={styles.title}>Meetopia is for adults 18+</Text>
    <Text style={styles.subtitle}>Meetopia connects adults for live video Chemistry Checks. Please confirm you are 18 or older before meeting anyone.</Text>
    <View style={styles.card}>
      <Pressable style={styles.row} onPress={() => setConfirmed(v => !v)}>
        <Switch value={confirmed} onValueChange={setConfirmed} trackColor={{ true: colors.brandPurple, false: 'rgba(255,255,255,0.2)' }} thumbColor="#fff" />
        <Text style={styles.rowLabel}>I confirm that I am 18 years or older and agree to follow Meetopia's Community Guidelines.</Text>
      </Pressable>
    </View>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    <Pressable accessibilityRole="button" disabled={!confirmed || working} style={[styles.cta, (!confirmed || working) && styles.disabled]} onPress={() => void onContinue()}>
      {working ? <ActivityIndicator color="white" /> : <Text style={styles.ctaText}>Continue to Meetopia</Text>}
    </Pressable>
    <View style={styles.legal}>
      <Pressable onPress={() => open(PUBLIC_LINKS.terms)} hitSlop={6}><Text style={styles.legalLink}>Terms</Text></Pressable>
      <Text style={styles.legalDot}>·</Text>
      <Pressable onPress={() => open(PUBLIC_LINKS.privacy)} hitSlop={6}><Text style={styles.legalLink}>Privacy</Text></Pressable>
      <Text style={styles.legalDot}>·</Text>
      <Pressable onPress={() => open(PUBLIC_LINKS.communityGuidelines)} hitSlop={6}><Text style={styles.legalLink}>Community Guidelines</Text></Pressable>
    </View>
  </Screen>
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 16, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.xl, lineHeight: 23 },
  card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowLabel: { color: colors.textPrimary, flex: 1, fontSize: 14, lineHeight: 20 },
  cta: { marginTop: spacing.xl, backgroundColor: colors.brandPurple, padding: 16, borderRadius: 14, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.55 },
  error: { color: colors.danger, marginTop: spacing.md },
  legal: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: spacing.xl },
  legalLink: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  legalDot: { color: colors.textMuted },
})

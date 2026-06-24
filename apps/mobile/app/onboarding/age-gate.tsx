import { useState } from 'react'
import { View, Text, StyleSheet, Switch, Pressable, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { setAgeVerified } from '@/lib/onboardingStorage'
import { PUBLIC_LINKS } from '@/config/links'
import Screen from '@/components/ui/Screen'
import Brandmark from '@/components/ui/Brandmark'
import GradientButton from '@/components/ui/GradientButton'
import { colors, spacing } from '@/theme/theme'

export default function AgeGateScreen() {
  const router = useRouter()
  const [confirmed, setConfirmed] = useState(false)

  const onContinue = async () => {
    if (!confirmed) return
    await setAgeVerified()
    router.replace('/onboarding/profile')
  }

  const open = (url: string) => Linking.openURL(url).catch(() => {})

  return (
    <Screen center scroll>
      <View style={styles.hero}>
        <Brandmark size={72} />
      </View>

      <Text style={styles.title}>Meetopia is for adults 18+</Text>
      <Text style={styles.subtitle}>
        Profile-based, video-first dating for real chemistry. You choose who to meet from suggested
        profiles before any video begins.
      </Text>

      <View style={styles.card}>
        <Pressable style={styles.row} onPress={() => setConfirmed(v => !v)}>
          <Switch
            value={confirmed}
            onValueChange={setConfirmed}
            trackColor={{ true: colors.brandPurple, false: 'rgba(255,255,255,0.2)' }}
            thumbColor="#fff"
          />
          <Text style={styles.rowLabel}>
            By continuing, you confirm you are 18 or older and agree to follow Meetopia&apos;s
            Community Guidelines.
          </Text>
        </Pressable>
      </View>

      <GradientButton label="Continue" onPress={onContinue} disabled={!confirmed} style={styles.cta} />

      <View style={styles.legal}>
        <Pressable onPress={() => open(PUBLIC_LINKS.terms)} hitSlop={6}>
          <Text style={styles.legalLink}>Terms</Text>
        </Pressable>
        <Text style={styles.legalDot}>·</Text>
        <Pressable onPress={() => open(PUBLIC_LINKS.privacy)} hitSlop={6}>
          <Text style={styles.legalLink}>Privacy</Text>
        </Pressable>
        <Text style={styles.legalDot}>·</Text>
        <Pressable onPress={() => open(PUBLIC_LINKS.communityGuidelines)} hitSlop={6}>
          <Text style={styles.legalLink}>Community Guidelines</Text>
        </Pressable>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    lineHeight: 23,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowLabel: { color: colors.textPrimary, flex: 1, fontSize: 14, lineHeight: 20 },
  cta: { marginTop: spacing.xl },
  legal: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: spacing.xl },
  legalLink: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  legalDot: { color: colors.textMuted },
})

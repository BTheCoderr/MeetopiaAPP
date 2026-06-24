import { useEffect, useState } from 'react'
import { Text, StyleSheet, ActivityIndicator, View, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { isAgeVerified, isOnboardingComplete, getStoredProfile } from '@/lib/onboardingStorage'
import { intentLabel } from '@/types/profile'
import Screen from '@/components/ui/Screen'
import Brandmark from '@/components/ui/Brandmark'
import GradientButton from '@/components/ui/GradientButton'
import { colors, spacing } from '@/theme/theme'

export default function HomeScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileName, setProfileName] = useState<string | null>(null)
  const [intent, setIntent] = useState<string | null>(null)
  const [onboarded, setOnboarded] = useState(false)

  useEffect(() => {
    isAgeVerified().then(ageOk => {
      if (!ageOk) {
        router.replace('/onboarding/age-gate')
        return
      }
      isOnboardingComplete().then(complete => {
        setOnboarded(complete)
        if (complete) {
          getStoredProfile().then(p => {
            if (p) {
              setProfileName(p.name)
              setIntent(intentLabel(p.intent))
            }
            setLoading(false)
          })
        } else {
          setLoading(false)
        }
      })
    })
  }, [router])

  if (loading) {
    return (
      <Screen center>
        <ActivityIndicator color={colors.brandPurple} />
      </Screen>
    )
  }

  return (
    <Screen center scroll>
      <View style={styles.hero}>
        <Brandmark size={80} />
      </View>

      <Text style={styles.headline}>Video-first dating for real chemistry</Text>
      <Text style={styles.subtext}>
        View suggested profiles, request a Chemistry Check, and keep chatting when the vibe is mutual.
      </Text>

      {profileName ? (
        <View style={styles.profilePill}>
          <Text style={styles.profilePillText}>
            {profileName} · {intent}
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        {onboarded ? (
          <GradientButton label="View Suggested Matches" onPress={() => router.push('/matches')} />
        ) : (
          <GradientButton
            label="Complete your profile"
            onPress={() => router.push('/onboarding/profile')}
          />
        )}

        <GradientButton
          label="Try Demo Mode"
          variant="outline"
          onPress={() => router.push('/matches?demo=1')}
          style={styles.spaced}
        />
      </View>

      <View style={styles.links}>
        <Pressable onPress={() => router.push('/onboarding/profile')} hitSlop={8}>
          <Text style={styles.link}>Edit Profile</Text>
        </Pressable>
        <Text style={styles.linkDivider}>·</Text>
        <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
          <Text style={styles.link}>Settings</Text>
        </Pressable>
      </View>

      <View style={styles.safety}>
        <Text style={styles.safetyText}>18+ only. Report and block are available anytime.</Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subtext: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 23,
  },
  profilePill: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: spacing.lg,
  },
  profilePillText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  actions: { marginTop: spacing.xxl },
  spaced: { marginTop: spacing.md },
  links: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl, gap: 12 },
  link: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  linkDivider: { color: colors.textMuted, fontSize: 15 },
  safety: {
    marginTop: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  safetyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
})

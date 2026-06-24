import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { isAgeVerified, isOnboardingComplete } from '@/lib/onboardingStorage'
import { SUGGESTED_MATCHES, type SuggestedMatch } from '@/data/suggestedMatches'
import Screen from '@/components/ui/Screen'
import BackLink from '@/components/ui/BackLink'
import Avatar from '@/components/ui/Avatar'
import Chip from '@/components/ui/Chip'
import IntentBadge from '@/components/ui/IntentBadge'
import GradientButton from '@/components/ui/GradientButton'
import { colors, radius, spacing } from '@/theme/theme'

export default function SuggestedMatchesScreen() {
  const router = useRouter()
  const { demo } = useLocalSearchParams<{ demo?: string }>()
  const isDemo = demo === '1'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    isAgeVerified().then(ageOk => {
      if (!ageOk) {
        router.replace('/onboarding/age-gate')
        return
      }
      if (isDemo) {
        setLoading(false)
        return
      }
      isOnboardingComplete().then(complete => {
        if (!complete) {
          router.replace('/onboarding/profile')
          return
        }
        setLoading(false)
      })
    })
  }, [router, isDemo])

  const openMatch = (match: SuggestedMatch) => {
    router.push({
      pathname: '/matches/[id]',
      params: { id: match.id, demo: isDemo ? '1' : undefined },
    })
  }

  if (loading) {
    return (
      <Screen center>
        <ActivityIndicator color={colors.brandPurple} />
      </Screen>
    )
  }

  const isEmpty = SUGGESTED_MATCHES.length === 0

  return (
    <Screen scroll>
      <BackLink />
      <Text style={styles.title}>Suggested Matches</Text>
      <Text style={styles.subtitle}>
        Choose someone you&apos;d like to meet before starting a Chemistry Check.
      </Text>

      {isDemo && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>
            Demo Mode — sample profiles for review. Requesting a Chemistry Check simulates the match
            accepting.
          </Text>
        </View>
      )}

      {isEmpty ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No suggested matches yet</Text>
          <Text style={styles.emptyText}>Try Demo Mode or update your profile to see people.</Text>
          <GradientButton
            label="Edit Profile"
            variant="outline"
            onPress={() => router.push('/onboarding/profile')}
            style={styles.emptyBtn}
          />
        </View>
      ) : (
        SUGGESTED_MATCHES.map(match => (
          <Pressable
            key={match.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => openMatch(match)}
          >
            <View style={styles.cardHead}>
              <Avatar name={match.name} size={56} />
              <View style={styles.cardHeadText}>
                <Text style={styles.name}>
                  {match.name}, {match.age}
                </Text>
                <Text style={styles.meta}>{match.city}</Text>
              </View>
            </View>

            <View style={styles.badgeRow}>
              <IntentBadge intent={match.intent} />
            </View>

            <Text style={styles.prompt} numberOfLines={2}>
              “{match.prompt}”
            </Text>

            <View style={styles.tags}>
              {match.interests.slice(0, 3).map(tag => (
                <Chip key={tag} label={tag} />
              ))}
            </View>

            <GradientButton
              label="View Profile"
              variant="outline"
              onPress={() => openMatch(match)}
              style={styles.viewBtn}
            />
          </Pressable>
        ))
      )}

      <Text style={styles.footer}>
        You choose who to meet. Video starts only after you request a Chemistry Check and the match
        accepts. Report or block anyone anytime.
      </Text>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.lg, lineHeight: 22, fontSize: 15 },
  demoBanner: {
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.4)',
    padding: 12,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  demoBannerText: { color: colors.warning, fontSize: 13, lineHeight: 18 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: spacing.md,
  },
  cardPressed: { backgroundColor: colors.surfaceStrong },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  cardHeadText: { marginLeft: 14, flex: 1 },
  name: { color: colors.textPrimary, fontSize: 19, fontWeight: '700' },
  meta: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  badgeRow: { flexDirection: 'row', marginTop: spacing.md },
  prompt: { color: colors.textPrimary, fontSize: 15, marginTop: spacing.md, lineHeight: 21, fontStyle: 'italic' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md },
  viewBtn: { marginTop: spacing.lg },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    alignItems: 'center',
  },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  emptyBtn: { marginTop: spacing.lg, alignSelf: 'stretch' },
  footer: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: spacing.md, marginBottom: spacing.xl },
})

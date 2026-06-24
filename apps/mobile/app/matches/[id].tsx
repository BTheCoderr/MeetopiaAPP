import { useCallback, useRef, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { getSuggestedMatch } from '@/data/suggestedMatches'
import Screen from '@/components/ui/Screen'
import BackLink from '@/components/ui/BackLink'
import Avatar from '@/components/ui/Avatar'
import Chip from '@/components/ui/Chip'
import IntentBadge from '@/components/ui/IntentBadge'
import GradientButton from '@/components/ui/GradientButton'
import { colors, radius, spacing } from '@/theme/theme'

type RequestState = 'idle' | 'requesting' | 'accepted'

export default function MatchDetailScreen() {
  const router = useRouter()
  const { id, demo } = useLocalSearchParams<{ id?: string; demo?: string }>()
  const isDemo = demo === '1'
  const match = getSuggestedMatch(id)
  const [requestState, setRequestState] = useState<RequestState>('idle')
  const acceptTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const requestChemistryCheck = useCallback(() => {
    if (!match) return
    setRequestState('requesting')
    // Profile-based consent: the match must accept before any video starts.
    // MVP / App Review build simulates the match accepting the request.
    acceptTimer.current = setTimeout(() => {
      setRequestState('accepted')
      videoTimer.current = setTimeout(() => {
        router.replace({ pathname: '/chat/video', params: { matchId: match.id, demo: '1' } })
      }, 1100)
    }, 1600)
  }, [match, router])

  const cancelRequest = useCallback(() => {
    if (acceptTimer.current) clearTimeout(acceptTimer.current)
    if (videoTimer.current) clearTimeout(videoTimer.current)
    setRequestState('idle')
  }, [])

  if (!match) {
    return (
      <Screen center>
        <Text style={styles.notFound}>Match not found</Text>
        <GradientButton
          label="Back to Matches"
          variant="outline"
          onPress={() => router.replace('/matches')}
          style={styles.notFoundBtn}
        />
      </Screen>
    )
  }

  return (
    <Screen scroll>
      <BackLink label="Matches" />

      <View style={styles.card}>
        <Avatar name={match.name} size={104} />
        <Text style={styles.name}>
          {match.name}, {match.age}
        </Text>
        <Text style={styles.city}>{match.city}</Text>
        <IntentBadge intent={match.intent} />
      </View>

      <Text style={styles.sectionLabel}>About</Text>
      <Text style={styles.prompt}>“{match.prompt}”</Text>

      <Text style={styles.sectionLabel}>Interests</Text>
      <View style={styles.tags}>
        {match.interests.map(tag => (
          <Chip key={tag} label={tag} />
        ))}
      </View>

      <View style={styles.safetyNote}>
        <Text style={styles.safetyText}>
          Video starts only after a Chemistry Check request is accepted. Both people can leave,
          report, or block anytime.
        </Text>
      </View>

      {isDemo && requestState === 'idle' && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>
            Demo Mode — requesting a Chemistry Check simulates {match.name} accepting, then opens the
            video experience.
          </Text>
        </View>
      )}

      {requestState === 'requesting' && (
        <View style={styles.statusBox}>
          <ActivityIndicator color={colors.brandPurple} />
          <Text style={styles.statusText}>Waiting for {match.name} to accept…</Text>
        </View>
      )}

      {requestState === 'accepted' && (
        <View style={styles.statusBox}>
          <Text style={styles.acceptedText}>{match.name} accepted your Chemistry Check ✨</Text>
          <Text style={styles.statusSub}>Starting your video intro…</Text>
        </View>
      )}

      {requestState === 'idle' ? (
        <>
          <GradientButton
            label="Request Chemistry Check"
            onPress={requestChemistryCheck}
            style={styles.primary}
          />
          <GradientButton
            label="Back to Matches"
            variant="outline"
            onPress={() => router.back()}
            style={styles.secondary}
          />
        </>
      ) : (
        <GradientButton
          label="Cancel request"
          variant="ghost"
          onPress={cancelRequest}
          disabled={requestState === 'accepted'}
          style={styles.secondary}
        />
      )}

      <View style={{ height: spacing.xl }} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  notFound: { color: colors.textPrimary, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  notFoundBtn: { marginTop: spacing.lg, alignSelf: 'stretch' },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  name: { color: colors.textPrimary, fontSize: 26, fontWeight: '800', marginTop: spacing.lg, letterSpacing: -0.5 },
  city: { color: colors.textSecondary, fontSize: 16, marginTop: 4, marginBottom: spacing.md },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  prompt: { color: colors.textPrimary, fontSize: 17, lineHeight: 24, fontStyle: 'italic' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  safetyNote: {
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: 'rgba(48,209,88,0.35)',
    borderRadius: radius.md,
    padding: 14,
    marginTop: spacing.xl,
  },
  safetyText: { color: '#7CE29A', fontSize: 13, lineHeight: 19 },
  demoBanner: {
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.4)',
    borderRadius: radius.md,
    padding: 14,
    marginTop: spacing.md,
  },
  demoBannerText: { color: colors.warning, fontSize: 13, lineHeight: 18 },
  statusBox: { alignItems: 'center', marginTop: spacing.xl, gap: 8 },
  statusText: { color: colors.textPrimary, fontSize: 16, fontWeight: '500' },
  statusSub: { color: colors.textSecondary, fontSize: 14 },
  acceptedText: { color: colors.success, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  primary: { marginTop: spacing.xl },
  secondary: { marginTop: spacing.md },
})

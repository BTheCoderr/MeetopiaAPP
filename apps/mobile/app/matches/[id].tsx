import { useCallback, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { intentLabel } from '@/types/profile'
import { getSuggestedMatch } from '@/data/suggestedMatches'

type RequestState = 'idle' | 'requesting' | 'accepted'

export default function MatchDetailScreen() {
  const router = useRouter()
  const { id, demo } = useLocalSearchParams<{ id?: string; demo?: string }>()
  const isDemo = demo === '1'
  const match = getSuggestedMatch(id)
  const [requestState, setRequestState] = useState<RequestState>('idle')
  const acceptTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const requestChemistryCheck = useCallback(() => {
    if (!match) return
    setRequestState('requesting')
    // Profile-based consent: the match must accept before any video starts.
    // MVP / App Review build simulates the match accepting the request.
    acceptTimer.current = setTimeout(() => {
      setRequestState('accepted')
      setTimeout(() => {
        router.replace({
          pathname: '/chat/video',
          params: { matchId: match.id, demo: '1' },
        })
      }, 700)
    }, 1600)
  }, [match, router])

  const cancelRequest = useCallback(() => {
    if (acceptTimer.current) clearTimeout(acceptTimer.current)
    setRequestState('idle')
  }, [])

  if (!match) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Match not found</Text>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/matches')}>
          <Text style={styles.secondaryText}>Back to suggested matches</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{match.name.charAt(0)}</Text>
        </View>

        <Text style={styles.name}>
          {match.name}, {match.age}
        </Text>
        <Text style={styles.meta}>{match.city}</Text>
        <View style={styles.intentPill}>
          <Text style={styles.intentText}>{intentLabel(match.intent)}</Text>
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <Text style={styles.prompt}>{match.prompt}</Text>

        <Text style={styles.sectionLabel}>Interests</Text>
        <View style={styles.tags}>
          {match.interests.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {isDemo && (
          <View style={styles.demoBanner}>
            <Text style={styles.demoBannerText}>
              Demo Mode — sample profile for App Review. Requesting a Chemistry Check simulates the
              match accepting, then opens the video experience.
            </Text>
          </View>
        )}

        {requestState === 'idle' && (
          <TouchableOpacity style={styles.primaryBtn} onPress={requestChemistryCheck}>
            <Text style={styles.primaryText}>Request Chemistry Check</Text>
          </TouchableOpacity>
        )}

        {requestState === 'requesting' && (
          <View style={styles.statusBox}>
            <ActivityIndicator color="#0A84FF" />
            <Text style={styles.statusText}>Waiting for {match.name} to accept…</Text>
            <TouchableOpacity onPress={cancelRequest}>
              <Text style={styles.cancelText}>Cancel request</Text>
            </TouchableOpacity>
          </View>
        )}

        {requestState === 'accepted' && (
          <View style={styles.statusBox}>
            <Text style={styles.acceptedText}>{match.name} accepted — starting Chemistry Check…</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.reportLink}
          onPress={() =>
            Alert.alert(
              'Report or block',
              `You can report or block ${match.name} during the Chemistry Check, or skip this profile.`,
            )
          }
        >
          <Text style={styles.reportLinkText}>Report or block this profile</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Video starts only after a match accepts your request. Both people can leave, report, or
          block anytime. 18+ only.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scroll: { padding: 24, paddingBottom: 48 },
  back: { color: '#0A84FF', fontSize: 17, marginBottom: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 80 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: '700' },
  name: { color: '#fff', fontSize: 26, fontWeight: '700', textAlign: 'center' },
  meta: { color: 'rgba(255,255,255,0.6)', fontSize: 15, textAlign: 'center', marginTop: 4 },
  intentPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(10,132,255,0.2)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 12,
  },
  intentText: { color: '#5AC8FA', fontSize: 14, fontWeight: '600' },
  sectionLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
  },
  prompt: { color: '#fff', fontSize: 16, lineHeight: 23 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tagText: { color: '#fff', fontSize: 14 },
  demoBanner: {
    backgroundColor: 'rgba(255,214,10,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.4)',
    padding: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  demoBannerText: { color: '#FFD60A', fontSize: 13, lineHeight: 18 },
  primaryBtn: { backgroundColor: '#30D158', paddingVertical: 16, borderRadius: 14, marginTop: 24 },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '600', textAlign: 'center' },
  statusBox: { alignItems: 'center', marginTop: 24, gap: 12 },
  statusText: { color: '#fff', fontSize: 16 },
  acceptedText: { color: '#30D158', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  cancelText: { color: '#FF453A', fontSize: 15 },
  reportLink: { marginTop: 24, alignItems: 'center' },
  reportLinkText: { color: 'rgba(255,255,255,0.55)', fontSize: 14, textDecorationLine: 'underline' },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
    marginHorizontal: 24,
  },
  secondaryText: { color: '#fff', fontSize: 16, fontWeight: '500', textAlign: 'center' },
  note: { color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 19, marginTop: 24 },
})

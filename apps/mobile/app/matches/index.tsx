import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { isAgeVerified, isOnboardingComplete } from '@/lib/onboardingStorage'
import { intentLabel } from '@/types/profile'
import { SUGGESTED_MATCHES, type SuggestedMatch } from '@/data/suggestedMatches'

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
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#0A84FF" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Suggested matches</Text>
        <Text style={styles.subtitle}>
          Profiles that share your dating intent. Open a profile and request a Chemistry Check to meet
          on video.
        </Text>

        {isDemo && (
          <View style={styles.demoBanner}>
            <Text style={styles.demoBannerText}>
              Demo Mode — these are sample profiles for App Review. Requesting a Chemistry Check
              simulates the match accepting.
            </Text>
          </View>
        )}

        {SUGGESTED_MATCHES.map(match => (
          <TouchableOpacity key={match.id} style={styles.card} onPress={() => openMatch(match)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{match.name.charAt(0)}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.name}>
                {match.name}, {match.age}
              </Text>
              <Text style={styles.meta}>
                {match.city} · {intentLabel(match.intent)}
              </Text>
              <Text style={styles.prompt} numberOfLines={2}>
                {match.prompt}
              </Text>
              <View style={styles.tags}>
                {match.interests.slice(0, 3).map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.note}>
          You choose who to meet. Video starts only after you request a Chemistry Check and the match
          accepts. Report or block anyone at any time.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  scroll: { padding: 24, paddingBottom: 48 },
  back: { color: '#0A84FF', fontSize: 17, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 8, marginBottom: 20, lineHeight: 21 },
  demoBanner: {
    backgroundColor: 'rgba(255,214,10,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.4)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  demoBannerText: { color: '#FFD60A', fontSize: 13, lineHeight: 18 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  cardBody: { flex: 1 },
  name: { color: '#fff', fontSize: 17, fontWeight: '700' },
  meta: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 },
  prompt: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 6, fontStyle: 'italic' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: {
    backgroundColor: 'rgba(10,132,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { color: '#5AC8FA', fontSize: 12, fontWeight: '500' },
  chevron: { color: 'rgba(255,255,255,0.4)', fontSize: 24, marginLeft: 8 },
  note: { color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 19, marginTop: 12 },
})

import { useEffect, useState } from 'react'
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { isOnboardingComplete, getStoredProfile } from '@/lib/onboardingStorage'
import { intentLabel } from '@/types/profile'

export default function HomeScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileName, setProfileName] = useState<string | null>(null)
  const [intent, setIntent] = useState<string | null>(null)

  useEffect(() => {
    isOnboardingComplete().then(ok => {
      if (!ok) {
        router.replace('/onboarding/age-gate')
        return
      }
      getStoredProfile().then(p => {
        if (p) {
          setProfileName(p.name)
          setIntent(intentLabel(p.intent))
        }
        setLoading(false)
      })
    })
  }, [router])

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#0A84FF" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        <Text style={styles.brand}>Meet</Text>opia
      </Text>
      <Text style={styles.subtitle}>Video-first dating and real chemistry</Text>
      {profileName ? (
        <Text style={styles.hint}>
          Hi {profileName} · {intent}
        </Text>
      ) : null}

      <Link href="/chat/video" asChild>
        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.primaryText}>Start Chemistry Check</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/onboarding/profile" asChild>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Edit profile</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/settings" asChild>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Settings & safety</Text>
        </TouchableOpacity>
      </Link>

      <Text style={styles.note}>
        18+ only. Live video with real people — report or block anyone who makes you uncomfortable.
      </Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    justifyContent: 'center',
  },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', textAlign: 'center' },
  brand: { color: '#0A84FF' },
  subtitle: { color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginTop: 8, marginBottom: 16, lineHeight: 22 },
  hint: { color: 'rgba(255,255,255,0.45)', fontSize: 14, textAlign: 'center', marginBottom: 28 },
  primaryBtn: {
    backgroundColor: '#30D158',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '600', textAlign: 'center' },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  secondaryText: { color: '#fff', fontSize: 16, fontWeight: '500', textAlign: 'center' },
  note: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', lineHeight: 18, marginTop: 16 },
})

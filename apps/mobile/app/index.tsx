import { useEffect, useState } from 'react'
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { isAgeVerified, isOnboardingComplete, getStoredProfile } from '@/lib/onboardingStorage'
import { intentLabel } from '@/types/profile'

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
      <Text style={styles.subtitle}>Video-first dating for real chemistry.</Text>
      {profileName ? (
        <Text style={styles.hint}>
          Hi {profileName} · {intent}
        </Text>
      ) : null}

      {onboarded ? (
        <Link href="/matches" asChild>
          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryText}>View Suggested Matches</Text>
          </TouchableOpacity>
        </Link>
      ) : (
        <Link href="/onboarding/profile" asChild>
          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Complete your profile</Text>
          </TouchableOpacity>
        </Link>
      )}

      <Link href="/matches?demo=1" asChild>
        <TouchableOpacity style={styles.demoBtn}>
          <Text style={styles.demoText}>Try Demo Mode</Text>
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
        18+ only. Browse suggested profiles, request a Chemistry Check, and meet on video after a
        mutual match. Report or block anyone anytime.
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
  demoBtn: {
    backgroundColor: 'rgba(255,214,10,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.45)',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  demoText: { color: '#FFD60A', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  secondaryText: { color: '#fff', fontSize: 16, fontWeight: '500', textAlign: 'center' },
  note: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', lineHeight: 18, marginTop: 16 },
})

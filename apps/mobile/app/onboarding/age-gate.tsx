import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { setAgeVerified } from '@/lib/onboardingStorage'

export default function AgeGateScreen() {
  const router = useRouter()
  const [confirmed, setConfirmed] = useState(false)

  const onContinue = async () => {
    if (!confirmed) return
    await setAgeVerified()
    router.replace('/onboarding/profile')
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to Meetopia</Text>
      <Text style={styles.subtitle}>Profile-based, video-first dating for real chemistry. 18+ only.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Age requirement</Text>
        <Text style={styles.cardBody}>
          Meetopia is for adults only. You must be 18 or older to use video matching, messaging, and
          chemistry checks.
        </Text>
        <View style={styles.row}>
          <Switch value={confirmed} onValueChange={setConfirmed} trackColor={{ true: '#30D158' }} />
          <Text style={styles.rowLabel}>I confirm I am 18 years or older</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.btn, !confirmed && styles.btnDisabled]}
        onPress={onContinue}
        disabled={!confirmed}
      >
        <Text style={styles.btnText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginTop: 12, marginBottom: 32, lineHeight: 22 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  cardTitle: { color: '#fff', fontSize: 17, fontWeight: '600', marginBottom: 8 },
  cardBody: { color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 22, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { color: '#fff', flex: 1, fontSize: 15 },
  btn: { backgroundColor: '#0A84FF', paddingVertical: 16, borderRadius: 14 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600', textAlign: 'center' },
})

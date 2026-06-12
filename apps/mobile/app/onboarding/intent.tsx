import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getStoredProfile, saveIntent, saveProfile } from '@/lib/onboardingStorage'
import { INTENT_OPTIONS, type MeetopiaIntent } from '@/types/profile'

export default function IntentScreen() {
  const router = useRouter()
  const [selected, setSelected] = useState<MeetopiaIntent>('vibe_check')

  useEffect(() => {
    getStoredProfile().then(p => {
      if (p?.intent) setSelected(p.intent)
    })
  }, [])

  const onContinue = async () => {
    await saveIntent(selected)
    const profile = await getStoredProfile()
    if (profile) {
      await saveProfile({ ...profile, intent: selected })
    }
    router.replace('/')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>What brings you here?</Text>
        <Text style={styles.subtitle}>We use this to match you with people who share your intent.</Text>

        {INTENT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.id}
            style={[styles.option, selected === opt.id && styles.optionActive]}
            onPress={() => setSelected(opt.id)}
          >
            <Text style={styles.optionTitle}>{opt.label}</Text>
            <Text style={styles.optionSub}>{opt.subtitle}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.btn} onPress={onContinue}>
          <Text style={styles.btnText}>Start exploring</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scroll: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '700', color: '#fff' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 8, marginBottom: 24, lineHeight: 21 },
  option: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionActive: { borderColor: '#0A84FF', backgroundColor: 'rgba(10,132,255,0.15)' },
  optionTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
  optionSub: { color: 'rgba(255,255,255,0.55)', fontSize: 14, marginTop: 4 },
  btn: { backgroundColor: '#30D158', paddingVertical: 16, borderRadius: 14, marginTop: 16 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600', textAlign: 'center' },
})

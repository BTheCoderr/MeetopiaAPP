import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { getStoredProfile, saveIntent, saveProfile } from '@/lib/onboardingStorage'
import { INTENT_OPTIONS, type MeetopiaIntent } from '@/types/profile'
import Screen from '@/components/ui/Screen'
import GradientButton from '@/components/ui/GradientButton'
import { colors, radius, spacing } from '@/theme/theme'

export default function IntentScreen() {
  const router = useRouter()
  const [selected, setSelected] = useState<MeetopiaIntent>('dating')

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
    <Screen scroll>
      <Text style={styles.title}>What brings you here?</Text>
      <Text style={styles.subtitle}>
        We use your intent to suggest profiles who are looking for the same thing.
      </Text>

      {INTENT_OPTIONS.map(opt => {
        const active = selected === opt.id
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.option, active && styles.optionActive]}
            onPress={() => setSelected(opt.id)}
            activeOpacity={0.85}
          >
            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>{opt.label}</Text>
              <Text style={styles.optionSub}>{opt.subtitle}</Text>
            </View>
            <View style={[styles.radio, active && styles.radioActive]}>
              {active && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        )
      })}

      <GradientButton label="Save and continue" onPress={onContinue} style={styles.cta} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl, lineHeight: 22, fontSize: 15 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionActive: { borderColor: colors.brandPurple, backgroundColor: 'rgba(139,92,246,0.14)' },
  optionBody: { flex: 1 },
  optionTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  optionSub: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioActive: { borderColor: colors.brandPurple },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.brandPurple },
  cta: { marginTop: spacing.md, marginBottom: spacing.xl },
})

import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Screen from '@/components/ui/Screen'
import { currentProduct } from '@/lib/currentProduct'
import { disconnectSocket } from '@/lib/socket'
import { INTENT_OPTIONS, INTEREST_OPTIONS, STYLE_OPTIONS, type ChemistryPassport } from '@/types/chemistryPassport'
import { colors, radius, spacing } from '@/theme/theme'

export default function ChemistryPassportScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ from?: string }>()
  const [intent, setIntent] = useState<ChemistryPassport['intent'] | null>(null)
  const [style, setStyle] = useState<ChemistryPassport['style'] | null>(null)
  const [interests, setInterests] = useState<ChemistryPassport['interests']>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void currentProduct.passport.get().then(status => {
      if (!active) return
      if (!status.adultConfirmed) {
        router.replace('/onboarding/age-gate')
        return
      }
      if (status.passport) {
        setIntent(status.passport.intent)
        setStyle(status.passport.style)
        setInterests(status.passport.interests)
      }
    }).catch(cause => {
      if (active) setError(cause instanceof Error ? cause.message : 'Could not load your Passport.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [router])

  const toggleInterest = (value: ChemistryPassport['interests'][number]) => {
    setInterests(current => current.includes(value)
      ? current.filter(item => item !== value)
      : current.length < 5 ? [...current, value] : current)
  }

  const save = async () => {
    if (!intent || !style || interests.length < 2 || interests.length > 5 || saving) return
    setSaving(true)
    setError(null)
    try {
      await currentProduct.passport.save({ intent, style, interests })
      // Refresh the authenticated socket: its signed token contains Passport choices.
      disconnectSocket()
      router.replace(params.from === 'settings' ? '/settings' : '/')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save your Passport.')
    } finally {
      setSaving(false)
    }
  }

  return <Screen scroll>
    <Text style={styles.eyebrow}>MEETOPIA / YOUR CHEMISTRY</Text>
    <Text style={styles.heading}>Your Chemistry Passport</Text>
    <Text style={styles.caption}>Real introductions start with common ground. Pick what feels like you. Only your shared interests and conversation style are shown before you both accept a call.</Text>
    {loading ? <ActivityIndicator color={colors.brandPurple} style={{ marginTop: 30 }} /> : <>
      <Text style={styles.step}>01  WHAT ARE YOU HERE FOR?</Text>
      <View style={styles.options}>
        {INTENT_OPTIONS.map(option => <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected: intent === option.value }} style={[styles.choice, intent === option.value && styles.selected]} onPress={() => setIntent(option.value)}>
          <Text style={styles.choiceText}>{option.label}</Text><Text style={styles.check}>{intent === option.value ? '✓' : '○'}</Text>
        </Pressable>)}
      </View>
      <Text style={styles.step}>02  YOUR CONVERSATION ENERGY</Text>
      <View style={styles.options}>
        {STYLE_OPTIONS.map(option => <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected: style === option.value }} style={[styles.choice, style === option.value && styles.selected]} onPress={() => setStyle(option.value)}>
          <Text style={styles.choiceText}>{option.label}</Text><Text style={styles.check}>{style === option.value ? '✓' : '○'}</Text>
        </Pressable>)}
      </View>
      <Text style={styles.step}>03  PICK 2–5 INTERESTS</Text>
      <View style={styles.chips}>{INTEREST_OPTIONS.map(option => {
        const chosen = interests.includes(option.value)
        return <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected: chosen }} style={[styles.chip, chosen && styles.selected]} onPress={() => toggleInterest(option.value)}>
          <Text style={styles.chipText}>{chosen ? '✓  ' : '+  '}{option.label}</Text>
        </Pressable>
      })}</View>
      <Text style={styles.note}>{interests.length}/5 interests selected. We only introduce people with at least one shared interest and compatible intentions. No fabricated match scores.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <Pressable accessibilityRole="button" disabled={!intent || !style || interests.length < 2 || saving} onPress={() => void save()} style={[styles.save, (!intent || !style || interests.length < 2 || saving) && styles.disabled]}>
        <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save Chemistry Passport'}</Text>
      </Pressable>
    </>}
  </Screen>
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.brandBlueLight, fontSize: 12, fontWeight: '800', letterSpacing: 2, marginTop: spacing.md },
  heading: { color: colors.textPrimary, fontSize: 31, fontWeight: '900', marginTop: spacing.md },
  caption: { color: colors.textSecondary, fontSize: 15, lineHeight: 23, marginTop: spacing.md, marginBottom: spacing.lg },
  step: { color: colors.brandBlueLight, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginTop: spacing.xl, marginBottom: spacing.sm },
  options: { gap: 9 },
  choice: { borderRadius: radius.lg, borderColor: colors.border, borderWidth: 1, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', padding: 16 },
  selected: { borderColor: colors.brandPurple, backgroundColor: '#261d44' },
  choiceText: { color: colors.textPrimary, fontSize: 15, fontWeight: '600', flex: 1 },
  check: { color: '#c4a9ff', fontSize: 21, marginLeft: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 24 },
  chipText: { color: colors.textPrimary, fontWeight: '600', fontSize: 14 },
  note: { color: colors.textMuted, marginTop: spacing.md, fontSize: 13, lineHeight: 20 },
  error: { color: colors.danger, marginTop: spacing.md },
  save: { backgroundColor: colors.brandPurple, borderRadius: radius.lg, marginTop: spacing.xl, marginBottom: spacing.xxl, padding: 17, alignItems: 'center' },
  saveText: { color: 'white', fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.5 },
})

import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { getStoredProfile, saveProfile } from '@/lib/onboardingStorage'
import { INTEREST_OPTIONS, type MeetopiaProfile } from '@/types/profile'
import Screen from '@/components/ui/Screen'
import GradientButton from '@/components/ui/GradientButton'
import { colors, radius, spacing } from '@/theme/theme'

const MAX_INTERESTS = 5

export default function ProfileScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [city, setCity] = useState('')
  const [gender, setGender] = useState<MeetopiaProfile['gender']>('other')
  const [interestedIn, setInterestedIn] = useState<MeetopiaProfile['interestedIn']>('everyone')
  const [prompt, setPrompt] = useState('')
  const [interests, setInterests] = useState<string[]>([])

  useEffect(() => {
    getStoredProfile().then(p => {
      if (!p) return
      setName(p.name)
      setAge(String(p.age))
      setCity(p.city)
      setGender(p.gender)
      setInterestedIn(p.interestedIn)
      setPrompt(p.prompt)
      setInterests(p.interests ?? [])
    })
  }, [])

  const canContinue =
    name.trim().length >= 2 && Number(age) >= 18 && city.trim().length >= 2 && prompt.trim().length >= 4

  const toggleInterest = (tag: string) => {
    setInterests(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : prev.length >= MAX_INTERESTS
          ? prev
          : [...prev, tag],
    )
  }

  const onContinue = async () => {
    if (!canContinue) return
    const existing = await getStoredProfile()
    const profile: MeetopiaProfile = {
      name: name.trim(),
      age: Number(age),
      city: city.trim(),
      gender,
      interestedIn,
      intent: existing?.intent ?? 'vibe_check',
      prompt: prompt.trim(),
      interests,
    }
    await saveProfile(profile)
    router.replace('/onboarding/intent')
  }

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Your profile</Text>
        <Text style={styles.subtitle}>
          Your profile helps people know who they&apos;re meeting before a Chemistry Check.
        </Text>

        <Field label="First name" value={name} onChangeText={setName} placeholder="Alex" />
        <Field label="Age" value={age} onChangeText={setAge} placeholder="25" keyboardType="number-pad" />
        <Field label="City" value={city} onChangeText={setCity} placeholder="Chicago" />

        <Text style={styles.label}>Gender</Text>
        <ChipRow
          options={[
            ['woman', 'Woman'],
            ['man', 'Man'],
            ['nonbinary', 'Non-binary'],
            ['other', 'Other'],
          ]}
          value={gender}
          onChange={v => setGender(v as MeetopiaProfile['gender'])}
        />

        <Text style={styles.label}>Interested in</Text>
        <ChipRow
          options={[
            ['women', 'Women'],
            ['men', 'Men'],
            ['everyone', 'Everyone'],
          ]}
          value={interestedIn}
          onChange={v => setInterestedIn(v as MeetopiaProfile['interestedIn'])}
        />

        <Field
          label="Prompt"
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Ask me about my favorite coffee spot…"
          multiline
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>Interests</Text>
          <Text style={styles.labelHint}>
            {interests.length}/{MAX_INTERESTS}
          </Text>
        </View>
        <View style={styles.chips}>
          {INTEREST_OPTIONS.map(tag => {
            const active = interests.includes(tag)
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleInterest(tag)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{tag}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <GradientButton
          label="Continue"
          onPress={onContinue}
          disabled={!canContinue}
          style={styles.cta}
        />
      </KeyboardAvoidingView>
    </Screen>
  )
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string
  value: string
  onChangeText: (t: string) => void
  placeholder?: string
  keyboardType?: 'default' | 'number-pad'
  multiline?: boolean
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </>
  )
}

function ChipRow({
  options,
  value,
  onChange,
}: {
  options: [string, string][]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <View style={styles.chips}>
      {options.map(([id, label]) => (
        <TouchableOpacity
          key={id}
          style={[styles.chip, value === id && styles.chipActive]}
          onPress={() => onChange(id)}
        >
          <Text style={[styles.chipText, value === id && styles.chipTextActive]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl, lineHeight: 22, fontSize: 15 },
  label: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.md },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  labelHint: { color: colors.textMuted, fontSize: 13, marginTop: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  inputMulti: { minHeight: 90, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.xs },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: 'rgba(139,92,246,0.22)', borderColor: colors.brandPurple },
  chipText: { color: colors.textSecondary, fontSize: 14 },
  chipTextActive: { color: colors.textPrimary, fontWeight: '600' },
  cta: { marginTop: spacing.xl, marginBottom: spacing.xl },
})

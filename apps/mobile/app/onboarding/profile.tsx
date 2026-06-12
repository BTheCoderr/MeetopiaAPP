import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { saveProfile } from '@/lib/onboardingStorage'
import type { MeetopiaProfile } from '@/types/profile'

export default function ProfileScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [city, setCity] = useState('')
  const [gender, setGender] = useState<MeetopiaProfile['gender']>('other')
  const [interestedIn, setInterestedIn] = useState<MeetopiaProfile['interestedIn']>('everyone')
  const [prompt, setPrompt] = useState('')

  const canContinue = name.trim().length >= 2 && Number(age) >= 18 && city.trim().length >= 2 && prompt.trim().length >= 4

  const onContinue = async () => {
    if (!canContinue) return
    const profile: MeetopiaProfile = {
      name: name.trim(),
      age: Number(age),
      city: city.trim(),
      gender,
      interestedIn,
      intent: 'vibe_check',
      prompt: prompt.trim(),
    }
    await saveProfile(profile)
    router.replace('/onboarding/intent')
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Your profile</Text>
          <Text style={styles.subtitle}>Only your first name, age, city, and prompt are shared during a Chemistry Check.</Text>

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
            label="Short prompt"
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Ask me about my favorite coffee spot…"
            multiline
          />

          <TouchableOpacity style={[styles.btn, !canContinue && styles.btnDisabled]} onPress={onContinue} disabled={!canContinue}>
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
        placeholderTextColor="rgba(255,255,255,0.35)"
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
  container: { flex: 1, backgroundColor: '#000' },
  scroll: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '700', color: '#fff' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 8, marginBottom: 24, lineHeight: 21 },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8, marginTop: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: { backgroundColor: '#0A84FF' },
  chipText: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  btn: { backgroundColor: '#30D158', paddingVertical: 16, borderRadius: 14, marginTop: 24 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600', textAlign: 'center' },
})

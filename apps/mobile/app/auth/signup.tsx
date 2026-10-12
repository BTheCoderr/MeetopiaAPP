import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import Screen from '@/components/ui/Screen'
import Brandmark from '@/components/ui/Brandmark'
import GradientButton from '@/components/ui/GradientButton'
import { signUp } from '@/lib/authApi'
import { colors, radius, spacing } from '@/theme/theme'

export default function SignUpScreen() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await signUp(username.trim(), email.trim().toLowerCase(), password)
      router.replace('/onboarding/age-gate')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create your account.')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = username.trim().length >= 2 && email.includes('@') && password.length >= 8 && confirm.length >= 8

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.hero}>
          <Brandmark size={64} />
        </View>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Meetopia is 18+ video-first dating. This account works on web and iOS.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} placeholder="alex" placeholderTextColor={colors.textMuted} />
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" textContentType="emailAddress" placeholder="you@email.com" placeholderTextColor={colors.textMuted} />
        <Text style={styles.label}>Password (8+ characters)</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry textContentType="newPassword" placeholder="Create a password" placeholderTextColor={colors.textMuted} />
        <Text style={styles.label}>Confirm password</Text>
        <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Repeat password" placeholderTextColor={colors.textMuted} />

        <GradientButton label="Create account" onPress={onSubmit} loading={loading} disabled={!canSubmit} style={styles.cta} />
        <Pressable onPress={() => router.replace('/auth/signin')} hitSlop={8}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.lg, lineHeight: 22 },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md, lineHeight: 20 },
  label: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    color: colors.textPrimary,
    fontSize: 16,
  },
  cta: { marginTop: spacing.xl },
  link: { color: colors.brandBlueLight, textAlign: 'center', fontWeight: '700', marginTop: spacing.lg, fontSize: 16, marginBottom: spacing.xl },
})

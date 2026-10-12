import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import Screen from '@/components/ui/Screen'
import Brandmark from '@/components/ui/Brandmark'
import GradientButton from '@/components/ui/GradientButton'
import { signIn } from '@/lib/authApi'
import { colors, radius, spacing } from '@/theme/theme'

export default function SignInScreen() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    if (!identifier.trim() || !password) return
    setError(null)
    setLoading(true)
    try {
      await signIn(identifier.trim(), password)
      router.replace('/onboarding/age-gate')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen scroll center>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}>
        <View style={styles.hero}>
          <Brandmark size={72} />
        </View>
        <Text style={styles.title}>Sign in to Meetopia</Text>
        <Text style={styles.subtitle}>Use the same account as the web app. Chemistry Checks and Connections stay in sync.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Email or username</Text>
        <TextInput
          style={styles.input}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="username"
          placeholder="you@email.com"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
          placeholder="Your password"
          placeholderTextColor={colors.textMuted}
        />

        <GradientButton label="Sign in" onPress={onSubmit} loading={loading} disabled={!identifier.trim() || !password} style={styles.cta} />
        <Pressable onPress={() => router.push('/auth/signup')} hitSlop={8}>
          <Text style={styles.link}>Create an account</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.xl, lineHeight: 22 },
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
  link: { color: colors.brandBlueLight, textAlign: 'center', fontWeight: '700', marginTop: spacing.lg, fontSize: 16 },
})

import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import Screen from '@/components/ui/Screen'
import { accountAuth, accountStatus } from '@/lib/auth'
import { colors, spacing } from '@/theme/theme'

export default function SignUpScreen() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createAccount() {
    if (working || username.trim().length < 2 || !email.includes('@') || password.length < 8) return
    setWorking(true)
    setError(null)
    try {
      await accountAuth.signUp(username, email, password)
      await accountStatus()
      router.replace('/onboarding/age-gate')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create your account.')
    } finally {
      setWorking(false)
    }
  }

  return <Screen center scroll>
    <Text style={styles.title}>Create your Meetopia account</Text>
    <Text style={styles.subtitle}>Talk first. Vibe after. Meetopia is for adults 18 and older.</Text>
    <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Username" placeholderTextColor={colors.textMuted} autoCapitalize="none" autoCorrect={false} autoComplete="username-new" accessibilityLabel="Username" />
    <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.textMuted} autoCapitalize="none" keyboardType="email-address" autoComplete="email" accessibilityLabel="Email" />
    <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password (at least 8 characters)" placeholderTextColor={colors.textMuted} secureTextEntry autoComplete="new-password" accessibilityLabel="Password" />
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    <Pressable accessibilityRole="button" disabled={working || username.trim().length < 2 || !email.includes('@') || password.length < 8} style={styles.button} onPress={() => void createAccount()}>
      {working ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Create account</Text>}
    </Pressable>
    <Pressable style={styles.link} onPress={() => router.replace('/auth/signin')}><Text style={styles.linkText}>Already have an account? Sign in</Text></Pressable>
  </Screen>
}

const styles = StyleSheet.create({
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xl },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 15, color: colors.textPrimary, fontSize: 16, marginBottom: spacing.md },
  button: { backgroundColor: colors.brandPurple, padding: 16, borderRadius: 14, alignItems: 'center', marginTop: spacing.md },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  error: { color: colors.danger, fontSize: 14, marginTop: spacing.sm },
  link: { padding: 16, marginTop: spacing.md, alignItems: 'center' },
  linkText: { color: colors.brandBlueLight, fontWeight: '700', fontSize: 15 },
})

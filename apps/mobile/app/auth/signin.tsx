import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import Screen from '@/components/ui/Screen'
import Brandmark from '@/components/ui/Brandmark'
import { accountAuth, accountStatus } from '@/lib/auth'
import { colors, spacing } from '@/theme/theme'

export default function SignInScreen() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signIn() {
    if (!identifier.trim() || !password || working) return
    setWorking(true)
    setError(null)
    try {
      await accountAuth.signIn(identifier, password)
      // Verify the native networking layer retains the server session cookie.
      // Never pretend a successful POST alone means protected APIs can be used.
      const { adultConfirmed } = await accountStatus()
      router.replace(adultConfirmed ? '/' : '/onboarding/age-gate')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in. Please try again.')
    } finally {
      setWorking(false)
    }
  }

  return <Screen center scroll>
    <View style={styles.brand}><Brandmark size={72} /></View>
    <Text style={styles.title}>Sign in to Meetopia</Text>
    <Text style={styles.subtitle}>Introductions and Vibe Rooms require an account. Your Connections stay with you across devices.</Text>
    <TextInput value={identifier} onChangeText={setIdentifier} placeholder="Email or username" placeholderTextColor={colors.textMuted} autoCapitalize="none" autoCorrect={false} autoComplete="username" style={styles.input} accessibilityLabel="Email or username" />
    <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.textMuted} secureTextEntry autoComplete="current-password" style={styles.input} accessibilityLabel="Password" onSubmitEditing={() => void signIn()} />
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    <Pressable accessibilityRole="button" disabled={working || !identifier.trim() || !password} onPress={() => void signIn()} style={[styles.button, working && styles.dimmed]}>
      {working ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign in</Text>}
    </Pressable>
    <Pressable onPress={() => router.push('/auth/signup')} style={styles.link}><Text style={styles.linkText}>New to Meetopia? Create an account</Text></Pressable>
  </Screen>
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', marginBottom: spacing.lg },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginTop: spacing.sm, marginBottom: spacing.xl },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 15, color: colors.textPrimary, fontSize: 16, marginBottom: spacing.md },
  button: { backgroundColor: colors.brandPurple, padding: 16, borderRadius: 14, alignItems: 'center', marginTop: spacing.md },
  dimmed: { opacity: 0.65 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  error: { color: colors.danger, fontSize: 14, marginTop: spacing.sm },
  link: { padding: 16, marginTop: spacing.md, alignItems: 'center' },
  linkText: { color: colors.brandBlueLight, fontWeight: '700', fontSize: 15 },
})

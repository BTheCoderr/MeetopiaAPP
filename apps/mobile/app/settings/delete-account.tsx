import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import Screen from '@/components/ui/Screen'
import BackLink from '@/components/ui/BackLink'
import { accountAuth } from '@/lib/auth'
import { disconnectSocket } from '@/lib/socket'
import { colors, spacing } from '@/theme/theme'

export default function DeleteAccountScreen() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ready = password.length > 0 && confirmation.trim() === 'DELETE'

  async function permanentlyDelete() {
    if (!ready || working) return
    setWorking(true)
    setError(null)
    try {
      await accountAuth.deleteAccount(password)
      disconnectSocket()
      router.replace('/auth/signup')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete your account.')
    } finally {
      setWorking(false)
    }
  }

  return <Screen scroll>
    <BackLink />
    <Text style={styles.title}>Delete your account</Text>
    <Text style={styles.description}>This permanently deletes your Meetopia account, profile, Connections and messages associated with your account. This action cannot be undone.</Text>
    <Text style={styles.description}>To confirm, enter your current password and type DELETE.</Text>
    <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Current password" placeholderTextColor={colors.textMuted} accessibilityLabel="Current password" />
    <TextInput style={styles.input} value={confirmation} onChangeText={setConfirmation} autoCapitalize="characters" placeholder="Type DELETE" placeholderTextColor={colors.textMuted} accessibilityLabel="Type DELETE to confirm" />
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    <Pressable accessibilityRole="button" disabled={!ready || working} style={[styles.delete, (!ready || working) && styles.disabled]} onPress={() => void permanentlyDelete()}>
      {working ? <ActivityIndicator color="white" /> : <Text style={styles.deleteText}>Permanently delete my account</Text>}
    </Pressable>
  </Screen>
}

const styles = StyleSheet.create({
  title: { color: colors.textPrimary, fontWeight: '800', fontSize: 28, marginTop: spacing.md },
  description: { color: colors.textSecondary, fontSize: 16, lineHeight: 23, marginTop: spacing.lg },
  input: { color: colors.textPrimary, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 16, fontSize: 16, marginTop: spacing.lg },
  delete: { backgroundColor: colors.danger, padding: 16, borderRadius: 14, alignItems: 'center', marginTop: spacing.xl },
  deleteText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.5 },
  error: { color: colors.danger, fontSize: 14, marginTop: spacing.md },
})

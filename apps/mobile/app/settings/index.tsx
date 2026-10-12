import { useEffect, useState } from 'react'
import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { PUBLIC_LINKS } from '@/config/links'
import { deleteAccount, signOut } from '@/lib/authApi'
import { getSessionUser, type SessionUser } from '@/lib/session'
import Screen from '@/components/ui/Screen'
import BackLink from '@/components/ui/BackLink'
import { colors, radius, spacing } from '@/theme/theme'

export default function SettingsScreen() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    void getSessionUser().then(setUser)
  }, [])

  const open = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Could not open link', 'Check your connection and try again.')
    })
  }

  const onSignOut = () => {
    Alert.alert('Sign out?', 'You will need to sign in again to use Chemistry Check and Connections.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        onPress: async () => {
          await signOut()
          router.replace('/auth/signin')
        },
      },
    ])
  }

  const runAccountDeletion = async (password: string) => {
    if (!password) {
      Alert.alert('Password required', 'Enter your account password to delete your Meetopia account.')
      return
    }
    try {
      await deleteAccount(password)
      Alert.alert('Account deleted', 'Your Meetopia account and associated server data were deleted.')
      router.replace('/auth/signin')
    } catch (error) {
      Alert.alert('Could not delete account', error instanceof Error ? error.message : 'Try again.')
    }
  }

  const onDeleteAccount = () => {
    Alert.alert(
      'Delete your Meetopia account?',
      'This permanently deletes your account, messages, connections, and related Meetopia data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Alert.prompt(
                'Confirm password',
                'Enter your account password to delete your account and associated data.',
                (password?: string) => {
                  void runAccountDeletion(password ?? '')
                },
                'secure-text',
              )
              return
            }
            Alert.alert(
              'Password required',
              'Sign in on this iPhone and use Delete account from Settings. Password confirmation is required.',
            )
          },
        },
      ],
    )
  }

  return (
    <Screen scroll>
      <BackLink />
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.sectionLabel}>Account</Text>
      {user?.email || user?.username ? (
        <Text style={styles.accountHint}>{user.displayName || user.username || user.email}</Text>
      ) : null}
      <View style={styles.group}>
        <Row label="Edit Profile" onPress={() => router.push('/onboarding/profile')} first />
        <Row label="Sign out" onPress={onSignOut} />
      </View>

      <Text style={styles.sectionLabel}>Legal & safety</Text>
      <View style={styles.group}>
        <Row label="Privacy Policy" onPress={() => open(PUBLIC_LINKS.privacy)} first />
        <Row label="Terms of Service" onPress={() => open(PUBLIC_LINKS.terms)} />
        <Row label="Community Guidelines" onPress={() => open(PUBLIC_LINKS.communityGuidelines)} />
        <Row label="Safety & Reporting" onPress={() => open(PUBLIC_LINKS.safety)} />
        <Row label="Support" onPress={() => open(PUBLIC_LINKS.support)} />
        <Row label="Meetopia Website" onPress={() => open(PUBLIC_LINKS.home)} />
      </View>

      <TouchableOpacity style={styles.dangerBtn} onPress={onDeleteAccount}>
        <Text style={styles.dangerText}>Delete account</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Account deletion requires your password and removes your Meetopia account and associated
        server data. Local data on this device is cleared at the same time.
      </Text>
    </Screen>
  )
}

function Row({ label, onPress, first }: { label: string; onPress: () => void; first?: boolean }) {
  return (
    <TouchableOpacity style={[styles.row, !first && styles.rowBorder]} onPress={onPress}>
      <Text style={styles.rowText}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg, letterSpacing: -0.5 },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  accountHint: { color: colors.textSecondary, fontSize: 15, marginBottom: spacing.sm },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  rowText: { color: colors.textPrimary, fontSize: 16 },
  chevron: { color: colors.textMuted, fontSize: 22 },
  dangerBtn: {
    marginTop: spacing.xxl,
    paddingVertical: 16,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  dangerText: { color: colors.danger, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  note: { color: colors.textMuted, fontSize: 13, marginTop: spacing.lg, marginBottom: spacing.xl, lineHeight: 19 },
})

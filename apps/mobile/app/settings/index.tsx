import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { PUBLIC_LINKS } from '@/config/links'
import { accountAuth } from '@/lib/auth'
import { disconnectSocket } from '@/lib/socket'
import Screen from '@/components/ui/Screen'
import BackLink from '@/components/ui/BackLink'
import { colors, radius, spacing } from '@/theme/theme'

export default function SettingsScreen() {
  const router = useRouter()
  const open = (url: string) => { void Linking.openURL(url).catch(() => Alert.alert('Could not open link', 'Check your connection and try again.')) }

  const signOut = () => {
    Alert.alert('Sign out of Meetopia?', 'Your Connections remain saved in your account.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', onPress: async () => {
        try {
          await accountAuth.signOut()
          disconnectSocket()
          router.replace('/auth/signin')
        } catch (cause) {
          Alert.alert('Could not sign out', cause instanceof Error ? cause.message : 'Please try again.')
        }
      } },
    ])
  }

  return <Screen scroll>
    <BackLink />
    <Text style={styles.title}>Settings and safety</Text>
    <Text style={styles.sectionLabel}>Account</Text>
    <View style={styles.group}>
      <Row label="Sign out" onPress={signOut} first />
      <Row label="Blocked users" onPress={() => router.push('/settings/blocked')} />
      <Row label="Delete Meetopia account" onPress={() => router.push('/settings/delete-account')} />
    </View>
    <Text style={styles.sectionLabel}>Legal and safety</Text>
    <View style={styles.group}>
      <Row label="Privacy Policy" onPress={() => open(PUBLIC_LINKS.privacy)} first />
      <Row label="Terms of Service" onPress={() => open(PUBLIC_LINKS.terms)} />
      <Row label="Community Guidelines" onPress={() => open(PUBLIC_LINKS.communityGuidelines)} />
      <Row label="Safety and Reporting" onPress={() => open(PUBLIC_LINKS.safety)} />
      <Row label="Support" onPress={() => open(PUBLIC_LINKS.support)} />
      <Row label="Meetopia Website" onPress={() => open(PUBLIC_LINKS.home)} />
    </View>
    <Text style={styles.note}>Your profile, conversations and Connections are associated with your Meetopia account, not just this device.</Text>
  </Screen>
}

function Row({ label, onPress, first }: { label: string; onPress: () => void; first?: boolean }) {
  return <TouchableOpacity style={[styles.row, !first && styles.rowBorder]} onPress={onPress}>
    <Text style={styles.rowText}>{label}</Text><Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
  sectionLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  group: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  rowText: { color: colors.textPrimary, fontSize: 16 },
  chevron: { color: colors.textMuted, fontSize: 22 },
  note: { color: colors.textMuted, fontSize: 13, marginTop: spacing.lg, marginBottom: spacing.xl },
})

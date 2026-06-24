import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { PUBLIC_LINKS } from '@/config/links'
import { clearLocalAccountData } from '@/lib/onboardingStorage'
import Screen from '@/components/ui/Screen'
import BackLink from '@/components/ui/BackLink'
import { colors, radius, spacing } from '@/theme/theme'

export default function SettingsScreen() {
  const router = useRouter()

  const open = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Could not open link', 'Check your connection and try again.')
    })
  }

  const onDeleteLocalProfile = () => {
    Alert.alert(
      'Delete local profile & data',
      'This removes your Meetopia profile, matches, and blocked list on this device only. There is no server account yet.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await clearLocalAccountData()
            Alert.alert('Deleted', 'Local profile and data cleared on this device.')
            router.replace('/onboarding/age-gate')
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
      <View style={styles.group}>
        <Row label="Edit Profile" onPress={() => router.push('/onboarding/profile')} first />
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

      <TouchableOpacity style={styles.dangerBtn} onPress={onDeleteLocalProfile}>
        <Text style={styles.dangerText}>Delete local profile & data</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Deleting clears onboarding, profile, blocks, and matches on this device. Server-side account
        deletion will be available when authenticated accounts launch.
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

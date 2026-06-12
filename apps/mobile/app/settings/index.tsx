import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { clearLocalAccountData } from '@/lib/onboardingStorage'

const PLACEHOLDER_URL = 'https://meetopia-live.netlify.app'

export default function SettingsScreen() {
  const router = useRouter()

  const open = (path: string) => {
    Linking.openURL(`${PLACEHOLDER_URL}${path}`).catch(() => {
      Alert.alert('Link unavailable', 'Add production policy URLs before App Store submission.')
    })
  }

  const onDeleteAccount = () => {
    Alert.alert(
      'Delete account data',
      'This removes your local Meetopia profile, matches, and blocked list on this device. Server-side account deletion will be wired when auth backend is live.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await clearLocalAccountData()
            Alert.alert('Deleted', 'Local account data cleared.')
            router.replace('/onboarding/age-gate')
          },
        },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>

        <Row label="Privacy Policy" onPress={() => open('/privacy')} />
        <Row label="Terms of Service" onPress={() => open('/terms')} />
        <Row label="Community Guidelines" onPress={() => Alert.alert('Guidelines', 'See docs/COMMUNITY_GUIDELINES.md in repo until hosted URL is live.')} />
        <Row label="Support" onPress={() => Linking.openURL('mailto:support@meetopia.app')} />

        <TouchableOpacity style={styles.dangerBtn} onPress={onDeleteAccount}>
          <Text style={styles.dangerText}>Delete account data</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Account deletion on device clears local profile and safety data. Full server-side deletion requires
          authenticated accounts (planned).
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

function Row({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text style={styles.rowText}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scroll: { padding: 24 },
  back: { color: '#0A84FF', fontSize: 17, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 24 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  rowText: { color: '#fff', fontSize: 16 },
  chevron: { color: 'rgba(255,255,255,0.4)', fontSize: 22 },
  dangerBtn: {
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,69,58,0.2)',
    borderWidth: 1,
    borderColor: '#FF453A',
  },
  dangerText: { color: '#FF453A', textAlign: 'center', fontSize: 16, fontWeight: '600' },
  note: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 16, lineHeight: 19 },
})

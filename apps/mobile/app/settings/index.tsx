import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PUBLIC_LINKS } from '@/config/links'
import { clearLocalAccountData } from '@/lib/onboardingStorage'

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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>

        <Row label="Meetopia website" onPress={() => open(PUBLIC_LINKS.home)} />
        <Row label="Privacy Policy" onPress={() => open(PUBLIC_LINKS.privacy)} />
        <Row label="Terms of Service" onPress={() => open(PUBLIC_LINKS.terms)} />
        <Row
          label="Community Guidelines"
          onPress={() => open(PUBLIC_LINKS.communityGuidelines)}
        />
        <Row label="Safety & Reporting" onPress={() => open(PUBLIC_LINKS.safety)} />
        <Row label="Support" onPress={() => open(PUBLIC_LINKS.support)} />

        <TouchableOpacity style={styles.dangerBtn} onPress={onDeleteLocalProfile}>
          <Text style={styles.dangerText}>Delete local profile & data</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Deleting local profile and data clears onboarding, profile, blocks, and matches on this device.
          Server-side account deletion will be available when authenticated accounts launch.
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

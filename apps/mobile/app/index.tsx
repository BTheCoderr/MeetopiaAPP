import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getSocketUrl } from '@/lib/iceServers'

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        <Text style={styles.brand}>Meet</Text>opia
      </Text>
      <Text style={styles.subtitle}>Native video chat MVP</Text>
      <Text style={styles.hint}>Signaling: {getSocketUrl()}</Text>

      <Link href="/chat/video" asChild>
        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.primaryText}>Random Video Chat</Text>
        </TouchableOpacity>
      </Link>

      <Link href={{ pathname: '/chat/video', params: { mode: 'dating' } }} asChild>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Dating Video Chat</Text>
        </TouchableOpacity>
      </Link>

      <Text style={styles.note}>
        Requires expo-dev-client build with react-native-webrtc. Can match with web browsers on the same signaling server.
      </Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    justifyContent: 'center',
  },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', textAlign: 'center' },
  brand: { color: '#0A84FF' },
  subtitle: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  hint: { color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center', marginBottom: 32 },
  primaryBtn: {
    backgroundColor: '#30D158',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '600', textAlign: 'center' },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 24,
  },
  secondaryText: { color: '#fff', fontSize: 17, fontWeight: '600', textAlign: 'center' },
  note: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', lineHeight: 18 },
})

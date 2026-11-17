import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { currentProduct } from '@/lib/currentProduct'

type CreationResponse = {
  creation: { themeId: string; activity: string; setting: string } | null
  labels: { theme: string; activity: string; setting: string } | null
}

export default function CoCreationCard({ connectionId }: { connectionId: string }) {
  const [data, setData] = useState<CreationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => {
    try {
      const item = await currentProduct.connections.creation.get(connectionId)
      setData(item); setError(null)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load shared creation.') }
  }, [connectionId])
  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => { if (active) void load() })
    return () => { active = false }
  }, [load])
  function confirmRemove() {
    Alert.alert('Remove shared adventure?', 'Either member can withdraw the shared creation. Your Connection and messages will remain.', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        setBusy(true)
        void currentProduct.connections.creation.remove(connectionId).then(next => { setData(next); setError(null) })
          .catch(cause => setError(cause instanceof Error ? cause.message : 'Could not remove creation.'))
          .finally(() => setBusy(false))
      } },
    ])
  }
  if (!data?.labels && !error) return data ? null : <ActivityIndicator color="#ab92f5" style={{ marginVertical: 12 }} />
  return <View style={styles.card}>
    {data?.labels ? <>
      <Text style={styles.kicker}>✦  OUR FIRST SHARED ADVENTURE</Text>
      <Text style={styles.theme}>{data.labels.theme}</Text>
      <Text style={styles.title}>{data.labels.activity}</Text>
      <Text style={styles.setting}>{data.labels.setting}</Text>
      <Text style={styles.note}>Created together in The Bridge · saved after mutual Vibe and both approvals</Text>
      <Pressable accessibilityRole="button" disabled={busy} onPress={confirmRemove} style={styles.button}><Text style={styles.buttonText}>{busy ? 'Removing…' : 'Remove shared adventure'}</Text></Pressable>
    </> : null}
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
  </View>
}
const styles = StyleSheet.create({
  card: { marginHorizontal: 14, marginTop: 10, padding: 19, borderRadius: 23, borderColor: '#b298fa', borderWidth: 1, backgroundColor: '#2b1d47' },
  kicker: { color: '#d8beff', fontWeight: '900', fontSize: 10, letterSpacing: 1.2 },
  theme: { color: '#b9a4de', fontWeight: '800', marginTop: 11, fontSize: 13 },
  title: { color: '#fff', fontWeight: '900', fontSize: 20, marginTop: 6 },
  setting: { color: '#fff', fontSize: 16, marginTop: 6 },
  note: { color: '#cfbddf', fontSize: 12, lineHeight: 18, marginTop: 15 },
  button: { paddingVertical: 13, marginTop: 12, alignItems: 'center', borderColor: '#8765b9', borderWidth: 1, borderRadius: 13 },
  buttonText: { color: '#e7d6ff', fontSize: 12, fontWeight: '700' },
  error: { color: '#ffaaaa', fontSize: 12 },
})

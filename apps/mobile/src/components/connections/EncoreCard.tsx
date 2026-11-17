import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { currentProduct } from '@/lib/currentProduct'
import { ENCORE_OPTIONS, type EncoreChoice, type EncoreView } from '@/types/encore'

export default function EncoreCard({ connectionId }: { connectionId: string }) {
  const [data, setData] = useState<EncoreView | null>(null)
  const [selected, setSelected] = useState<EncoreChoice | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const response = await currentProduct.connections.encore.get(connectionId)
      setData(response)
      setSelected(response.mine)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load Encore.')
    }
  }, [connectionId])

  useEffect(() => {
    let active = true
    // Defer the initial network callback beyond effect setup; no synchronous
    // React state updates in effects on React 19.3 / Expo SDK 58.
    void Promise.resolve().then(() => { if (active) void refresh() })
    return () => { active = false }
  }, [refresh])
  useEffect(() => {
    if (data?.status !== 'waiting') return
    const id = setInterval(() => { void refresh() }, 15000)
    return () => clearInterval(id)
  }, [data?.status, refresh])

  async function share() {
    if (!selected || busy) return
    setBusy(true)
    try {
      const response = await currentProduct.connections.encore.share(connectionId, selected)
      setData(response)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not share Encore.')
    } finally { setBusy(false) }
  }

  async function withdraw() {
    if (busy) return
    setBusy(true)
    try {
      const response = await currentProduct.connections.encore.withdraw(connectionId)
      setData(response)
      setSelected(null)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not withdraw your Encore.')
    } finally { setBusy(false) }
  }

  const labelFor = (id: string) => ENCORE_OPTIONS.find(item => item.id === id)?.label || id

  return <View style={styles.card}>
    <Text style={styles.eyebrow}>MEETOPIA · THE ENCORE</Text>
    <Text style={styles.title}>Where should your vibe go next?</Text>
    <Text style={styles.description}>Choose a follow-up idea you'd actually enjoy. A shared Spark Card appears only if you both choose to share.</Text>
    <View style={styles.options}>
      {ENCORE_OPTIONS.map(option => <Pressable accessibilityRole="button" accessibilityState={{ selected: selected === option.id }} key={option.id} onPress={() => setSelected(option.id)} style={[styles.choice, selected === option.id && styles.selected]}>
        <Text style={styles.label}>{selected === option.id ? '✓  ' : '+  '}{option.label}</Text>
      </Pressable>)}
    </View>
    <Pressable accessibilityRole="button" disabled={!selected || busy} style={[styles.share, (!selected || busy) && styles.disabled]} onPress={() => void share()}>
      <Text style={styles.shareText}>{busy ? 'Saving…' : 'Share my Encore idea'}</Text>
    </Pressable>
    {data?.status === 'waiting' ? <Text style={styles.waiting}>Your idea is saved. Your Spark Card stays private until your Connection shares theirs.</Text> : null}
    {data?.card ? <View style={styles.spark}>
      <Text style={styles.sparkEyebrow}>✦  OUR SPARK CARD</Text>
      <Text style={styles.sparkTitle}>{data.card.sameIdea ? 'Same idea. Same wavelength.' : 'Two ideas. One connection.'}</Text>
      <Text style={styles.sparkIdea}>You: {labelFor(data.card.mine)}</Text>
      <Text style={styles.sparkIdea}>Them: {labelFor(data.card.theirs)}</Text>
      <Text style={styles.sparkFoot}>Shared by choice · No private round answers saved</Text>
    </View> : null}
    {data?.mine ? <Pressable accessibilityRole="button" onPress={() => void withdraw()} style={styles.withdraw}><Text style={styles.withdrawText}>Withdraw my shared idea</Text></Pressable> : null}
    <Pressable accessibilityRole="button" onPress={() => void refresh()} style={styles.refresh}><Text style={styles.refreshText}>Refresh Encore</Text></Pressable>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    {!data && !error ? <ActivityIndicator style={{ marginTop: 12 }} color="#a58bff" /> : null}
  </View>
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 14, marginVertical: 10, borderRadius: 22, borderColor: '#584183', borderWidth: 1, backgroundColor: '#17132c', padding: 17 },
  eyebrow: { color: '#bba2ff', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  title: { color: '#fff', fontSize: 21, fontWeight: '900', marginTop: 8 },
  description: { color: '#b6abc9', fontSize: 13, lineHeight: 19, marginTop: 6 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 13 },
  choice: { borderRadius: 18, borderWidth: 1, borderColor: '#66518c', backgroundColor: '#251b42', paddingHorizontal: 12, paddingVertical: 10 },
  selected: { backgroundColor: '#5d3e9d', borderColor: '#bc9eff' },
  label: { color: '#fff', fontSize: 12, fontWeight: '700' },
  share: { backgroundColor: '#7c5cff', borderRadius: 14, padding: 13, alignItems: 'center', marginTop: 14 },
  shareText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  disabled: { opacity: 0.45 },
  waiting: { color: '#d3bcff', fontSize: 12, lineHeight: 18, marginTop: 10 },
  spark: { marginTop: 16, borderWidth: 1, borderColor: '#b195eb', borderRadius: 16, padding: 15, backgroundColor: '#342253' },
  sparkEyebrow: { color: '#e8d6ff', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  sparkTitle: { color: '#fff', fontSize: 19, fontWeight: '900', marginTop: 7 },
  sparkIdea: { color: '#fff', fontSize: 13, marginTop: 8 },
  sparkFoot: { color: '#beadd6', fontSize: 11, marginTop: 12 },
  withdraw: { alignItems: 'center', paddingTop: 12 },
  withdrawText: { color: '#d6b7f7', fontSize: 12, fontWeight: '700' },
  refresh: { alignItems: 'center', paddingTop: 10 },
  refreshText: { color: '#aeb2c9', fontSize: 11 },
  error: { color: '#ff9f9f', fontSize: 12, marginTop: 10 },
})

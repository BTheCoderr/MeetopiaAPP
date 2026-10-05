import { useCallback, useEffect, useState } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { currentProduct } from '../../src/lib/currentProduct'
import type { ConnectionMessage, ConnectionSummary } from '../../src/types/currentProduct'

export default function ConnectionScreen() {
  const { connectionId } = useLocalSearchParams<{ connectionId: string }>()
  const [connection, setConnection] = useState<ConnectionSummary | null>(null)
  const [messages, setMessages] = useState<ConnectionMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const id = String(connectionId || '')

  const load = useCallback(async () => {
    if (!id) return
    const [detail, thread] = await Promise.all([currentProduct.connections.get(id), currentProduct.connections.messages(id)])
    setConnection(detail.connection)
    setMessages(thread.messages)
  }, [id])

  useEffect(() => { void load() }, [load])

  async function send() {
    const content = draft.trim()
    if (!content || sending) return
    setSending(true); setDraft('')
    try {
      const result = await currentProduct.connections.sendMessage(id, content)
      setMessages((prev) => [...prev, result.message])
    } finally { setSending(false) }
  }

  async function callAgain() {
    const { callProof } = await currentProduct.connections.callProof(id)
    // The Chemistry Check/call route consumes this proof when the current signaling screen is wired.
    console.log('Meetopia call proof ready', callProof.length)
  }

  const name = connection?.person.displayName || connection?.person.username || 'Connection'
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}><View><Text style={styles.name}>{name}</Text><Text style={styles.status}>Connection</Text></View><Pressable onPress={() => void callAgain()} style={styles.call}><Text style={styles.callText}>Call again</Text></Pressable></View>
        <FlatList data={messages} keyExtractor={(m) => m.id} contentContainerStyle={styles.messages} renderItem={({ item }) => <View style={[styles.bubble, item.mine ? styles.mine : styles.theirs]}><Text style={styles.messageText}>{item.content}</Text></View>} />
        <View style={styles.composer}><TextInput value={draft} onChangeText={setDraft} placeholder="Message your connection" placeholderTextColor="#777b86" style={styles.input} multiline /><Pressable onPress={() => void send()} disabled={!draft.trim() || sending} style={styles.send}><Text style={styles.sendText}>Send</Text></Pressable></View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#08090d' }, flex: { flex: 1 }, header: { padding: 18, borderBottomWidth: 1, borderBottomColor: '#20232e', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, name: { color: 'white', fontSize: 21, fontWeight: '800' }, status: { color: '#8f929d', marginTop: 2 }, call: { backgroundColor: '#7c5cff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 16 }, callText: { color: 'white', fontWeight: '800' }, messages: { padding: 16, gap: 9 }, bubble: { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 }, mine: { alignSelf: 'flex-end', backgroundColor: '#7c5cff' }, theirs: { alignSelf: 'flex-start', backgroundColor: '#191c25' }, messageText: { color: 'white', fontSize: 16, lineHeight: 21 }, composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, padding: 12, borderTopWidth: 1, borderTopColor: '#20232e' }, input: { flex: 1, maxHeight: 120, color: 'white', backgroundColor: '#151821', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 11 }, send: { backgroundColor: '#7c5cff', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12 }, sendText: { color: 'white', fontWeight: '800' },
})

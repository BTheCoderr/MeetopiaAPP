import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { Socket } from 'socket.io-client'
import ReportModal, { type ReportCategory } from '../../src/components/safety/ReportModal'
import EncoreCard from '../../src/components/connections/EncoreCard'
import CoCreationCard from '../../src/components/connections/CoCreationCard'
import { currentProduct } from '../../src/lib/currentProduct'
import { getAuthenticatedSocket } from '../../src/lib/socket'
import type { ConnectionMessage, ConnectionSummary } from '../../src/types/currentProduct'

export default function ConnectionScreen() {
  const { connectionId } = useLocalSearchParams<{ connectionId: string }>()
  const id = String(connectionId || '')
  const [connection, setConnection] = useState<ConnectionSummary | null>(null)
  const [messages, setMessages] = useState<ConnectionMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const proofRef = useRef<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    try {
      const [detail, thread] = await Promise.all([
        currentProduct.connections.get(id),
        currentProduct.connections.messages(id),
      ])
      setConnection(detail.connection)
      proofRef.current = detail.connection.realtimeProof
      setMessages(thread.messages)
      setError(null)
      if (thread.newlyReadIds?.length && socketRef.current?.connected) {
        socketRef.current.emit('connection-read', {
          proof: detail.connection.realtimeProof,
          messageIds: thread.newlyReadIds,
        })
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load this Connection.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useFocusEffect(useCallback(() => {
    void load()
    return () => {}
  }, [load]))

  useEffect(() => {
    if (!id) return
    let active = true
    let cleanup: (() => void) | null = null
    void getAuthenticatedSocket().then(socket => {
      if (!active) return
      socketRef.current = socket
      const onCreated = (event: { connectionId?: string; message?: ConnectionMessage }) => {
        if (event.connectionId !== id || !event.message?.id) return
        setMessages(previous => previous.some(m => m.id === event.message!.id)
          ? previous
          : [...previous, event.message!])
        // Fetch marks genuinely received messages as read on the server.
        void load()
      }
      const onRead = (event: { connectionId?: string; messageIds?: string[]; readAt?: string }) => {
        if (event.connectionId !== id || !Array.isArray(event.messageIds)) return
        setMessages(previous => previous.map(message =>
          event.messageIds!.includes(message.id)
            ? { ...message, readAt: event.readAt || new Date().toISOString() }
            : message
        ))
      }
      socket.on('connection-message-created', onCreated)
      socket.on('connection-read', onRead)
      cleanup = () => {
        socket.off('connection-message-created', onCreated)
        socket.off('connection-read', onRead)
      }
    }).catch(() => {
      // Persisted HTTP messaging stays available when realtime is disconnected.
    })
    return () => {
      active = false
      cleanup?.()
      socketRef.current = null
    }
  }, [id, load])

  async function send() {
    const content = draft.trim()
    if (!content || sending || !id || content.length > 2000) return
    setSending(true)
    setError(null)
    try {
      const result = await currentProduct.connections.sendMessage(id, content)
      setMessages(previous => previous.some(m => m.id === result.message.id)
        ? previous
        : [...previous, result.message])
      setDraft('')
      if (proofRef.current && socketRef.current?.connected) {
        socketRef.current.emit('connection-message-created', {
          proof: proofRef.current,
          message: { id: result.message.id },
        })
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send your message.')
    } finally {
      setSending(false)
    }
  }

  const name = connection?.person.displayName || connection?.person.username || 'Connection'

  const blockPerson = () => {
    if (!connection) return
    Alert.alert(`Block ${name}?`, 'You will not be matched or connected again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Block', style: 'destructive', onPress: async () => {
        try {
          await currentProduct.blocks.block(connection.person.id)
          router.replace('/connections')
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'Could not block this person.')
        }
      } },
    ])
  }

  const submitReport = async (category: ReportCategory) => {
    if (!connection) return
    try {
      await currentProduct.reports.create(connection.person.id, category)
      Alert.alert('Report received', 'Thank you for helping keep Meetopia safe.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not submit this report.')
    }
  }
  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.identity}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.status}>Mutual Connection</Text>
        </View>
        <Pressable onPress={() => router.push({ pathname: '/chat/video', params: { connectionId: id } })} style={styles.call} disabled={!connection}>
          <Text style={styles.callText}>Call again</Text>
        </Pressable>
      </View>
      <View style={styles.safetyRow}>
        <Pressable onPress={() => setReportOpen(true)} disabled={!connection} style={styles.safetyButton}><Text style={styles.safetyText}>Report</Text></Pressable>
        <Pressable onPress={blockPerson} disabled={!connection} style={styles.safetyButton}><Text style={styles.safetyText}>Block</Text></Pressable>
      </View>
      {connection ? <CoCreationCard connectionId={id} /> : null}
      {connection ? <EncoreCard connectionId={id} /> : null}
      {error ? <Pressable onPress={() => void load()} style={styles.errorBanner} accessibilityRole="button">
        <Text style={styles.errorText}>{error} Tap to retry.</Text>
      </Pressable> : null}
      {loading ? <ActivityIndicator style={styles.loader} color="#7c5cff" /> : (
        <FlatList data={messages} keyExtractor={m => m.id} contentContainerStyle={styles.messages}
          ListEmptyComponent={<Text style={styles.empty}>You both chose Vibe. Start a real conversation.</Text>}
          renderItem={({ item }) => <View style={[styles.bubble, item.mine ? styles.mine : styles.theirs]}>
            <Text style={styles.messageText}>{item.content}</Text>
            {item.mine ? <Text style={styles.read}>{item.readAt ? 'Read' : 'Sent'}</Text> : null}
          </View>} />
      )}
      <View style={styles.composer}>
        <TextInput value={draft} onChangeText={setDraft} placeholder="Message your connection" placeholderTextColor="#777b86" style={styles.input} multiline maxLength={2000} accessibilityLabel="Message" />
        <Pressable onPress={() => void send()} disabled={!draft.trim() || sending || !connection} style={[styles.send, (!draft.trim() || sending) && styles.disabled]}>
          <Text style={styles.sendText}>{sending ? 'Sending' : 'Send'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
    <ReportModal visible={reportOpen} onClose={() => setReportOpen(false)} onSubmit={(category) => { void submitReport(category) }} />
  </SafeAreaView>
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#08090d' }, flex: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#20232e', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  identity: { flex: 1 }, back: { paddingRight: 12 }, backText: { color: 'white', fontSize: 32 },
  name: { color: 'white', fontSize: 20, fontWeight: '800' }, status: { color: '#8f929d', marginTop: 2 },
  call: { backgroundColor: '#7c5cff', paddingHorizontal: 13, paddingVertical: 10, borderRadius: 16 },
  callText: { color: 'white', fontWeight: '800' },
  safetyRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  safetyButton: { paddingHorizontal: 12, paddingVertical: 6 },
  safetyText: { color: '#ff8a80', fontWeight: '700' },
  messages: { padding: 16, gap: 9, flexGrow: 1 },
  bubble: { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#7c5cff' }, theirs: { alignSelf: 'flex-start', backgroundColor: '#191c25' },
  messageText: { color: 'white', fontSize: 16, lineHeight: 21 },
  read: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4, textAlign: 'right' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, padding: 12, borderTopWidth: 1, borderTopColor: '#20232e' },
  input: { flex: 1, maxHeight: 120, color: 'white', backgroundColor: '#151821', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 11 },
  send: { backgroundColor: '#7c5cff', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12 },
  disabled: { opacity: 0.6 }, sendText: { color: 'white', fontWeight: '800' },
  loader: { marginTop: 36 }, empty: { textAlign: 'center', color: '#8f929d', marginTop: 40 },
  errorBanner: { padding: 12, backgroundColor: '#551d2a' }, errorText: { color: '#fff', fontSize: 13 },
})

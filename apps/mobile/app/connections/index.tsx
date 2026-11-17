import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackLink from '../../src/components/ui/BackLink'
import { currentProduct } from '../../src/lib/currentProduct'
import { getAuthenticatedSocket } from '../../src/lib/socket'
import type { ConnectionSummary, Person } from '../../src/types/currentProduct'

function lastSeenLabel(person: Person, online: boolean) {
  if (online) return 'Online'
  if (!person.lastSeenAt) return 'Offline'
  const minutes = Math.floor((Date.now() - new Date(person.lastSeenAt).getTime()) / 60_000)
  if (minutes < 2) return 'Active recently'
  if (minutes < 60) return `Active ${minutes}m ago`
  if (minutes < 24 * 60) return `Active ${Math.floor(minutes / 60)}h ago`
  return 'Offline'
}

export default function ConnectionsScreen() {
  const [items, setItems] = useState<ConnectionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [online, setOnline] = useState<Record<string, boolean>>({})

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await currentProduct.connections.list()
      setItems(data.connections)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load connections')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    void Promise.resolve().then(() => { if (mounted) return load() })
    return () => { mounted = false }
  }, [load])

  useEffect(() => {
    if (!items.length) return
    let active = true
    let timer: ReturnType<typeof setInterval> | null = null
    let cleanup: (() => void) | null = null
    const proofs = items.map(item => item.realtimeProof)
    void getAuthenticatedSocket().then(socket => {
      if (!active) return
      const onPresence = ({ presence }: { presence?: { connectionId: string; online: boolean }[] }) => {
        if (!presence) return
        setOnline(current => {
          const next = { ...current }
          presence.forEach(item => { next[item.connectionId] = item.online })
          return next
        })
      }
      const query = () => socket.emit('connection-presence-query', { proofs })
      socket.on('connection-presence-result', onPresence)
      query()
      timer = setInterval(query, 15_000)
      cleanup = () => { socket.off('connection-presence-result', onPresence) }
    }).catch(() => {})
    return () => { active = false; if (timer) clearInterval(timer); cleanup?.() }
  }, [items])

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <BackLink label="Home" />
        <Text style={styles.eyebrow}>MEETOPIA</Text>
        <Text style={styles.title}>Connections</Text>
        <Text style={styles.subtitle}>Mutual vibes live here. Keep talking or call again.</Text>
      </View>
      {loading ? <ActivityIndicator style={styles.loader} /> : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load() }} />}
          contentContainerStyle={items.length ? styles.list : styles.emptyList}
          ListEmptyComponent={<Text style={styles.empty}>{error || 'No connections yet. Start a Chemistry Check and see who vibes back.'}</Text>}
          renderItem={({ item }) => {
            const name = item.person.displayName || item.person.username || 'Connection'
            return (
              <Pressable style={styles.row} onPress={() => router.push(`/connections/${item.id}`)}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{name.slice(0, 1).toUpperCase()}</Text></View>
                <View style={styles.copy}>
                  <View style={styles.nameRow}><Text style={styles.name}>{name}</Text>{item.unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{item.unreadCount}</Text></View>}</View>
                  <Text numberOfLines={1} style={styles.preview}>{item.lastMessage?.content || 'You matched. Say something.'}</Text>
                  <Text style={styles.presence}>{lastSeenLabel(item.person, online[item.id] === true)}</Text>
                </View>
              </Pressable>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#08090d' }, header: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 18 },
  eyebrow: { color: '#9a7cff', fontSize: 12, fontWeight: '800', letterSpacing: 2 }, title: { color: 'white', fontSize: 34, fontWeight: '800', marginTop: 5 },
  subtitle: { color: '#a7a9b3', fontSize: 15, lineHeight: 21, marginTop: 6 }, loader: { marginTop: 50 }, list: { paddingHorizontal: 16, paddingBottom: 30 }, emptyList: { flexGrow: 1, justifyContent: 'center', padding: 30 },
  empty: { color: '#a7a9b3', textAlign: 'center', fontSize: 16, lineHeight: 23 }, row: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10, borderRadius: 20, backgroundColor: '#12141b', borderWidth: 1, borderColor: '#20232e' },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#7c5cff', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: 'white', fontSize: 21, fontWeight: '800' }, copy: { flex: 1, marginLeft: 13 },
  nameRow: { flexDirection: 'row', alignItems: 'center' }, name: { color: 'white', fontSize: 17, fontWeight: '700', flex: 1 }, preview: { color: '#8f929d', marginTop: 5 }, presence: { color: '#9a7cff', marginTop: 4, fontSize: 12, fontWeight: '700' }, badge: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: '#7c5cff', alignItems: 'center', justifyContent: 'center' }, badgeText: { color: 'white', fontWeight: '800', fontSize: 12 },
})

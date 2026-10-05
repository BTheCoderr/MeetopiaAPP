import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { currentProduct } from '../../src/lib/currentProduct'
import type { ConnectionSummary } from '../../src/types/currentProduct'

export default function ConnectionsScreen() {
  const [items, setItems] = useState<ConnectionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => { void load() }, [load])

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
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
  nameRow: { flexDirection: 'row', alignItems: 'center' }, name: { color: 'white', fontSize: 17, fontWeight: '700', flex: 1 }, preview: { color: '#8f929d', marginTop: 5 }, badge: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: '#7c5cff', alignItems: 'center', justifyContent: 'center' }, badgeText: { color: 'white', fontWeight: '800', fontSize: 12 },
})

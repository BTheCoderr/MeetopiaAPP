import { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import Screen from '@/components/ui/Screen'
import BackLink from '@/components/ui/BackLink'
import { currentProduct } from '@/lib/currentProduct'
import { isAuthFailure } from '@/lib/auth'
import type { BlockRecord } from '@/types/currentProduct'
import { colors, radius, spacing } from '@/theme/theme'

export default function BlockedUsersScreen() {
  const router = useRouter()
  const [blocks, setBlocks] = useState<BlockRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    void currentProduct.blocks.list().then(data => {
      setBlocks(data.blocks || [])
      setError(null)
    }).catch(cause => {
      if (isAuthFailure(cause)) router.replace('/auth/signin')
      else setError(cause instanceof Error ? cause.message : 'Could not load blocked users.')
    }).finally(() => setLoading(false))
  }, [router])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const unblock = (record: BlockRecord) => {
    const name = record.blocked.displayName || record.blocked.username || 'this person'
    Alert.alert(`Unblock ${name}?`, 'They may be eligible to match with you again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unblock', onPress: async () => {
        try {
          await currentProduct.blocks.unblock(record.blocked.id)
          setBlocks(current => current.filter(block => block.id !== record.id))
          setError(null)
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'Could not unblock this person.')
        }
      } },
    ])
  }

  return <Screen scroll>
    <BackLink label="Settings" onPress={() => router.replace('/settings')} />
    <Text style={styles.kicker}>Safety</Text>
    <Text style={styles.title}>Blocked users</Text>
    <Text style={styles.copy}>Blocked people cannot appear in future Chemistry Checks, and their saved Connection is removed.</Text>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    {loading ? <ActivityIndicator color={colors.brandPurple} style={styles.loader} /> : blocks.length === 0 ? (
      <View style={styles.empty}><Text style={styles.emptyTitle}>Nobody blocked</Text><Text style={styles.copy}>People you block will appear here so you can manage them later.</Text></View>
    ) : blocks.map(record => {
      const name = record.blocked.displayName || record.blocked.username || 'Blocked user'
      return <View key={record.id} style={styles.row}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{name.slice(0, 1).toUpperCase()}</Text></View>
        <View style={styles.identity}>
          <Text style={styles.name}>{name}</Text>
          {record.blocked.username ? <Text style={styles.handle}>@{record.blocked.username}</Text> : null}
        </View>
        <Pressable accessibilityRole="button" onPress={() => unblock(record)} style={styles.unblock}><Text style={styles.unblockText}>Unblock</Text></Pressable>
      </View>
    })}
  </Screen>
}

const styles = StyleSheet.create({
  kicker: { color: colors.danger, fontSize: 12, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '800', marginTop: spacing.sm },
  copy: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginTop: spacing.md },
  error: { color: colors.danger, marginTop: spacing.md },
  loader: { marginTop: spacing.xl },
  empty: { marginTop: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  row: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brandPurple, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  identity: { flex: 1, marginLeft: spacing.md },
  name: { color: colors.textPrimary, fontWeight: '700', fontSize: 16 },
  handle: { color: colors.textMuted, marginTop: 2 },
  unblock: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  unblockText: { color: colors.textPrimary, fontWeight: '700' },
})

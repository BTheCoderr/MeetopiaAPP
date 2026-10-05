import { Text, StyleSheet, View, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import Screen from '@/components/ui/Screen'
import Brandmark from '@/components/ui/Brandmark'
import GradientButton from '@/components/ui/GradientButton'
import { colors, spacing } from '@/theme/theme'

export default function HomeScreen() {
  const router = useRouter()
  return <Screen center scroll>
    <View style={styles.hero}><Brandmark size={80} /></View>
    <Text style={styles.headline}>Talk first. Vibe after.</Text>
    <Text style={styles.subtext}>Skip the profile carousel. Start a live Chemistry Check, talk face to face, and only become a Connection when the vibe is mutual.</Text>
    <View style={styles.actions}>
      <GradientButton label="Start Chemistry Check" onPress={() => router.push('/chat/video')} />
      <GradientButton label="Connections" variant="outline" onPress={() => router.push('/connections')} style={styles.spaced} />
    </View>
    <View style={styles.links}>
      <Pressable onPress={() => router.push('/connections')} hitSlop={8}><Text style={styles.link}>Connections</Text></Pressable><Text style={styles.linkDivider}>·</Text><Pressable onPress={() => router.push('/settings')} hitSlop={8}><Text style={styles.link}>Settings</Text></Pressable>
    </View>
    <View style={styles.safety}><Text style={styles.safetyText}>18+ only. Vibes are private unless they are mutual. Report and block are available during every Chemistry Check.</Text></View>
  </Screen>
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: spacing.xl }, headline: { fontSize: 30, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', letterSpacing: -0.5, lineHeight: 36 }, subtext: { color: colors.textSecondary, fontSize: 16, textAlign: 'center', marginTop: spacing.md, lineHeight: 23 }, actions: { marginTop: spacing.xxl, width: '100%' }, spaced: { marginTop: spacing.md }, links: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl, gap: 12 }, link: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' }, linkDivider: { color: colors.textMuted, fontSize: 15 }, safety: { marginTop: spacing.xxl, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14 }, safetyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
})

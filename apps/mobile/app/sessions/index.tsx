import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import Screen from '@/components/ui/Screen'
import BackLink from '@/components/ui/BackLink'
import { VIBE_THEMES } from '@/types/vibeThemes'
import { colors, spacing } from '@/theme/theme'

export default function ChooseVibeSession() {
  const router = useRouter()
  return <Screen scroll>
    <BackLink label="Meetopia" onPress={() => router.replace('/')} />
    <Text style={styles.eyebrow}>MEETOPIA / YOUR EXPERIENCE</Text>
    <Text style={styles.title}>Choose your Vibe Session.</Text>
    <Text style={styles.copy}>No stranger roulette. Pick an experience you actually want to share. We'll look for another available adult who chose the same theme and has a compatible Chemistry Passport. Both of you choose whether to meet.</Text>
    <View style={styles.cards}>
      {VIBE_THEMES.map(theme => <Pressable key={theme.id} accessibilityRole="button" accessibilityLabel={`Choose ${theme.title}`} style={styles.card} onPress={() => router.push({ pathname: '/chat/video', params: { themeId: theme.id } })}>
        <Text style={styles.symbol}>{theme.icon}</Text>
        <View style={styles.cardText}><Text style={styles.cardTitle}>{theme.title}</Text><Text style={styles.cardDesc}>{theme.tagline}</Text></View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>)}
    </View>
    <Text style={styles.note}>You'll talk first, contribute to The Bridge together, and decide whether you want to save your joint creation. No synthetic participants or compatibility scores.</Text>
  </Screen>
}
const styles = StyleSheet.create({
  eyebrow: { color: '#b7a3ff', letterSpacing: 2, fontSize: 11, fontWeight: '900', marginTop: spacing.xl },
  title: { color: colors.textPrimary, fontSize: 32, fontWeight: '900', marginTop: 12 },
  copy: { color: colors.textSecondary, fontSize: 15, lineHeight: 23, marginTop: 15 },
  cards: { gap: 14, marginTop: 27 },
  card: { padding: 17, backgroundColor: '#20183d', borderColor: '#6e52ae', borderWidth: 1, borderRadius: 23, flexDirection: 'row', alignItems: 'center' },
  symbol: { color: '#d6c5ff', fontSize: 31, marginRight: 14 },
  cardText: { flex: 1, gap: 5 },
  cardTitle: { color: '#fff', fontWeight: '900', fontSize: 18 },
  cardDesc: { color: '#c2b6d5', fontSize: 13, lineHeight: 19 },
  arrow: { color: '#b9a9f1', fontSize: 31 },
  note: { color: colors.textMuted, marginTop: 22, fontSize: 13, lineHeight: 20, marginBottom: 25 },
})

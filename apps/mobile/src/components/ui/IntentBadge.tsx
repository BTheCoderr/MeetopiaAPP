import { Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { brandGradientSoft, colors, radius } from '@/theme/theme'
import { intentLabel, type MeetopiaIntent } from '@/types/profile'

export default function IntentBadge({ intent }: { intent: MeetopiaIntent | string }) {
  return (
    <LinearGradient
      colors={brandGradientSoft}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.badge}
    >
      <Text style={styles.text}>{intentLabel(intent as MeetopiaIntent)}</Text>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.4)',
  },
  text: { color: colors.brandBlueLight, fontSize: 13, fontWeight: '600' },
})

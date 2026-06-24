import { View, Text, StyleSheet } from 'react-native'
import { colors, radius } from '@/theme/theme'

export default function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: { color: colors.textPrimary, fontSize: 13, fontWeight: '500' },
})

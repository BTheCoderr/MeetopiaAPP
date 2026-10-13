import { Pressable, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing } from '@/theme/theme'

interface Props {
  label?: string
  onPress?: () => void
}

export default function BackLink({ label = 'Back', onPress }: Props) {
  const router = useRouter()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress ?? (() => {
        if (router.canGoBack()) router.back()
        else router.replace('/')
      })}
      hitSlop={10}
      style={styles.wrap}
    >
      <Text style={styles.text}>‹ {label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg, alignSelf: 'flex-start' },
  text: { color: colors.brandBlueLight, fontSize: 17, fontWeight: '600' },
})

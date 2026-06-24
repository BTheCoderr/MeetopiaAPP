import { View, Text, Image, StyleSheet } from 'react-native'
import { colors, radius } from '@/theme/theme'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ICON = require('../../../assets/icon.png')

interface Props {
  size?: number
  showWordmark?: boolean
}

export default function Brandmark({ size = 72, showWordmark = true }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconShell, { width: size, height: size, borderRadius: size * 0.28 }]}>
        <Image source={ICON} style={styles.icon} resizeMode="cover" />
      </View>
      {showWordmark && (
        <Text style={styles.wordmark}>
          <Text style={styles.wordmarkAccent}>Meet</Text>opia
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  iconShell: {
    overflow: 'hidden',
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  icon: { width: '100%', height: '100%' },
  wordmark: { marginTop: 14, fontSize: 30, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  wordmarkAccent: { color: colors.brandPurple },
})

import { type ReactNode } from 'react'
import { View, StyleSheet, ScrollView, type ViewStyle, type StyleProp } from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'
import { colors, spacing, MAX_CONTENT_WIDTH } from '@/theme/theme'

interface Props {
  children: ReactNode
  /** Wrap children in a ScrollView (default false). */
  scroll?: boolean
  /** Center content vertically (only when not scrolling). */
  center?: boolean
  /** Override horizontal padding. */
  padded?: boolean
  edges?: readonly Edge[]
  contentStyle?: StyleProp<ViewStyle>
}

/**
 * App screen wrapper: dark background, safe-area aware, and constrained to a
 * max content width so layouts stay centered and usable on iPad.
 */
export default function Screen({
  children,
  scroll = false,
  center = false,
  padded = true,
  edges = ['top', 'bottom'],
  contentStyle,
}: Props) {
  const inner = (
    <View style={[styles.constrained, padded && styles.padded, contentStyle]}>{children}</View>
  )

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, center && styles.center]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {inner}
        </ScrollView>
      ) : (
        <View style={[styles.fill, center && styles.center]}>{inner}</View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1, width: '100%', alignItems: 'center' },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingVertical: spacing.lg },
  center: { justifyContent: 'center' },
  constrained: { width: '100%', maxWidth: MAX_CONTENT_WIDTH },
  padded: { paddingHorizontal: spacing.xl },
})

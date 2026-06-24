import { Text, StyleSheet, Pressable, View, ActivityIndicator, type StyleProp, type ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { brandGradient, colors, radius } from '@/theme/theme'

type Variant = 'gradient' | 'solid' | 'outline' | 'ghost'

interface Props {
  label: string
  onPress?: () => void
  variant?: Variant
  disabled?: boolean
  loading?: boolean
  style?: StyleProp<ViewStyle>
}

export default function GradientButton({
  label,
  onPress,
  variant = 'gradient',
  disabled,
  loading,
  style,
}: Props) {
  const isDisabled = disabled || loading
  const content = loading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text style={[styles.label, variant === 'outline' && styles.labelOutline, variant === 'ghost' && styles.labelGhost]}>
      {label}
    </Text>
  )

  if (variant === 'gradient') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [styles.base, isDisabled && styles.disabled, pressed && styles.pressed, style]}
      >
        <LinearGradient
          colors={brandGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      </Pressable>
    )
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles.flat,
        variant === 'solid' && styles.solid,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.flatInner}>{content}</View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, overflow: 'hidden' },
  gradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  flat: {},
  flatInner: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  solid: { backgroundColor: colors.surfaceStrong },
  outline: { borderWidth: 1, borderColor: colors.borderStrong },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.85 },
  label: { color: '#fff', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  labelOutline: { color: colors.textPrimary, fontWeight: '600' },
  labelGhost: { color: colors.textSecondary, fontWeight: '600', fontSize: 16 },
})

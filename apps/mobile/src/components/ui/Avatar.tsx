import { Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { brandGradient } from '@/theme/theme'

interface Props {
  name: string
  size?: number
}

export default function Avatar({ name, size = 56 }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <LinearGradient
      colors={brandGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.text, { fontSize: size * 0.42 }]}>{initial}</Text>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontWeight: '700' },
})

import { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'

const CHEMISTRY_SECONDS = 3 * 60

interface Props {
  active: boolean
  onExpire?: () => void
}

export default function ChemistryTimer({ active, onExpire }: Props) {
  const [remaining, setRemaining] = useState(CHEMISTRY_SECONDS)

  useEffect(() => {
    if (!active) {
      setRemaining(CHEMISTRY_SECONDS)
      return
    }
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(id)
          onExpire?.()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [active, onExpire])

  if (!active) return null

  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  const label = `${m}:${s.toString().padStart(2, '0')}`

  return (
    <View style={styles.pill}>
      <Text style={styles.text}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    marginTop: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  text: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
})

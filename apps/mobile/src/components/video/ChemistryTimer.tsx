import { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'

const CHEMISTRY_SECONDS = 3 * 60

interface Props {
  active: boolean
  onExpire?: () => void
}

export default function ChemistryTimer({ active, onExpire }: Props) {
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) {
      const reset = setTimeout(() => setStartedAt(null), 0)
      return () => clearTimeout(reset)
    }
    const start = Date.now()
    const ready = setTimeout(() => setStartedAt(start), 0)
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000)
      setNow(Date.now())
      if (elapsed >= CHEMISTRY_SECONDS) {
        clearInterval(id)
        onExpire?.()
      }
    }, 1000)
    return () => {
      clearTimeout(ready)
      clearInterval(id)
    }
  }, [active, onExpire])

  if (!active) return null

  const remaining = startedAt ? Math.max(0, CHEMISTRY_SECONDS - Math.floor((now - startedAt) / 1000)) : CHEMISTRY_SECONDS
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

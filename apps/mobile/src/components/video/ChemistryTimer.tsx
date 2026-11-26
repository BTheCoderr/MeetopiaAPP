import { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'

const CHEMISTRY_SECONDS = 3 * 60

interface Props {
  active: boolean
  onExpire?: () => void
}

/**
 * Mount the timer only when a real peer session is connected.
 * Unmounting resets it naturally without synchronously setting state in an effect.
 */
export default function ChemistryTimer({ active, onExpire }: Props) {
  if (!active) return null
  return <ActiveChemistryTimer onExpire={onExpire} />
}

function ActiveChemistryTimer({ onExpire }: Pick<Props, 'onExpire'>) {
  const [remaining, setRemaining] = useState(CHEMISTRY_SECONDS)

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(previous => {
        if (previous <= 1) {
          clearInterval(id)
          return 0
        }
        return previous - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (remaining === 0) onExpire?.()
  }, [remaining, onExpire])

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

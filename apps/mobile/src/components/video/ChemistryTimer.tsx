import { useEffect, useState } from 'react'
import { Text, StyleSheet } from 'react-native'

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

  return <Text style={styles.timer}>Chemistry Check · {label}</Text>
}

const styles = StyleSheet.create({
  timer: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
})

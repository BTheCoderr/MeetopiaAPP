import { View, Text, StyleSheet } from 'react-native'
import { intentLabel, type MeetopiaIntent } from '@/types/profile'

interface PeerProfile {
  name?: string
  age?: number
  city?: string
  intent?: string
  prompt?: string
  bio?: string
}

interface Props {
  profile: PeerProfile | null
  visible: boolean
}

export default function ProfileCard({ profile, visible }: Props) {
  if (!visible || !profile?.name) return null

  const intent = profile.intent as MeetopiaIntent | undefined
  const prompt = profile.prompt || profile.bio

  return (
    <View style={styles.card} pointerEvents="none">
      <Text style={styles.name}>
        {profile.name}
        {profile.age ? `, ${profile.age}` : ''}
      </Text>
      {profile.city ? <Text style={styles.meta}>{profile.city}</Text> : null}
      {intent ? <Text style={styles.intent}>{intentLabel(intent)}</Text> : null}
      {prompt ? <Text style={styles.prompt} numberOfLines={2}>{prompt}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  name: { color: '#fff', fontSize: 18, fontWeight: '700' },
  meta: { color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 2 },
  intent: { color: '#60A5FA', fontSize: 13, fontWeight: '600', marginTop: 6 },
  prompt: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 6, fontStyle: 'italic' },
})

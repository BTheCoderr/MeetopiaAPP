import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { VibeRoomState } from '@/types/vibeRoom'

type Props = {
  room: VibeRoomState | null
  onAnswer: (choice: string) => void
  onNext: () => void
}

export default function VibeRounds({ room, onAnswer, onNext }: Props) {
  if (!room) return null
  const round = room.round
  const answerOptions = round?.options ?? []
  const labelFor = (id: string) => answerOptions.find(option => option.id === id)?.label || 'Answered'
  return <View style={styles.position} pointerEvents="box-none">
    <View style={styles.panel}>
      <Text style={styles.kicker}>THE VIBE ROOM  ·  {room.completed ? 'CHEMISTRY EXPLORED' : `${room.index + 1} OF ${room.total}`}</Text>
      {room.completed ? <>
        <Text style={styles.title}>You made it through all three rounds.</Text>
        <Text style={styles.subtitle}>Take a moment. If you felt a connection, you can privately choose Vibe now. A Connection saves only if it's mutual.</Text>
      </> : <>
        <Text style={styles.title}>{round?.title}</Text>
        <Text style={styles.subtitle}>{round?.subtitle}</Text>
        <Text style={styles.prompt}>{round?.prompt}</Text>
        {answerOptions.length > 0 ? <View style={styles.options}>
          {answerOptions.map(option => <Pressable key={option.id} disabled={room.myChoice !== null || room.revealed} accessibilityRole="button" accessibilityState={{ selected: room.myChoice === option.id }} style={[styles.option, room.myChoice === option.id && styles.selected]} onPress={() => onAnswer(option.id)}>
            <Text style={styles.optionText}>{option.label}</Text>
          </Pressable>)}
          {room.waitingForAnswer ? <Text style={styles.hint}>Your answer is private until they choose theirs.</Text> : null}
          {room.revealed && room.reveal ? <View style={styles.reveal}>
            <Text style={styles.revealTitle}>The reveal</Text>
            {room.reveal.map(entry => <Text key={entry.label} style={styles.revealText}>{entry.label}: {labelFor(entry.choice)}</Text>)}
          </View> : null}
        </View> : null}
        <Pressable accessibilityRole="button" disabled={room.ready || (answerOptions.length > 0 && !room.revealed)} style={[styles.next, (room.ready || (answerOptions.length > 0 && !room.revealed)) && styles.disabled]} onPress={onNext}>
          <Text style={styles.nextText}>{room.waitingForPartner ? 'Ready · waiting for them…' : room.index === 2 ? 'Finish the Vibe Room together' : 'Ready for next round'}</Text>
        </Pressable>
      </>}
    </View>
  </View>
}

const styles = StyleSheet.create({
  position: { position: 'absolute', top: 100, left: 14, right: 14, zIndex: 27 },
  panel: { backgroundColor: 'rgba(17, 13, 35, 0.94)', borderColor: '#8269c6', borderWidth: 1, borderRadius: 23, padding: 19 },
  kicker: { color: '#b9a1f7', fontSize: 10, letterSpacing: 2, fontWeight: '900' },
  title: { color: 'white', fontSize: 23, fontWeight: '900', marginTop: 8 },
  subtitle: { color: '#beb5d4', fontSize: 12, lineHeight: 18, marginTop: 6 },
  prompt: { color: '#fff', fontSize: 17, lineHeight: 24, fontWeight: '600', marginTop: 14 },
  options: { gap: 8, marginTop: 12 },
  option: { borderRadius: 13, padding: 12, borderWidth: 1, borderColor: '#68539b', backgroundColor: '#292145' },
  selected: { borderColor: '#dac5ff', backgroundColor: '#483078' },
  optionText: { fontWeight: '700', color: '#fff', fontSize: 13 },
  hint: { color: '#dac5ff', fontSize: 12 },
  reveal: { borderTopWidth: 1, borderTopColor: '#594777', marginTop: 5, paddingTop: 10 },
  revealTitle: { color: '#d2bcff', fontWeight: '900', fontSize: 12, marginBottom: 5 },
  revealText: { color: '#fff', fontSize: 13, marginTop: 3 },
  next: { backgroundColor: '#805be5', padding: 13, borderRadius: 13, alignItems: 'center', marginTop: 12 },
  disabled: { opacity: 0.55 },
  nextText: { color: '#fff', fontSize: 13, fontWeight: '800' },
})

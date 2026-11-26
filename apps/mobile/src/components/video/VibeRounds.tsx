import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { VibeRoomState } from '@/types/vibeRoom'

type Props = {
  room: VibeRoomState | null
  onAnswer: (choice: string) => void
  onNext: () => void
  onContribute: (choice: string) => void
  onApprove: () => void
}

export default function VibeRounds({ room, onAnswer, onNext, onContribute, onApprove }: Props) {
  if (!room) return null
  const round = room.round
  const answerOptions = round?.options ?? []
  const labelFor = (id: string) => answerOptions.find(option => option.id === id)?.label || 'Answered'
  const bridge = room.bridge

  return <View style={styles.position} pointerEvents="box-none">
    <View style={styles.panel}>
      <Text style={styles.kicker}>{room.themeTitle.toUpperCase()}  ·  {room.completed ? 'SHARED EXPERIENCE' : `${room.index + 1} / ${room.total}`}</Text>
      {room.completed ? <>
        <Text style={styles.title}>You made something together.</Text>
        <Text style={styles.subtitle}>Both of you approved the same adventure. You can now privately choose Vibe. If it's mutual, your approved creation becomes part of your Connection.</Text>
      </> : <>
        <Text style={styles.title}>{round?.title}</Text>
        <Text style={styles.subtitle}>{round?.subtitle}</Text>
        <Text style={styles.prompt}>{round?.prompt}</Text>

        {bridge ? <>
          <Text style={styles.role}>YOUR CONTRIBUTION: {bridge.role === 'activity' ? 'THE ACTIVITY' : 'THE SETTING'}</Text>
          <View style={styles.options}>{bridge.options.map(option =>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: bridge.myChoice === option.id }} key={option.id} onPress={() => onContribute(option.id)} style={[styles.option, bridge.myChoice === option.id && styles.selected]}>
              <Text style={styles.optionText}>{bridge.myChoice === option.id ? '✓  ' : '+  '}{option.label}</Text>
            </Pressable>
          )}</View>
          {bridge.waitingForPartner && <Text style={styles.hint}>Your idea is private until both of you contribute.</Text>}
          {bridge.proposalLabels && <View style={styles.shared}>
            <Text style={styles.sharedLabel}>✦  YOUR FIRST SHARED ADVENTURE</Text>
            <Text style={styles.sharedHeading}>{bridge.proposalLabels.activity}</Text>
            <Text style={styles.sharedDescription}>{bridge.proposalLabels.setting}</Text>
            <Text style={styles.hint}>You may revise your contribution. Every change resets both approvals.</Text>
            <Pressable accessibilityRole="button" disabled={bridge.approved} style={[styles.next, bridge.approved && styles.disabled]} onPress={onApprove}>
              <Text style={styles.nextText}>{bridge.approved ? 'Approved · waiting for them…' : 'Approve & share if we both Vibe'}</Text>
            </Pressable>
            {bridge.otherApproved ? <Text style={styles.hint}>They approved this version. Your approval is still your choice.</Text> : null}
          </View>}
          {!bridge.myChoice && <Text style={styles.hint}>Choose one idea. Your partner contributes the other half.</Text>}
        </> : <>
          {answerOptions.length > 0 && <View style={styles.options}>
            {answerOptions.map(option => <Pressable key={option.id} disabled={room.myChoice !== null || room.revealed} accessibilityRole="button" accessibilityState={{ selected: room.myChoice === option.id }} style={[styles.option, room.myChoice === option.id && styles.selected]} onPress={() => onAnswer(option.id)}>
              <Text style={styles.optionText}>{option.label}</Text>
            </Pressable>)}
            {room.waitingForAnswer && <Text style={styles.hint}>Your choice stays private until both choose.</Text>}
            {room.revealed && room.reveal && <View style={styles.reveal}>
              <Text style={styles.sharedLabel}>THE REVEAL</Text>
              {room.reveal.map(entry => <Text key={entry.label} style={styles.sharedDescription}>{entry.label}: {labelFor(entry.choice)}</Text>)}
            </View>}
          </View>}
          <Pressable accessibilityRole="button" disabled={room.ready || (answerOptions.length > 0 && !room.revealed)} style={[styles.next, (room.ready || (answerOptions.length > 0 && !room.revealed)) && styles.disabled]} onPress={onNext}>
            <Text style={styles.nextText}>{room.waitingForPartner ? 'Ready · waiting for them…' : room.index === 2 ? 'Create something together' : 'Ready for next round'}</Text>
          </Pressable>
        </>}
      </>}
    </View>
  </View>
}

const styles = StyleSheet.create({
  position: { position: 'absolute', top: 94, left: 14, right: 14, zIndex: 27 },
  panel: { backgroundColor: 'rgba(17, 13, 35, 0.95)', borderColor: '#8269c6', borderWidth: 1, borderRadius: 23, padding: 17 },
  kicker: { color: '#b9a1f7', fontSize: 10, letterSpacing: 1.5, fontWeight: '900' },
  title: { color: 'white', fontSize: 22, fontWeight: '900', marginTop: 8 },
  subtitle: { color: '#beb5d4', fontSize: 12, lineHeight: 18, marginTop: 6 },
  prompt: { color: '#fff', fontSize: 16, lineHeight: 22, fontWeight: '600', marginTop: 12 },
  role: { color: '#d9c7ff', fontSize: 11, fontWeight: '900', letterSpacing: 1, marginTop: 14 },
  options: { gap: 7, marginTop: 12 },
  option: { borderRadius: 13, padding: 11, borderWidth: 1, borderColor: '#68539b', backgroundColor: '#292145' },
  selected: { borderColor: '#dac5ff', backgroundColor: '#483078' },
  optionText: { fontWeight: '700', color: '#fff', fontSize: 13 },
  hint: { color: '#dac5ff', fontSize: 11, lineHeight: 17, marginTop: 7 },
  reveal: { borderTopWidth: 1, borderTopColor: '#594777', marginTop: 5, paddingTop: 10 },
  shared: { backgroundColor: '#31204d', borderColor: '#b38dec', borderWidth: 1, borderRadius: 15, marginTop: 13, padding: 13 },
  sharedLabel: { color: '#d2bcff', fontWeight: '900', fontSize: 10, letterSpacing: 1 },
  sharedHeading: { color: '#fff', fontWeight: '900', fontSize: 16, marginTop: 7 },
  sharedDescription: { color: '#fff', fontSize: 13, marginTop: 5 },
  next: { backgroundColor: '#805be5', padding: 13, borderRadius: 13, alignItems: 'center', marginTop: 13 },
  disabled: { opacity: 0.55 },
  nextText: { color: '#fff', fontSize: 13, fontWeight: '800' },
})

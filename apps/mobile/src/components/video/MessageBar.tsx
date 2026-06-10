import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { layout } from './mobileLayout'
import type { ChatMessage } from '@/types/videoChat'

interface Props {
  messages: ChatMessage[]
  value: string
  onChange: (text: string) => void
  onSend: () => void
  disabled?: boolean
  isPeerTyping?: boolean
}

export default function MessageBar({
  messages,
  value,
  onChange,
  onSend,
  disabled,
  isPeerTyping,
}: Props) {
  const recent = messages.slice(-2)

  return (
    <View style={layout.messagePill} pointerEvents="box-none">
      {(recent.length > 0 || isPeerTyping) && (
        <View style={styles.bubbles}>
          {recent.map(m => (
            <View
              key={m.id}
              style={[styles.bubble, m.sender === 'me' ? styles.bubbleMe : styles.bubblePeer]}
            >
              <Text style={styles.bubbleText}>{m.text}</Text>
            </View>
          ))}
          {isPeerTyping && <Text style={styles.typing}>typing…</Text>}
        </View>
      )}
      <View style={styles.pill}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={disabled ? 'Connect to chat…' : 'Type a message…'}
          placeholderTextColor="rgba(255,255,255,0.45)"
          editable={!disabled}
        />
        <TouchableOpacity
          onPress={onSend}
          disabled={disabled || !value.trim()}
          style={[styles.send, !value.trim() && styles.sendDisabled]}
        >
          <Text style={styles.sendText}>↑</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bubbles: { marginBottom: 8, gap: 4 },
  bubble: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: 'rgba(10,132,255,0.92)' },
  bubblePeer: { backgroundColor: 'rgba(255,255,255,0.18)' },
  bubbleText: { color: '#fff', fontSize: 15 },
  typing: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28,28,30,0.72)',
    borderRadius: 999,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 4 },
  send: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { backgroundColor: 'rgba(255,255,255,0.08)' },
  sendText: { color: '#fff', fontWeight: '600' },
})

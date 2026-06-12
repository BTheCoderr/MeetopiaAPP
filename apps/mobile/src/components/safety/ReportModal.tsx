import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'

export const REPORT_CATEGORIES = [
  'Nudity or sexual content',
  'Harassment',
  'Hate or threats',
  'Spam/scam',
  'Underage user',
  'Other',
] as const

export type ReportCategory = (typeof REPORT_CATEGORIES)[number]

interface Props {
  visible: boolean
  onClose: () => void
  onSubmit: (category: ReportCategory) => void
}

export default function ReportModal({ visible, onClose, onSubmit }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Report user</Text>
          <Text style={styles.subtitle}>
            Meetopia logs reports for review. Leave the chat if you feel unsafe. Call emergency
            services if you are in immediate danger.
          </Text>
          <ScrollView>
            {REPORT_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={styles.option}
                onPress={() => {
                  onSubmit(cat)
                  onClose()
                }}
              >
                <Text style={styles.optionText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#1c1c1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 20, marginBottom: 16 },
  option: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
  optionText: { color: '#fff', fontSize: 16 },
  cancel: { marginTop: 16, paddingVertical: 14 },
  cancelText: { color: '#0A84FF', textAlign: 'center', fontSize: 16 },
})

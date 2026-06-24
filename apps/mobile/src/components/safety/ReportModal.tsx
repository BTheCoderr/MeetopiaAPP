import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { colors, radius, spacing } from '@/theme/theme'

export const REPORT_CATEGORIES = [
  'Nudity or sexual content',
  'Harassment',
  'Hate or threats',
  'Spam or scam',
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
          <View style={styles.handle} />
          <Text style={styles.title}>Report this person</Text>
          <Text style={styles.subtitle}>
            Reports are logged for review by the Meetopia team. Leave the chat if you feel unsafe, and
            call emergency services if you are in immediate danger.
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
                <Text style={styles.chevron}>›</Text>
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
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingTop: spacing.md,
    maxHeight: '82%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: spacing.sm },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: spacing.lg },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionText: { color: colors.textPrimary, fontSize: 16 },
  chevron: { color: colors.textMuted, fontSize: 20 },
  cancel: { marginTop: spacing.lg, paddingVertical: 14 },
  cancelText: { color: colors.brandBlueLight, textAlign: 'center', fontSize: 16, fontWeight: '600' },
})

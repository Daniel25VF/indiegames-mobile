import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'

const REASONS = [
  'Contenido inapropiado',
  'Spam o publicidad engañosa',
  'Juego falso o fraudulento',
  'Violación de derechos de autor',
  'Información incorrecta',
  'Otro',
]

interface Props {
  visible: boolean
  gameName: string
  onClose: () => void
  onSubmit: (reason: string, description: string) => void
}

export default function ReportModal({ visible, gameName, onClose, onSubmit }: Props) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [customReason, setCustomReason] = useState('')
  const [description, setDescription] = useState('')

  function handleClose() {
    setSelectedReason(null)
    setCustomReason('')
    setDescription('')
    onClose()
  }

  function handleSubmit() {
    const reason = selectedReason === 'Otro' ? customReason.trim() : selectedReason
    if (!reason) return
    onSubmit(reason, description.trim())
    handleClose()
  }

  const finalReason = selectedReason === 'Otro' ? customReason.trim() : selectedReason
  const canSubmit = !!finalReason

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>Denunciar juego</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle} numberOfLines={1}>{gameName}</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

            <Text style={styles.sectionLabel}>Motivo</Text>
            <View style={styles.reasonsList}>
              {REASONS.map(reason => (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonBtn, selectedReason === reason && styles.reasonBtnActive]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <View style={[styles.radio, selectedReason === reason && styles.radioActive]} />
                  <Text style={[styles.reasonTxt, selectedReason === reason && styles.reasonTxtActive]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedReason === 'Otro' && (
              <TextInput
                style={styles.input}
                placeholder="Especifica el motivo..."
                placeholderTextColor="#555"
                value={customReason}
                onChangeText={setCustomReason}
                maxLength={120}
              />
            )}

            <Text style={styles.sectionLabel}>Descripción <Text style={styles.optional}>(opcional)</Text></Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Describe el problema con más detalle..."
              placeholderTextColor="#555"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />

          </ScrollView>

          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Text style={styles.submitTxt}>Enviar denuncia</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { color: '#fff', fontSize: 17, fontWeight: '700' },
  closeBtn: { color: '#888', fontSize: 18, padding: 4 },
  subtitle: { color: '#888', fontSize: 13, marginBottom: 20 },
  scroll: { flexGrow: 0 },
  sectionLabel: {
    color: '#aaa',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  optional: { color: '#666', fontWeight: '400', textTransform: 'none' },
  reasonsList: { gap: 6, marginBottom: 16 },
  reasonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  reasonBtnActive: { borderColor: '#4a9eff', backgroundColor: '#1a2a3a' },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#555',
  },
  radioActive: { borderColor: '#4a9eff', backgroundColor: '#4a9eff' },
  reasonTxt: { color: '#bbb', fontSize: 14 },
  reasonTxtActive: { color: '#fff' },
  input: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    color: '#e0e0e0',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  inputMulti: { height: 100, paddingTop: 10 },
  submitBtn: {
    backgroundColor: '#c0392b',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { backgroundColor: '#5a2020', opacity: 0.6 },
  submitTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
})

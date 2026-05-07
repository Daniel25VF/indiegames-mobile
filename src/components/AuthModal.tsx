import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { login, register, confirmRegister } from '@shared/services/auth'
import type { AuthUser } from '@shared/services/auth'

type Mode = 'signin' | 'register'

interface Props {
  visible: boolean
  onClose: () => void
  onAuthSuccess: (user: AuthUser) => void
}

export default function AuthModal({ visible, onClose, onAuthSuccess }: Props) {
  const [mode, setMode] = useState<Mode>('signin')
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setUsername(''); setEmail(''); setPassword(''); setCode('')
    setError(''); setStep('form')
  }

  const close = () => { reset(); onClose() }

  const handleSubmit = async () => {
    setError('')
    if (mode === 'signin' && (!email.trim() || !password.trim())) {
      setError('Completa todos los campos.')
      return
    }
    if (mode === 'register' && (!username.trim() || !email.trim() || !password.trim())) {
      setError('Completa todos los campos.')
      return
    }
    setLoading(true)
    try {
      if (mode === 'signin') {
        const user = await login(email, password)
        reset()
        onAuthSuccess(user)
      } else {
        await register(username, email, password)
        setStep('confirm')
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('UserNotFoundException') || msg.includes('NotAuthorizedException')) {
        setError('Usuario o contraseña incorrectos.')
      } else if (msg.includes('UsernameExistsException')) {
        setError('Ese nombre de usuario ya existe.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!code.trim()) { setError('Introduce el código.'); return }
    setLoading(true)
    try {
      await confirmRegister(username, code)
      reset()
      setMode('signin')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Código incorrecto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={close}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity activeOpacity={1}>
            <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">

              <TouchableOpacity style={styles.closeBtn} onPress={close}>
                <Text style={styles.closeTxt}>✕</Text>
              </TouchableOpacity>

              {step === 'confirm' ? (
                <>
                  <Text style={styles.title}>Verifica tu cuenta</Text>
                  <Text style={styles.hint}>Hemos enviado un código a <Text style={{ color: '#ddd' }}>{email}</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Código de 6 dígitos"
                    placeholderTextColor="#555"
                    value={code}
                    onChangeText={t => { setCode(t.replace(/\D/g, '').slice(0, 6)); setError('') }}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  {!!error && <Text style={styles.error}>{error}</Text>}
                  <TouchableOpacity style={styles.submitBtn} onPress={handleConfirm} disabled={loading}>
                    {loading ? <ActivityIndicator color="#1b1b1b" /> : <Text style={styles.submitTxt}>Verificar</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.title}>{mode === 'signin' ? 'Iniciar sesión' : 'Registro'}</Text>

                  {mode === 'register' && (
                    <View style={styles.field}>
                      <Text style={styles.label}>Usuario</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="nombre_usuario"
                        placeholderTextColor="#555"
                        value={username}
                        onChangeText={t => { setUsername(t); setError('') }}
                        autoCapitalize="none"
                      />
                    </View>
                  )}

                  <View style={styles.field}>
                    <Text style={styles.label}>{mode === 'signin' ? 'Usuario' : 'Email'}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={mode === 'signin' ? 'nombre_usuario' : 'tu@email.com'}
                      placeholderTextColor="#555"
                      value={email}
                      onChangeText={t => { setEmail(t); setError('') }}
                      autoCapitalize="none"
                      keyboardType={mode === 'register' ? 'email-address' : 'default'}
                    />
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Contraseña</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#555"
                      value={password}
                      onChangeText={t => { setPassword(t); setError('') }}
                      secureTextEntry
                    />
                  </View>

                  {!!error && <Text style={styles.error}>{error}</Text>}

                  <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                    {loading
                      ? <ActivityIndicator color="#1b1b1b" />
                      : <Text style={styles.submitTxt}>{mode === 'signin' ? 'Sign In' : 'Register'}</Text>
                    }
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => { reset(); setMode(mode === 'signin' ? 'register' : 'signin') }}>
                    <Text style={styles.switchTxt}>
                      {mode === 'signin' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#242424',
    borderRadius: 12,
    width: 320,
    maxHeight: '90%',
  },
  modalContent: {
    padding: 28,
    gap: 14,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
    zIndex: 1,
  },
  closeTxt: {
    color: '#666',
    fontSize: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 4,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: '#aaa',
  },
  input: {
    backgroundColor: '#2d2d2d',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 4,
    color: '#e0e0e0',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  error: {
    color: '#f44336',
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 4,
  },
  submitTxt: {
    color: '#1b1b1b',
    fontWeight: '600',
    fontSize: 13,
  },
  switchTxt: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 4,
  },
})

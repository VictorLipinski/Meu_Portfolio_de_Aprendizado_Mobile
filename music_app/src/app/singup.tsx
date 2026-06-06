import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Link, router } from 'expo-router'
import { useState } from 'react'

import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { useAuth } from '@/context/AuthContext'

export default function SignUpScreen() {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignUp() {
    if (!name.trim()) return Alert.alert('Atenção', 'Informe seu nome.')
    if (!email.trim()) return Alert.alert('Atenção', 'Informe o e-mail.')
    if (!email.includes('@')) return Alert.alert('Atenção', 'Informe um e-mail válido.')
    if (password.length < 6) return Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.')
    if (password !== confirm) return Alert.alert('Atenção', 'As senhas não coincidem.')

    try {
      setLoading(true)
      await signUp(name.trim(), email.trim(), password)
      router.replace('/tabs/songs')
    } catch (err: any) {
      Alert.alert('Erro ao cadastrar', err?.message ?? 'Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: 'height' })}
    >
      <ImageBackground
        source={require('@/assets/background_singup.png')}
        style={styles.image}
        resizeMode="cover"
        imageStyle={styles.backgroundImage}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Text style={styles.title}>Cadastrar</Text>
            <Text style={styles.subtitle}>Crie sua conta para acessar o Noomi</Text>

            <View style={styles.form}>
              <Input
                placeholder="Nome"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
              <Input
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
              <Input
                placeholder="Senha (mín. 6 caracteres)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <Input
                placeholder="Confirmar senha"
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
                editable={!loading}
              />

              {loading ? (
                <View style={styles.loadingBtn}>
                  <ActivityIndicator color="#2B2E4A" />
                </View>
              ) : (
                <Button label="Cadastrar" onPress={handleSignUp} />
              )}
            </View>

            <Text style={styles.footerText}>
              Já tem uma conta?{' '}
              <Link href="/" style={styles.footerLink}>
                Entre aqui
              </Link>
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  image: { flex: 1 },
  backgroundImage: { opacity: 0.45 },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  container: {
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#243447',
  },
  subtitle: {
    fontSize: 16,
    color: '#5B6B7A',
    marginTop: 8,
  },
  form: {
    marginTop: 32,
    gap: 14,
  },
  loadingBtn: {
    height: 48,
    backgroundColor: '#C4D9FF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 28,
    color: '#4A5568',
    fontSize: 14,
  },
  footerLink: {
    color: '#9FB4DB',
    fontWeight: '700',
  },
})

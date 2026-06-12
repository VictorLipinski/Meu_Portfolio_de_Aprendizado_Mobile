import {
  ActivityIndicator,
  Alert,
  Image,
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

export default function LoginScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    if (!email.trim()) return Alert.alert('Atenção', 'Informe o e-mail.')
    if (!password.trim()) return Alert.alert('Atenção', 'Informe a senha.')

    try {
      setLoading(true)
      await signIn(email.trim(), password)
      router.replace('/tabs/songs')
    } catch (err: any) {
      Alert.alert('Erro ao entrar', err?.message ?? 'Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleGuest() {
    router.replace('/tabs/songs')
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: 'height' })}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Image
            source={require('@/assets/img_login.png')}
            style={styles.illustration}
          />

          <Text style={styles.title}>Entrar</Text>
          <Text style={styles.subtitle}>Acesse sua conta com e-mail e senha.</Text>

          <View style={styles.form}>
            <Input
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
            <Input
              placeholder="Senha"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            {loading ? (
              <View style={styles.loadingBtn}>
                <ActivityIndicator color="#2B2E4A" />
              </View>
            ) : (
              <Button label="Entrar" onPress={handleSignIn} />
            )}

            {/* Continuar sem login */}
            <Button
              label="Continuar sem login"
              onPress={handleGuest}
              style={styles.guestBtn}
              labelStyle={styles.guestBtnLabel}
              disabled={loading}
            />
          </View>

          <Text style={styles.footerText}>
            Não tem uma conta?{' '}
            <Link href="/singup" style={styles.footerLink}>
              Cadastre-se aqui.
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 32,
  },
  illustration: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginTop: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#a397e0',
  },
  subtitle: {
    fontSize: 16,
    color: '#5B6B7A',
    marginTop: 4,
  },
  form: {
    marginTop: 24,
    gap: 12,
  },
  loadingBtn: {
    height: 48,
    backgroundColor: '#C4D9FF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C4D9FF',
  },
  guestBtnLabel: {
    color: '#5B6B7A',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#2B2E4A',
  },
  footerLink: {
    color: '#9fb4db',
    fontWeight: '700',
  },
})

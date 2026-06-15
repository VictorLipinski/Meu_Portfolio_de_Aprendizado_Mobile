import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { router, Stack, useSegments } from 'expo-router'

import { AuthProvider, useAuth } from '@/context/AuthContext'
import { MusicPlayerProvider } from '@/context/MusicPlayerContext'

// ─── Redirect guard ───────────────────────────────────────────────────────────
function RootNavigation() {
  const { user, loading } = useAuth()
  const segments = useSegments()

  useEffect(() => {
    if (loading) return
    // Rotas top-level válidas para um usuário autenticado.
    // "player" precisa estar aqui: é um push full screen irmão de "tabs"
    // (Now Playing). Sem essa exceção, o guard disparava router.replace
    // de volta para /tabs/songs no instante em que o player abria,
    // colidindo com a animação de push e fazendo a tela anterior,
    // a Tab Bar e o MiniPlayer continuarem visíveis (bug do "painel parcial").
    const allowedSegments = ['tabs', 'player']
    const inAllowedRoute = allowedSegments.includes(segments[0] as string)
    if (user && !inAllowedRoute) {
      router.replace('/tabs/songs')
    }
  }, [user, loading, segments])

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="singup" options={{ headerShown: false }} />
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      {/*
        Rota Now Playing — PUSH FULL SCREEN (não modal/sheet).
        - SEM `presentation: 'modal'`: no Android, 'modal' renderiza como
          overlay transparente, deixando a Tab Bar e a tela anterior
          visíveis por trás (era exatamente o bug relatado).
        - Apresentação padrão 'card' = push opaco que cobre 100% da tela
          e desmonta a anterior da árvore visível.
        - `slide_from_bottom` preserva a sensação de "abrir o player"
          (Spotify/Apple Music), mas como push real, não como sheet.
      */}
      <Stack.Screen
        name="player"
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          contentStyle: { backgroundColor: '#ffffff' },
        }}
      />
    </Stack>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MusicPlayerProvider>
          <RootNavigation />
        </MusicPlayerProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  )
}

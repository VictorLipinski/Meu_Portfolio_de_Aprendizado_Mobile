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
    const inTabs = segments[0] === 'tabs'
    if (user && !inTabs) {
      router.replace('/tabs/songs')
    }
  }, [user, loading, segments])

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="singup" options={{ headerShown: false }} />
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen
        name="player"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
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

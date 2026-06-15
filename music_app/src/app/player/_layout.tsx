/**
 * player/_layout.tsx
 * ─────────────────
 * Layout interno do grupo "player". A rota "player" é registrada no
 * Stack raiz (root _layout.tsx) como um PUSH FULL SCREEN comum
 * (sem presentation: 'modal'), garantindo que ocupe 100% da tela e
 * oculte completamente a tela anterior (incluindo Tab Bar e MiniPlayer).
 *
 * Este layout interno não define `animation`/`presentation` para não
 * conflitar com a configuração já aplicada no Stack pai.
 */
import { Stack } from 'expo-router'
import { colors } from '@/constants/token'

export default function PlayerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  )
}

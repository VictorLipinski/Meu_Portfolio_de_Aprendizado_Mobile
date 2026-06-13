import { defaultStyles } from '@/styles/index'
import { Stack } from 'expo-router'
import { View } from 'react-native'
import { colors } from '@/constants/token'

const PlaylistScreenLayout = () => {
  return (
    <View style={defaultStyles.container}>
      <Stack
        screenOptions={{
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="[playlistId]" options={{ headerShown: true }} />
      </Stack>
    </View>
  )
}

export default PlaylistScreenLayout

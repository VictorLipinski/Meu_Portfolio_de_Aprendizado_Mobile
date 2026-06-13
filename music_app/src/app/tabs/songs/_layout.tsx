import { defaultStyles } from '@/styles/index'
import { Stack } from 'expo-router'
import { View } from 'react-native'
import { colors } from '@/constants/token'

const SongsScreenLayout = () => {
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
        <Stack.Screen
          name="[albumId]"
          options={{ title: 'Álbum', headerShown: true }}
        />
      </Stack>
    </View>
  )
}

export default SongsScreenLayout

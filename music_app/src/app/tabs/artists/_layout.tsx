import { defaultStyles } from '@/styles/index'
import { Stack } from 'expo-router'
import { View } from 'react-native'
import { colors } from '@/constants/token'

const ArtistsScreenLayout = () => {
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
          name="[artistId]"
          options={{ title: 'Artista', headerShown: true }}
        />
        <Stack.Screen
          name="shows-map"
          options={{ title: 'Shows no Mapa', headerShown: true }}
        />
      </Stack>
    </View>
  )
}

export default ArtistsScreenLayout

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
        <Stack.Screen name="index" options={{ title: '', headerShown: false, headerBackButtonDisplayMode: 'minimal' }} />
        <Stack.Screen name="[playlistId]" options={{ headerShown: true }} />
        <Stack.Screen
          name="search"
          options={{
            title: 'Buscar Música',
            headerShown: true,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </View>
  )
}

export default PlaylistScreenLayout

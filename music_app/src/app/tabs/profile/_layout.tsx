import { defaultStyles } from '@/styles/index'
import { Stack } from 'expo-router'
import { View } from 'react-native'
import { colors } from '@/constants/token'

const ProfileScreenLayout = () => {
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
      </Stack>
    </View>
  )
}

export default ProfileScreenLayout

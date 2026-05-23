import { colors, fontSize } from '@/constants/token'
import { BlurView } from 'expo-blur'
import { Tabs } from 'expo-router'
import { StyleSheet } from 'react-native'
import { FontAwesome, FontAwesome6, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'

const TabsNavigation = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '500',
        },
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          borderTopWidth: 0,
          paddingTop: 8,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={95}
            style={{
              ...StyleSheet.absoluteFillObject,
              overflow: 'hidden',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <FontAwesome name="heart" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="playlist"
        options={{
          title: 'Playlist',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="playlist-play" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="songs"
        options={{
          title: 'Álbuns',
          tabBarIcon: ({ color }) => <Ionicons name="disc-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="artists"
        options={{
          title: 'Artistas',
          tabBarIcon: ({ color }) => <FontAwesome6 name="users-line" size={20} color={color} />,
        }}
      />
    </Tabs>
  )
}

export default TabsNavigation

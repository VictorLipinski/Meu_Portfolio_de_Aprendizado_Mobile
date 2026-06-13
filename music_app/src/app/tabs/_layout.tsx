import { colors, fontSize } from '@/constants/token'
import { BlurView } from 'expo-blur'
import { Tabs } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FontAwesome, FontAwesome6, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { MiniPlayer } from '@/components/MiniPlayer'

// Altura base da tab bar (sem safe area)
const TAB_BAR_HEIGHT = 60

function TabsWithMiniPlayer() {
  const insets = useSafeAreaInsets()
  // Posição do mini player: fica logo acima da tab bar
  const miniPlayerBottom = TAB_BAR_HEIGHT + insets.bottom

  return (
    <View style={styles.root}>
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
            title: 'Playlists',
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
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={23} color={color} />,
          }}
        />
      </Tabs>

      {/* MiniPlayer posicionado absolutamente acima da tab bar */}
      <View
        style={[styles.miniPlayerWrapper, { bottom: miniPlayerBottom }]}
        pointerEvents="box-none"
      >
        <MiniPlayer />
      </View>
    </View>
  )
}

export default TabsWithMiniPlayer

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  miniPlayerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
})

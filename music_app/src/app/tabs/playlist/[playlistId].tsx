import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'

import { AlbumCard } from '@/components/AlbumCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingView } from '@/components/LoadingView'
import { usePlaylists } from '@/hooks/usePlaylists'
import { colors } from '@/constants/token'
import { Ionicons } from '@expo/vector-icons'

export default function PlaylistDetailScreen() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>()
  const { getPlaylist, removeAlbumFromPlaylist, loading } = usePlaylists()

  const playlist = getPlaylist(playlistId)

  function confirmRemove(albumId: string, albumName: string) {
    Alert.alert(
      'Remover da playlist',
      `Deseja remover "${albumName}" desta playlist?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeAlbumFromPlaylist(playlistId, albumId),
        },
      ]
    )
  }

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Playlist' }} />
        <LoadingView />
      </>
    )
  }

  if (!playlist) {
    return (
      <>
        <Stack.Screen options={{ title: 'Playlist' }} />
        <EmptyState message="Playlist não encontrada." icon="alert-circle-outline" />
      </>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: playlist.name,
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      />
      <FlatList
        data={playlist.albums}
        keyExtractor={(item) => item.idAlbum}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.count}>
            {playlist.albums.length}{' '}
            {playlist.albums.length === 1 ? 'álbum' : 'álbuns'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.cardWrapper}>
              <AlbumCard
                album={item}
                onPress={() => router.push(`/tabs/songs/${item.idAlbum}`)}
              />
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => confirmRemove(item.idAlbum, item.strAlbum)}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={17} color="#E05A6A" />
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            message="Nenhum álbum nesta playlist ainda. Adicione pelo detalhe de um álbum."
            icon="musical-notes-outline"
          />
        }
      />
    </>
  )
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  count: {
    fontSize: 14,
    color: colors.textMuted,
    paddingTop: 12,
    paddingBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardWrapper: { flex: 1 },
  removeBtn: {
    paddingLeft: 12,
    paddingVertical: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F4FF',
  },
})

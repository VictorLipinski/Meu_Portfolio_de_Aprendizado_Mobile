import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { EmptyState } from '@/components/EmptyState'
import { LoadingView } from '@/components/LoadingView'
import { usePlaylists } from '@/hooks/usePlaylists'
import { PlaylistSong } from '@/types'
import { colors, fontSize } from '@/constants/token'

export default function PlaylistDetailScreen() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>()
  const { getPlaylist, removeSongFromPlaylist, loading } = usePlaylists()

  const playlist = getPlaylist(playlistId)

  function confirmRemove(song: PlaylistSong) {
    Alert.alert(
      'Remover da playlist',
      `Deseja remover "${song.songName}" desta playlist?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeSongFromPlaylist(playlistId, song.songId),
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

  const count = playlist.songs.length

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
        data={playlist.songs}
        keyExtractor={(item) => item.songId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.count}>
            {count} {count === 1 ? 'música' : 'músicas'}
          </Text>
        }
        renderItem={({ item }) => (
          <SongRow
            song={item}
            onPress={() => router.push(`/tabs/songs/${item.albumId}`)}
            onRemove={() => confirmRemove(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            message="Nenhuma música nesta playlist ainda. Adicione pelo botão [+] nas faixas de um álbum."
            icon="musical-notes-outline"
          />
        }
      />
    </>
  )
}

// ─── SongRow ──────────────────────────────────────────────────────────────────

type SongRowProps = {
  song: PlaylistSong
  onPress: () => void
  onRemove: () => void
}

function SongRow({ song, onPress, onRemove }: SongRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {/* Capa do álbum */}
      {song.albumCover ? (
        <Image source={{ uri: song.albumCover }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Ionicons name="musical-note" size={20} color={colors.primary} style={{ opacity: 0.5 }} />
        </View>
      )}

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.songName} numberOfLines={1}>
          {song.songName}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {song.artistName}
        </Text>
        <Text style={styles.albumName} numberOfLines={1}>
          {song.albumName}
        </Text>
      </View>

      {/* Remover */}
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn} hitSlop={10}>
        <Ionicons name="trash-outline" size={18} color="#E05A6A" />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  count: {
    fontSize: 13,
    color: colors.textMuted,
    paddingTop: 12,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 14,
  },
  cover: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  coverPlaceholder: {
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  songName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  artistName: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  albumName: {
    fontSize: 12,
    color: colors.textMuted,
  },
  removeBtn: { padding: 4 },
  separator: {
    height: 1,
    backgroundColor: '#F0F4FF',
  },
})

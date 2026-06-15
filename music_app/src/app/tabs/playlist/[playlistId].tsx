/**
 * Playlist Detail Screen — app/tabs/playlist/[playlistId].tsx
 * ─────────────────────────────────────────────────────────────
 * Exibe as músicas de uma playlist e integra a reprodução com o
 * player global (MusicPlayerContext), reaproveitando o MESMO fluxo
 * já usado pelas telas de álbum:
 *
 *   tocar música → playQueue() → router.push('/player')
 *
 * Diferença em relação ao álbum: cada música da playlist pode
 * pertencer a um álbum/artista diferente, então cada item da fila
 * carrega seu PRÓPRIO { track, album } via `playlistSongToNowPlaying`.
 */

import { useCallback } from 'react'
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native'
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { LoadingView } from '@/components/LoadingView'
import { usePlaylists } from '@/hooks/usePlaylists'
import { useMusicPlayer, playlistSongToNowPlaying } from '@/context/MusicPlayerContext'
import { PlaylistSong } from '@/types'
import { colors, fontSize } from '@/constants/token'

export default function PlaylistDetailScreen() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>()
  const { getPlaylist, removeSongFromPlaylist, reload, loading } = usePlaylists()
  const { playQueue, nowPlaying, isPlaying } = useMusicPlayer()

  // Atualiza dados sempre que a tela recebe foco
  // (importante após retornar da tela de busca, ou após
  // adicionar/remover músicas — funcionalidade 5: auto atualização)
  useFocusEffect(
    useCallback(() => {
      reload()
    }, [reload])
  )

  const playlist = getPlaylist(playlistId)

  // ── Reproduzir música da playlist como FILA (mesma experiência dos álbuns) ─
  function handlePlaySong(index: number) {
    if (!playlist || playlist.songs.length === 0) return
    const items = playlist.songs.map(playlistSongToNowPlaying)
    playQueue(items, index)
    router.push('/player')
  }

  // ── Botão "Reproduzir Playlist": começa pela primeira faixa ────────────────
  function handlePlayPlaylist() {
    handlePlaySong(0)
  }

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

  function goToAddMusic() {
    router.push({
      pathname: '/tabs/playlist/search',
      params: { playlistId },
    })
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
        <PlaylistEmptyState
          message="Playlist não encontrada."
          onAddPress={undefined}
        />
      </>
    )
  }

  const count = playlist.songs.length
  const hasSongs = count > 0

  return (
    <>
      <Stack.Screen
        options={{
          title: playlist.name,
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={goToAddMusic}
              hitSlop={10}
              style={styles.headerBtn}
            >
              <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={playlist.songs}
        keyExtractor={(item) => item.songId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.titleRow}>
              <Text style={styles.playlistTitle} numberOfLines={1}>
                {playlist.name}
              </Text>
              <Text style={styles.count}>
                {count} {count === 1 ? 'música' : 'músicas'}
              </Text>
            </View>

            <View style={styles.actionsRow}>
              {/* Funcionalidade 2 — Reproduzir Playlist */}
              <TouchableOpacity
                style={[styles.playPlaylistBtn, !hasSongs && styles.playPlaylistBtnDisabled]}
                onPress={handlePlayPlaylist}
                activeOpacity={0.8}
                disabled={!hasSongs}
              >
                <Ionicons name="play" size={16} color="#fff" />
                <Text style={styles.playPlaylistText}>Reproduzir Playlist</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addMusicBtn}
                onPress={goToAddMusic}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={styles.addMusicText}>Adicionar Música</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          const active = nowPlaying?.track.idTrack === item.songId
          return (
            <SongRow
              song={item}
              index={index}
              isActive={active}
              isPlaying={isPlaying && active}
              onPress={() => handlePlaySong(index)}
              onRemove={() => confirmRemove(item)}
            />
          )
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          // Funcionalidade 6 — estado vazio com call-to-action
          <PlaylistEmptyState
            message="Adicione músicas para começar a ouvir."
            onAddPress={goToAddMusic}
          />
        }
      />
    </>
  )
}

// ─── SongRow ──────────────────────────────────────────────────────────────────

type SongRowProps = {
  song: PlaylistSong
  index: number
  isActive: boolean
  isPlaying: boolean
  onPress: () => void
  onRemove: () => void
}

function SongRow({ song, index, isActive, isPlaying, onPress, onRemove }: SongRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, isActive && styles.rowActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Capa + indicador de reprodução (Funcionalidade 4) */}
      <View style={styles.coverWrapper}>
        {song.albumCover ? (
          <Image source={{ uri: song.albumCover }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Ionicons name="musical-note" size={20} color={colors.primary} style={{ opacity: 0.5 }} />
          </View>
        )}
        {isActive && (
          <View style={styles.coverOverlay}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color="#fff"
            />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text
          style={[styles.songName, isActive && styles.songNameActive]}
          numberOfLines={1}
        >
          {song.songName}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>{song.artistName}</Text>
        <Text style={styles.albumName} numberOfLines={1}>{song.albumName}</Text>
      </View>

      {isActive && (
        <Ionicons
          name="volume-medium"
          size={16}
          color={colors.primary}
          style={styles.activeIcon}
        />
      )}

      <TouchableOpacity onPress={onRemove} style={styles.removeBtn} hitSlop={10}>
        <Ionicons name="trash-outline" size={18} color="#E05A6A" />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

// ─── PlaylistEmptyState ─────────────────────────────────────────────────────
// Estado vazio com botão "Adicionar Música" centralizado (Funcionalidade 6)

type PlaylistEmptyStateProps = {
  message: string
  onAddPress?: () => void
}

function PlaylistEmptyState({ message, onAddPress }: PlaylistEmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="musical-notes-outline" size={64} color={colors.primary} style={styles.emptyIcon} />
      <Text style={styles.emptyMessage}>{message}</Text>
      {onAddPress && (
        <TouchableOpacity style={styles.emptyAddBtn} onPress={onAddPress} activeOpacity={0.85}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.emptyAddText}>Adicionar Música</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  headerBtn: {
    marginRight: 4,
    padding: 4,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  listHeader: {
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  titleRow: {
    gap: 4,
  },
  playlistTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  count: {
    fontSize: 13,
    color: colors.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // Botão "Reproduzir Playlist" (Funcionalidade 2)
  playPlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
  },
  playPlaylistBtnDisabled: {
    opacity: 0.4,
  },
  playPlaylistText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  addMusicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#EFF3FF',
  },
  addMusicText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  separator: {
    height: 1,
    backgroundColor: '#F0F4FF',
  },

  // ── Linha da música ──────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 14,
    borderRadius: 10,
  },
  rowActive: {
    backgroundColor: '#F0F5FF',
  },
  coverWrapper: {
    position: 'relative',
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
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    backgroundColor: 'rgba(43, 46, 74, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  songName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  songNameActive: {
    color: colors.primary,
    fontWeight: '700',
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
  activeIcon: {
    marginRight: 2,
  },
  removeBtn: { padding: 4 },

  // ── Estado vazio (Funcionalidade 6) ─────────────────────────────────────
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    opacity: 0.4,
  },
  emptyMessage: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 26,
    marginTop: 4,
  },
  emptyAddText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
})

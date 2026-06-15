/**
 * Favorites Screen — app/tabs/favorites/index.tsx
 * ──────────────────────────────────────────────────
 * Duas seções:
 *   1. Músicas Favoritas (useLikedSongs) — toca IMEDIATAMENTE ao
 *      tocar em uma música, usando exatamente o mesmo fluxo das
 *      playlists: playQueue(items, index) + router.push('/player').
 *   2. Álbuns Favoritos (useFavorites) — mantém a navegação para os
 *      detalhes do álbum (fluxo já existente, intacto) e ganha um
 *      botão "▶ Reproduzir" que inicia a reprodução imediatamente
 *      (busca as faixas, chama play() e abre o player) sem navegar.
 */

import { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { AlbumCard } from '@/components/AlbumCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingView } from '@/components/LoadingView'
import { useFavorites } from '@/hooks/useFavorites'
import { useLikedSongs } from '@/hooks/useLikedSongs'
import { useNotifications } from '@/hooks/useNotifications'
import { useMusicPlayer, playlistSongToNowPlaying } from '@/context/MusicPlayerContext'
import { getAlbumTracks } from '@/services/api'
import { REMINDER_OPTIONS } from '@/utils/reminderOptions'
import { Album, LikedSong } from '@/types'
import { colors, fontSize } from '@/constants/token'

export default function FavoritesScreen() {
  const { favorites, loading, removeFavorite, reload } = useFavorites()
  const { likedSongs, loading: loadingLikedSongs, unlike, reload: reloadLikedSongs } = useLikedSongs()
  const { hasReminder, scheduleReminder, cancelReminder } = useNotifications()
  const { play, playQueue, nowPlaying, isPlaying } = useMusicPlayer()

  const [loadingAlbumId, setLoadingAlbumId] = useState<string | null>(null)

  // Atualiza ambas as listas sempre que a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      reload()
      reloadLikedSongs()
    }, [reload, reloadLikedSongs])
  )

  // ── Funcionalidade 1 — tocar música favorita: mesmo fluxo das playlists ───
  function handlePlayLikedSong(index: number) {
    if (likedSongs.length === 0) return
    const items = likedSongs.map(playlistSongToNowPlaying)
    playQueue(items, index)
    router.push('/player')
  }

  // ── Funcionalidade 2 — "▶ Reproduzir" em álbum favorito ───────────────────
  async function handlePlayAlbum(album: Album) {
    if (loadingAlbumId) return
    setLoadingAlbumId(album.idAlbum)
    try {
      const tracksData = await getAlbumTracks(album.idAlbum)
      if (tracksData.length === 0) {
        Alert.alert('Álbum vazio', 'Este álbum não possui faixas disponíveis.')
        return
      }
      const sorted = [...tracksData].sort(
        (a, b) => parseInt(a.intTrackNumber ?? '0') - parseInt(b.intTrackNumber ?? '0')
      )
      play(sorted[0], album, sorted)
      router.push('/player')
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as faixas deste álbum. Tente novamente.')
    } finally {
      setLoadingAlbumId(null)
    }
  }

  function confirmRemove(albumId: string, albumName: string) {
    Alert.alert(
      'Remover favorito',
      `Deseja remover "${albumName}" dos favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeFavorite(albumId),
        },
      ]
    )
  }

  function handleNotificationPress(album: Album) {
    if (hasReminder(album.idAlbum)) {
      Alert.alert(
        '🔔 Lembrete ativo',
        `Você já tem um lembrete para "${album.strAlbum}". Deseja cancelá-lo?`,
        [
          { text: 'Manter', style: 'cancel' },
          {
            text: 'Cancelar lembrete',
            style: 'destructive',
            onPress: async () => {
              await cancelReminder(album.idAlbum)
              Alert.alert('Lembrete cancelado', `Lembrete de "${album.strAlbum}" removido.`)
            },
          },
        ]
      )
    } else {
      Alert.alert(
        '🔔 Agendar lembrete',
        `Quando você quer ser lembrado de ouvir "${album.strAlbum}"?`,
        [
          ...REMINDER_OPTIONS.map((opt) => ({
            text: opt.label,
            onPress: async () => {
              const success = await scheduleReminder(
                album.idAlbum,
                album.strAlbum,
                album.strArtist,
                opt.seconds
              )
              if (success) {
                Alert.alert('✅ Lembrete agendado!', `Você receberá uma notificação: ${opt.label}.`)
              } else {
                Alert.alert(
                  'Permissão necessária',
                  'Ative as notificações nas configurações do dispositivo para usar esta funcionalidade.'
                )
              }
            },
          })),
          { text: 'Cancelar', style: 'cancel' },
        ]
      )
    }
  }

  if (loading || loadingLikedSongs) return <LoadingView />

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.idAlbum}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>Favoritos</Text>
            </View>

            {/* ── Seção: Músicas Favoritas ────────────────────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Músicas Favoritas</Text>
              <Text style={styles.sectionSubtitle}>
                {likedSongs.length === 0
                  ? 'Nenhuma música curtida'
                  : `${likedSongs.length} ${likedSongs.length === 1 ? 'música' : 'músicas'}`}
              </Text>
            </View>

            {likedSongs.length === 0 ? (
              <Text style={styles.emptySectionText}>
                Toque no ❤️ durante a reprodução para curtir uma música.
              </Text>
            ) : (
              <View style={styles.songsList}>
                {likedSongs.map((song, index) => {
                  const active = nowPlaying?.track.idTrack === song.songId
                  return (
                    <LikedSongRow
                      key={song.songId}
                      song={song}
                      isActive={active}
                      isPlaying={isPlaying && active}
                      onPress={() => handlePlayLikedSong(index)}
                      onUnlike={() => unlike(song.songId)}
                    />
                  )
                })}
              </View>
            )}

            {/* ── Seção: Álbuns Favoritos ─────────────────────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Álbuns Favoritos</Text>
              <Text style={styles.sectionSubtitle}>
                {favorites.length === 0
                  ? 'Nenhum álbum salvo'
                  : `${favorites.length} ${favorites.length === 1 ? 'álbum salvo' : 'álbuns salvos'}`}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <View style={styles.cardArea}>
              <AlbumCard
                album={item}
                onPress={() => router.push(`/tabs/songs/${item.idAlbum}`)}
              />
            </View>

            <View style={styles.itemActions}>
              {/* Funcionalidade 2 — Reproduzir álbum imediatamente, sem navegar */}
              <TouchableOpacity
                onPress={() => handlePlayAlbum(item)}
                style={styles.iconBtn}
                hitSlop={8}
                disabled={loadingAlbumId === item.idAlbum}
                accessibilityLabel="Reproduzir álbum"
              >
                {loadingAlbumId === item.idAlbum ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="play-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNotificationPress(item)}
                style={styles.iconBtn}
                hitSlop={8}
                accessibilityLabel={
                  hasReminder(item.idAlbum) ? 'Cancelar lembrete' : 'Agendar lembrete'
                }
              >
                <Ionicons
                  name={hasReminder(item.idAlbum) ? 'notifications' : 'notifications-outline'}
                  size={18}
                  color={hasReminder(item.idAlbum) ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => confirmRemove(item.idAlbum, item.strAlbum)}
                style={styles.iconBtn}
                hitSlop={8}
                accessibilityLabel="Remover dos favoritos"
              >
                <Ionicons name="trash-outline" size={18} color="#E05A6A" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            message="Você ainda não favoritou nenhum álbum. Explore e toque em ❤️ para salvar."
            icon="heart-outline"
          />
        }
      />
    </SafeAreaView>
  )
}

// ─── LikedSongRow ─────────────────────────────────────────────────────────────
// Mesmo padrão visual do SongRow das playlists: capa + overlay play/pause
// quando a faixa está ativa, destaque de fundo, nome/artista/álbum.

type LikedSongRowProps = {
  song: LikedSong
  isActive: boolean
  isPlaying: boolean
  onPress: () => void
  onUnlike: () => void
}

function LikedSongRow({ song, isActive, isPlaying, onPress, onUnlike }: LikedSongRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, isActive && styles.rowActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
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
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.songName, isActive && styles.songNameActive]} numberOfLines={1}>
          {song.songName}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>{song.artistName}</Text>
        <Text style={styles.albumName} numberOfLines={1}>{song.albumName}</Text>
      </View>

      {isActive && (
        <Ionicons name="volume-medium" size={16} color={colors.primary} style={styles.activeIcon} />
      )}

      <TouchableOpacity onPress={onUnlike} style={styles.removeBtn} hitSlop={10}>
        <Ionicons name="heart" size={18} color="#E05A6A" />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  emptySectionText: {
    paddingHorizontal: 24,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },

  // ── Lista de músicas favoritas ───────────────────────────────────────────
  songsList: {
    paddingHorizontal: 24,
  },
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

  // ── Lista de álbuns favoritos ────────────────────────────────────────────
  list: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardArea: {
    flex: 1,
  },
  itemActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 8,
  },
  iconBtn: {
    padding: 4,
    minWidth: 22,
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F4FF',
  },
})

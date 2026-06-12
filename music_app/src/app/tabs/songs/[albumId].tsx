import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { getAlbumById, getAlbumTracks, getArtistById } from '@/services/api'
import { LoadingView } from '@/components/LoadingView'
import { EmptyState } from '@/components/EmptyState'
import { FavoriteButton } from '@/components/FavoriteButton'
import { PlaylistPickerModal } from '@/components/PlaylistPickerModal'
import { CommentSection } from '@/components/CommentSection'
import { useFavorites } from '@/hooks/useFavorites'
import { usePlaylists } from '@/hooks/usePlaylists'
import { Album, Artist, PlaylistSong, Track } from '@/types'
import { colors } from '@/constants/token'

function formatDuration(ms: string | null): string {
  if (!ms) return '--:--'
  const total = Math.floor(parseInt(ms) / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AlbumDetailScreen() {
  const { albumId } = useLocalSearchParams<{ albumId: string }>()
  const [album, setAlbum] = useState<Album | null>(null)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Playlist modal
  const [playlistModal, setPlaylistModal] = useState(false)
  const [selectedSong, setSelectedSong] = useState<PlaylistSong | null>(null)

  const { isFavorite, toggleFavorite } = useFavorites()
  const { playlists, createPlaylist, addSongToPlaylist } = usePlaylists()

  const favored = album ? isFavorite(album.idAlbum) : false

  // ── "Explorar Álbum" refs ──────────────────────────────────────────────────
  const flatListRef = useRef<FlatList>(null)
  const trackHighlight = useRef(new Animated.Value(0)).current

  useEffect(() => { loadData() }, [albumId])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const [albumData, tracksData] = await Promise.all([
        getAlbumById(albumId),
        getAlbumTracks(albumId),
      ])
      if (!albumData) { setError('Álbum não encontrado.'); return }
      setAlbum(albumData)
      const sorted = [...tracksData].sort(
        (a, b) => parseInt(a.intTrackNumber ?? '0') - parseInt(b.intTrackNumber ?? '0')
      )
      setTracks(sorted)
      if (albumData.idArtist) {
        const artistData = await getArtistById(albumData.idArtist).catch(() => null)
        setArtist(artistData)
      }
    } catch {
      setError('Não foi possível carregar o álbum. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ── Explorar Álbum: rola para a primeira faixa + pulsa indicador ──────────
  function handleExplore() {
    if (tracks.length > 0) {
      flatListRef.current?.scrollToIndex({
        index: 0,
        animated: true,
        viewPosition: 0,
      })
    }
    trackHighlight.setValue(0)
    Animated.sequence([
      Animated.timing(trackHighlight, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(500),
      Animated.timing(trackHighlight, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start()
  }

  // ── Favoritar ─────────────────────────────────────────────────────────────
  async function handleToggleFavorite() {
    if (!album) return
    const added = await toggleFavorite(album)
    Alert.alert(
      added ? '❤️ Favoritado' : 'Removido',
      added
        ? `"${album.strAlbum}" foi adicionado aos seus favoritos.`
        : `"${album.strAlbum}" foi removido dos favoritos.`
    )
  }

  // ── [+] na faixa: abre modal com a música selecionada ────────────────────
  function handleOpenPlaylistForSong(track: Track) {
    if (!album) return
    const song: PlaylistSong = {
      songId: track.idTrack,
      songName: track.strTrack,
      artistName: album.strArtist,
      albumId: album.idAlbum,
      albumName: album.strAlbum,
      albumCover: album.strAlbumThumb,
    }
    setSelectedSong(song)
    setPlaylistModal(true)
  }

  async function handleSelectPlaylist(playlistId: string) {
    if (!selectedSong) return
    await addSongToPlaylist(playlistId, selectedSong)
    setPlaylistModal(false)
    Alert.alert('Adicionado! ✓', `"${selectedSong.songName}" foi adicionado à playlist.`)
    setSelectedSong(null)
  }

  async function handleCreateAndAdd(name: string) {
    if (!selectedSong) return
    const pl = await createPlaylist(name)
    await addSongToPlaylist(pl.id, selectedSong)
    setPlaylistModal(false)
    Alert.alert('Criado! ✓', `Playlist "${pl.name}" criada com "${selectedSong.songName}".`)
    setSelectedSong(null)
  }

  if (loading) {
    return (<><Stack.Screen options={{ title: 'Álbum' }} /><LoadingView /></>)
  }
  if (error || !album) {
    return (
      <><Stack.Screen options={{ title: 'Álbum' }} />
      <EmptyState message={error ?? 'Álbum não encontrado.'} icon="alert-circle-outline" /></>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: album.strAlbum,
          headerRight: () => (
            <FavoriteButton isFavorite={favored} onPress={handleToggleFavorite} size={26} />
          ),
        }}
      />

      <FlatList
        ref={flatListRef}
        data={tracks}
        keyExtractor={(item) => item.idTrack}
        renderItem={({ item, index }) => (
          <TrackRow
            item={item}
            index={index}
            onAddToPlaylist={() => handleOpenPlaylistForSong(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollToIndexFailed={() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
        }}
        ItemSeparatorComponent={() => <View style={styles.trackSeparator} />}
        ListHeaderComponent={
          <AlbumHeader
            album={album}
            artist={artist}
            trackCount={tracks.length}
            isFavorite={favored}
            onToggleFavorite={handleToggleFavorite}
            onExplore={handleExplore}
            trackHighlight={trackHighlight}
          />
        }
        ListEmptyComponent={
          <EmptyState message="Nenhuma faixa encontrada." icon="musical-note-outline" />
        }
        ListFooterComponent={
          <View style={styles.footerWrapper}>
            <View style={styles.commentsDivider} />
            <CommentSection albumId={albumId} />
          </View>
        }
      />

      <PlaylistPickerModal
        visible={playlistModal}
        playlists={playlists}
        currentSongId={selectedSong?.songId ?? ''}
        onClose={() => { setPlaylistModal(false); setSelectedSong(null) }}
        onSelectPlaylist={handleSelectPlaylist}
        onCreateAndAdd={handleCreateAndAdd}
      />
    </>
  )
}

// ─── TrackRow — número + nome + botão [+] ────────────────────────────────────

type TrackRowProps = {
  item: Track
  index: number
  onAddToPlaylist: () => void
}

function TrackRow({ item, index, onAddToPlaylist }: TrackRowProps) {
  return (
    <View style={styles.trackRow}>
      <Text style={styles.trackNumber}>{item.intTrackNumber ?? index + 1}</Text>
      <Text style={styles.trackName} numberOfLines={1}>
        {item.strTrack}
      </Text>
      <Text style={styles.trackDuration}>{formatDuration(item.intDuration)}</Text>
      <TouchableOpacity
        onPress={onAddToPlaylist}
        style={styles.trackAddBtn}
        hitSlop={8}
        activeOpacity={0.6}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  )
}

// ─── AlbumHeader ─────────────────────────────────────────────────────────────

type AlbumHeaderProps = {
  album: Album
  artist: Artist | null
  trackCount: number
  isFavorite: boolean
  onToggleFavorite: () => void
  onExplore: () => void
  trackHighlight: Animated.Value
}

function AlbumHeader({
  album,
  artist,
  trackCount,
  isFavorite,
  onToggleFavorite,
  onExplore,
  trackHighlight,
}: AlbumHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Capa */}
      {album.strAlbumThumb ? (
        <Image source={{ uri: album.strAlbumThumb }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Ionicons name="disc-outline" size={56} color={colors.primary} style={{ opacity: 0.4 }} />
        </View>
      )}

      {/* Título */}
      <Text style={styles.albumTitle}>{album.strAlbum}</Text>

      {/* Artista (clicável) */}
      <Pressable
        onPress={() => router.push(`/tabs/artists/${album.idArtist}`)}
        style={({ pressed }) => [styles.artistRow, pressed && styles.artistRowPressed]}
      >
        <Text style={styles.artistName}>{album.strArtist}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.primary} />
      </Pressable>

      {/* Pills: ano, gênero, label */}
      {(album.intYearReleased || album.strGenre || album.strLabel) ? (
        <View style={styles.pills}>
          {album.intYearReleased ? (
            <View style={styles.pill}><Text style={styles.pillText}>{album.intYearReleased}</Text></View>
          ) : null}
          {album.strGenre ? (
            <View style={styles.pill}><Text style={styles.pillText}>{album.strGenre}</Text></View>
          ) : null}
          {album.strLabel ? (
            <View style={styles.pill}><Text style={styles.pillText}>{album.strLabel}</Text></View>
          ) : null}
        </View>
      ) : null}

      {/* Ações: Favoritar + ▶ Explorar Álbum */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onToggleFavorite} activeOpacity={0.7}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? '#E05A6A' : colors.textMuted}
          />
          <Text style={[styles.actionLabel, isFavorite && { color: '#E05A6A' }]}>
            {isFavorite ? 'Favoritado' : 'Favoritar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.exploreBtn} onPress={onExplore} activeOpacity={0.8}>
          <Ionicons name="play-circle" size={18} color="#fff" />
          <Text style={styles.exploreBtnText}>Explorar Álbum</Text>
        </TouchableOpacity>
      </View>

      {/* Bio do artista */}
      {artist?.strBiographyEN ? (
        <View style={styles.bioCard}>
          <Text style={styles.bioLabel}>Sobre o artista</Text>
          <Text style={styles.bioText} numberOfLines={4}>{artist.strBiographyEN}</Text>
        </View>
      ) : null}

      {/* Indicador da tracklist com highlight animado */}
      <View style={styles.tracksLabelRow}>
        <Text style={styles.tracksHeader}>
          {trackCount} {trackCount === 1 ? 'faixa' : 'faixas'}
        </Text>
        <Animated.View
          style={[styles.tracksHighlightBar, { opacity: trackHighlight }]}
          pointerEvents="none"
        />
      </View>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  listContent: { paddingBottom: 40 },

  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  cover: {
    width: 210,
    height: 210,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
  coverPlaceholder: {
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  artistRowPressed: { opacity: 0.55 },
  artistName: { fontSize: 15, color: colors.primary, fontWeight: '600' },

  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  pill: {
    backgroundColor: '#EFF3FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pillText: { fontSize: 12, color: colors.primary, fontWeight: '600' },

  // Ações
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#F7F9FF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
  },
  actionLabel: { fontSize: 14, fontWeight: '600', color: colors.textMuted },

  // Botão Explorar
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  exploreBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Bio
  bioCard: {
    width: '100%',
    backgroundColor: '#F7F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  bioLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  bioText: { fontSize: 14, color: colors.textMuted, lineHeight: 21 },

  // Tracklist label + highlight
  tracksLabelRow: {
    alignSelf: 'stretch',
    marginBottom: 4,
    position: 'relative',
  },
  tracksHeader: {
    fontSize: 13,
    color: colors.textMuted,
    paddingVertical: 6,
  },
  tracksHighlightBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },

  // Track row
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 24,
    gap: 12,
  },
  trackNumber: {
    width: 24,
    textAlign: 'right',
    fontSize: 13,
    color: colors.textMuted,
  },
  trackName: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  trackDuration: { fontSize: 13, color: colors.textMuted },
  trackAddBtn: { padding: 2 },

  trackSeparator: {
    height: 1,
    backgroundColor: '#F0F4FF',
    marginLeft: 60,   // alinhado após o número
    marginRight: 24,
  },

  // Footer comentários
  footerWrapper: { marginTop: 8 },
  commentsDivider: {
    height: 1,
    backgroundColor: '#F0F4FF',
    marginHorizontal: 24,
    marginBottom: 16,
  },
})

import { useEffect, useState } from 'react'
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { getAlbumById, getAlbumTracks, getArtistById } from '@/services/api'
import { LoadingView } from '@/components/LoadingView'
import { EmptyState } from '@/components/EmptyState'
import { Album, Artist, Track } from '@/types'
import { colors } from '@/constants/token'

function formatDuration(ms: string | null): string {
  if (!ms) return '--:--'
  const totalSeconds = Math.floor(parseInt(ms) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function AlbumDetailScreen() {
  const { albumId } = useLocalSearchParams<{ albumId: string }>()
  const [album, setAlbum] = useState<Album | null>(null)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [albumId])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      // Fetch album details + tracks in parallel
      const [albumData, tracksData] = await Promise.all([
        getAlbumById(albumId),
        getAlbumTracks(albumId),
      ])

      if (!albumData) {
        setError('Álbum não encontrado.')
        return
      }

      setAlbum(albumData)

      const sorted = [...tracksData].sort(
        (a, b) =>
          parseInt(a.intTrackNumber ?? '0') - parseInt(b.intTrackNumber ?? '0')
      )
      setTracks(sorted)

      // Fetch artist biography — optional, fails gracefully
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

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Álbum' }} />
        <LoadingView />
      </>
    )
  }

  if (error || !album) {
    return (
      <>
        <Stack.Screen options={{ title: 'Álbum' }} />
        <EmptyState
          message={error ?? 'Álbum não encontrado.'}
          icon="alert-circle-outline"
        />
      </>
    )
  }

  return (
    <>
      <Stack.Screen options={{ title: album.strAlbum }} />
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.idTrack}
        renderItem={({ item, index }) => (
          <TrackRow item={item} index={index} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.trackSeparator} />}
        ListHeaderComponent={
          <AlbumHeader album={album} artist={artist} trackCount={tracks.length} />
        }
        ListEmptyComponent={
          <EmptyState
            message="Nenhuma faixa encontrada para este álbum."
            icon="musical-note-outline"
          />
        }
      />
    </>
  )
}

// ─── Track Row ──────────────────────────────────────────────────────────────

type TrackRowProps = { item: Track; index: number }

function TrackRow({ item, index }: TrackRowProps) {
  return (
    <View style={styles.trackRow}>
      <Text style={styles.trackNumber}>{item.intTrackNumber ?? index + 1}</Text>
      <Text style={styles.trackName} numberOfLines={1}>
        {item.strTrack}
      </Text>
      <Text style={styles.trackDuration}>{formatDuration(item.intDuration)}</Text>
    </View>
  )
}

// ─── Album Header ────────────────────────────────────────────────────────────

type AlbumHeaderProps = {
  album: Album
  artist: Artist | null
  trackCount: number
}

function AlbumHeader({ album, artist, trackCount }: AlbumHeaderProps) {
  function handleArtistPress() {
    router.push(`/tabs/artists/${album.idArtist}`)
  }

  return (
    <View style={styles.header}>
      {/* Capa do álbum */}
      {album.strAlbumThumb ? (
        <Image source={{ uri: album.strAlbumThumb }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Ionicons
            name="disc-outline"
            size={56}
            color={colors.primary}
            style={{ opacity: 0.4 }}
          />
        </View>
      )}

      {/* Nome do álbum */}
      <Text style={styles.albumTitle}>{album.strAlbum}</Text>

      {/* Nome do artista — navega para o perfil */}
      <Pressable
        onPress={handleArtistPress}
        style={({ pressed }) => [
          styles.artistRow,
          pressed && styles.artistRowPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Ver perfil de ${album.strArtist}`}
      >
        <Text style={styles.artistName}>{album.strArtist}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.primary} />
      </Pressable>

      {/* Pills: ano, gênero, label */}
      {(album.intYearReleased || album.strGenre || album.strLabel) ? (
        <View style={styles.pills}>
          {album.intYearReleased ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{album.intYearReleased}</Text>
            </View>
          ) : null}
          {album.strGenre ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{album.strGenre}</Text>
            </View>
          ) : null}
          {album.strLabel ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{album.strLabel}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Biografia do artista */}
      {artist?.strBiographyEN ? (
        <View style={styles.bioCard}>
          <Text style={styles.bioLabel}>Sobre o artista</Text>
          <Text style={styles.bioText} numberOfLines={4}>
            {artist.strBiographyEN}
          </Text>
        </View>
      ) : null}

      {/* Cabeçalho da lista de faixas */}
      <Text style={styles.tracksHeader}>
        {trackCount} {trackCount === 1 ? 'faixa' : 'faixas'}
      </Text>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 120,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  cover: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
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
  artistRowPressed: {
    opacity: 0.55,
  },
  artistName: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
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
  pillText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },

  // Artist bio card
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
  bioText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
  },

  // Tracks section
  tracksHeader: {
    fontSize: 13,
    color: colors.textMuted,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
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
  trackDuration: {
    fontSize: 13,
    color: colors.textMuted,
  },
  trackSeparator: {
    height: 1,
    backgroundColor: '#F0F4FF',
    marginHorizontal: 24,
  },
})

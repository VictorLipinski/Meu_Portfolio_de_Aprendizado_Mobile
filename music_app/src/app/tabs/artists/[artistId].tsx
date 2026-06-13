import { useEffect, useState } from 'react'
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { getArtistById, getAlbumsByArtistId } from '@/services/api'
import { AlbumCard } from '@/components/AlbumCard'
import { ShowCard } from '@/components/ShowCard'
import { LoadingView } from '@/components/LoadingView'
import { EmptyState } from '@/components/EmptyState'
import { Artist, Album, Show } from '@/types'
import { colors } from '@/constants/token'
import showsData from '@/data/shows.json'

export default function ArtistDetailScreen() {
  const { artistId } = useLocalSearchParams<{ artistId: string }>()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Shows filtrados para este artista — carregados localmente
  const shows = (showsData as Show[]).filter((s) => s.artistId === artistId)

  useEffect(() => {
    loadData()
  }, [artistId])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const [artistData, albumsData] = await Promise.all([
        getArtistById(artistId),
        getAlbumsByArtistId(artistId),
      ])
      setArtist(artistData)
      setAlbums(albumsData)
    } catch {
      setError('Não foi possível carregar os dados do artista.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Artista' }} />
        <LoadingView />
      </>
    )
  }

  if (error || !artist) {
    return (
      <>
        <Stack.Screen options={{ title: 'Artista' }} />
        <EmptyState
          message={error ?? 'Artista não encontrado.'}
          icon="alert-circle-outline"
        />
      </>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: artist.strArtist,
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      />
      <FlatList
        data={albums}
        keyExtractor={(item) => item.idAlbum}
        renderItem={({ item }) => (
          <AlbumCard
            album={item}
            onPress={() => router.push(`/tabs/songs/${item.idAlbum}`)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <ArtistHeader
            artist={artist}
            albumCount={albums.length}
            shows={shows}
            onOpenMap={() =>
              router.push({
                pathname: '/tabs/artists/shows-map',
                params: { artistId },
              })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState message="Nenhum álbum encontrado." icon="disc-outline" />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </>
  )
}

// ─── ArtistHeader ─────────────────────────────────────────────────────────────

type HeaderProps = {
  artist: Artist
  albumCount: number
  shows: Show[]
  onOpenMap: () => void
}

function ArtistHeader({ artist, albumCount, shows, onOpenMap }: HeaderProps) {
  return (
    <View style={styles.header}>
      {/* Foto */}
      {artist.strArtistThumb ? (
        <Image source={{ uri: artist.strArtistThumb }} style={styles.artistImage} />
      ) : (
        <View style={[styles.artistImage, styles.placeholderImage]}>
          <Ionicons name="person" size={48} color={colors.primary} style={{ opacity: 0.4 }} />
        </View>
      )}

      {/* Nome */}
      <Text style={styles.artistName}>{artist.strArtist}</Text>

      {/* Tags */}
      <View style={styles.tags}>
        {artist.strGenre ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{artist.strGenre}</Text>
          </View>
        ) : null}
        {artist.strCountry ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{artist.strCountry}</Text>
          </View>
        ) : null}
        {artist.intFormedYear ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>Desde {artist.intFormedYear}</Text>
          </View>
        ) : null}
      </View>

      {/* Biografia */}
      {artist.strBiographyEN ? (
        <Text style={styles.bio} numberOfLines={4}>
          {artist.strBiographyEN}
        </Text>
      ) : null}

      {/* ── Seção Próximos Shows ───────────────────────────────────── */}
      {shows.length > 0 ? (
        <View style={styles.showsSection}>
          {/* Cabeçalho da seção */}
          <View style={styles.showsHeader}>
            <Text style={styles.showsSectionTitle}>Próximos Shows</Text>
            <TouchableOpacity
              style={styles.mapBtn}
              onPress={onOpenMap}
              activeOpacity={0.7}
            >
              <Ionicons name="map-outline" size={15} color={colors.primary} />
              <Text style={styles.mapBtnText}>Ver no mapa</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de shows */}
          <View style={styles.showsList}>
            {shows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </View>
        </View>
      ) : null}

      {/* Cabeçalho da discografia */}
      <Text style={styles.sectionTitle}>
        Discografia · {albumCount} {albumCount === 1 ? 'álbum' : 'álbuns'}
      </Text>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
  },

  // Foto do artista
  artistImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderImage: {
    backgroundColor: '#E8EEFF',
  },

  // Nome e tags
  artistName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: '#EFF3FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },

  // Bio
  bio: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 20,
  },

  // Shows section
  showsSection: {
    alignSelf: 'stretch',
    marginTop: 24,
  },
  showsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  showsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF3FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  mapBtnText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  showsList: {
    gap: 10,
  },

  // Discografia
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    alignSelf: 'flex-start',
    marginTop: 24,
    marginBottom: 4,
  },

  // Separador de álbuns
  separator: {
    height: 1,
    backgroundColor: '#F0F4FF',
  },
})

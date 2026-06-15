/**
 * Search Tracks Screen — /tabs/playlist/search
 * ─────────────────────────────────────────────
 * Busca músicas via TheAudioDB e permite adicioná-las a uma playlist.
 *
 * Recebe `playlistId` como query param.
 * Estratégia de busca: pesquisa por artista/álbum → extrai faixas.
 * (A API gratuita não suporta busca direta por nome de faixa.)
 *
 * Fluxo: Playlist Detail ──[+ Adicionar Música]──► Esta tela
 *         Esta tela ──[← voltar]──► Playlist Detail (dados atualizados via useFocusEffect)
 */

import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { SearchBar } from '@/components/SearchBar'
import { EmptyState } from '@/components/EmptyState'
import { usePlaylists } from '@/hooks/usePlaylists'
import { useDebounce } from '@/hooks/useDebounce'
import { searchTracksForPlaylist, TrackWithAlbum } from '@/services/api'
import { PlaylistSong } from '@/types'
import { colors } from '@/constants/token'

// ─── Toast hook ───────────────────────────────────────────────────────────────

function useToast() {
  const [message, setMessage] = useState('')
  const opacity = useRef(new Animated.Value(0)).current

  function show(msg: string) {
    setMessage(msg)
    opacity.setValue(0)
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1600),
      Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start()
  }

  return { show, opacity, message }
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SearchTracksScreen() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>()
  const { addSongToPlaylist, isSongInPlaylist, getPlaylist } = usePlaylists()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TrackWithAlbum[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Set de songIds já adicionados nesta sessão (ou já na playlist)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  const toast = useToast()
  const debouncedQuery = useDebounce(query, 600)

  const playlist = getPlaylist(playlistId)

  // Pré-popula com músicas que já estão na playlist
  useEffect(() => {
    if (!playlist) return
    setAddedIds(new Set(playlist.songs.map((s) => s.songId)))
  }, [playlistId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Dispara busca quando query debounced muda
  useEffect(() => {
    const q = debouncedQuery.trim()
    if (!q) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }
    doSearch(q)
  }, [debouncedQuery])

  async function doSearch(q: string) {
    Keyboard.dismiss()
    setLoading(true)
    setError(null)
    try {
      const data = await searchTracksForPlaylist(q)
      setResults(data)
    } catch {
      setError('Não foi possível realizar a busca. Verifique sua conexão e tente novamente.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(item: TrackWithAlbum) {
    const alreadyIn =
      addedIds.has(item.idTrack) || isSongInPlaylist(playlistId, item.idTrack)

    if (alreadyIn) {
      toast.show('Música já está nesta playlist')
      return
    }

    const song: PlaylistSong = {
      songId: item.idTrack,
      songName: item.strTrack,
      artistName: item.album.strArtist,
      albumId: item.album.idAlbum,
      albumName: item.album.strAlbum,
      albumCover: item.album.strAlbumThumb,
    }

    await addSongToPlaylist(playlistId, song)
    setAddedIds((prev) => new Set([...prev, item.idTrack]))
    toast.show(`"${item.strTrack}" adicionada!`)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  function renderContent() {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centerText}>Buscando músicas…</Text>
        </View>
      )
    }

    if (error) {
      return <EmptyState message={error} icon="wifi-outline" />
    }

    if (!debouncedQuery.trim()) {
      return (
        <EmptyState
          message={`Digite o nome de um artista ou álbum para encontrar músicas e adicioná-las a "${playlist?.name ?? 'sua playlist'}".`}
          icon="search-outline"
        />
      )
    }

    if (results.length === 0) {
      return (
        <EmptyState
          message={`Nenhuma música encontrada para "${debouncedQuery}".\n\nTente buscar pelo nome do artista.`}
          icon="musical-note-outline"
        />
      )
    }

    return (
      <FlatList
        data={results}
        keyExtractor={(item) => `${item.idTrack}-${item.idAlbum}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <Text style={styles.resultCount}>
            {results.length} {results.length === 1 ? 'música encontrada' : 'músicas encontradas'}
          </Text>
        }
        renderItem={({ item }) => (
          <SearchResultRow
            item={item}
            added={addedIds.has(item.idTrack)}
            onAdd={() => handleAdd(item)}
          />
        )}
      />
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: playlist ? `Adicionar a "${playlist.name}"` : 'Buscar Música',
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      />

      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* ── Campo de busca ── */}
        <View style={styles.searchWrapper}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por artista ou álbum…"
            autoFocus
          />
          {query.length > 0 && !loading && (
            <Text style={styles.hint}>
              Mostrando faixas de "{query}"
            </Text>
          )}
        </View>

        {/* ── Conteúdo ── */}
        {renderContent()}

        {/* ── Toast ── */}
        <Animated.View
          style={[styles.toast, { opacity: toast.opacity }]}
          pointerEvents="none"
        >
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      </SafeAreaView>
    </>
  )
}

// ─── SearchResultRow ──────────────────────────────────────────────────────────

type RowProps = {
  item: TrackWithAlbum
  added: boolean
  onAdd: () => void
}

function SearchResultRow({ item, added, onAdd }: RowProps) {
  return (
    <View style={styles.row}>
      {/* Capa do álbum */}
      {item.album.strAlbumThumb ? (
        <Image source={{ uri: item.album.strAlbumThumb }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Ionicons
            name="musical-note"
            size={22}
            color={colors.primary}
            style={{ opacity: 0.45 }}
          />
        </View>
      )}

      {/* Info da faixa */}
      <View style={styles.info}>
        <Text style={styles.songName} numberOfLines={1}>
          {item.strTrack}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {item.album.strArtist}
        </Text>
        <Text style={styles.albumName} numberOfLines={1}>
          {item.album.strAlbum}
        </Text>
      </View>

      {/* Botão adicionar */}
      <TouchableOpacity
        style={[styles.addBtn, added && styles.addBtnDone]}
        onPress={onAdd}
        disabled={added}
        activeOpacity={0.75}
        hitSlop={6}
        accessibilityLabel={added ? 'Já adicionada' : `Adicionar ${item.strTrack}`}
      >
        {added ? (
          <Ionicons name="checkmark" size={17} color={colors.primary} />
        ) : (
          <Ionicons name="add" size={20} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Busca
  searchWrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 6,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    paddingLeft: 4,
  },

  // Loading / empty
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingBottom: 60,
  },
  centerText: {
    fontSize: 14,
    color: colors.textMuted,
  },

  // Lista
  list: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  resultCount: {
    fontSize: 12,
    color: colors.textMuted,
    paddingTop: 8,
    paddingBottom: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F4FF',
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 12,
  },
  cover: {
    width: 54,
    height: 54,
    borderRadius: 8,
  },
  coverPlaceholder: {
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  songName: {
    fontSize: 15,
    fontWeight: '700',
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

  // Botão +
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addBtnDone: {
    backgroundColor: '#EFF3FF',
    borderWidth: 1.5,
    borderColor: colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
    backgroundColor: '#2B2E4A',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 10,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
})

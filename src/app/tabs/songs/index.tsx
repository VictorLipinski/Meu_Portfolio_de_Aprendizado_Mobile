import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { SearchBar } from '@/components/SearchBar'
import { AlbumCard } from '@/components/AlbumCard'
import { LoadingView } from '@/components/LoadingView'
import { EmptyState } from '@/components/EmptyState'
import { searchAlbumsByArtist } from '@/services/api'
import { useDebounce } from '@/hooks/useDebounce'
import { Album } from '@/types'
import { colors } from '@/constants/token'

const POPULAR_ARTISTS = ['Coldplay', 'Taylor Swift', 'Imagine Dragons']

export default function AlbumsScreen() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Album[]>([])
  const [popularAlbums, setPopularAlbums] = useState<Album[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    loadPopularAlbums()
  }, [])

  useEffect(() => {
    if (debouncedQuery.trim().length > 1) {
      handleSearch(debouncedQuery.trim())
    } else {
      setSearchResults([])
      setError(null)
    }
  }, [debouncedQuery])

  async function loadPopularAlbums() {
    try {
      setLoadingPopular(true)
      const results = await Promise.all(
        POPULAR_ARTISTS.map((artist) => searchAlbumsByArtist(artist))
      )
      const combined = results.flat().filter((a) => a.strAlbumThumb)
      setPopularAlbums(combined)
    } catch {
      // popular albums são opcionais, não mostra erro crítico
    } finally {
      setLoadingPopular(false)
    }
  }

  async function handleSearch(text: string) {
    try {
      setLoadingSearch(true)
      setError(null)
      const results = await searchAlbumsByArtist(text)
      setSearchResults(results)
    } catch {
      setError('Não foi possível buscar. Verifique sua conexão e tente novamente.')
    } finally {
      setLoadingSearch(false)
    }
  }

  const isSearching = query.trim().length > 0
  const albums = isSearching ? searchResults : popularAlbums
  const isLoading = isSearching ? loadingSearch : loadingPopular

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Álbuns</Text>
        <Text style={styles.subtitle}>
          {isSearching ? `Resultados para "${query.trim()}"` : 'Populares'}
        </Text>
      </View>

      <View style={styles.searchWrapper}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por artista..."
        />
      </View>

      {isLoading ? (
        <LoadingView />
      ) : error ? (
        <EmptyState message={error} icon="alert-circle-outline" />
      ) : (
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
          ListEmptyComponent={
            isSearching ? (
              <EmptyState
                message="Nenhum álbum encontrado. Tente outro nome de artista."
                icon="disc-outline"
              />
            ) : null
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  searchWrapper: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F4FF',
  },
})

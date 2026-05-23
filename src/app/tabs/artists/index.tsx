import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { SearchBar } from '@/components/SearchBar'
import { ArtistCard } from '@/components/ArtistCard'
import { LoadingView } from '@/components/LoadingView'
import { EmptyState } from '@/components/EmptyState'
import { searchArtists } from '@/services/api'
import { useDebounce } from '@/hooks/useDebounce'
import { Artist } from '@/types'
import { colors } from '@/constants/token'

export default function ArtistsScreen() {
  const [query, setQuery] = useState('')
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    if (debouncedQuery.trim().length > 1) {
      handleSearch(debouncedQuery.trim())
    } else if (debouncedQuery.trim().length === 0) {
      setArtists([])
      setHasSearched(false)
      setError(null)
    }
  }, [debouncedQuery])

  async function handleSearch(text: string) {
    try {
      setLoading(true)
      setError(null)
      setHasSearched(true)
      const results = await searchArtists(text)
      setArtists(results)
    } catch {
      setError('Não foi possível buscar. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Artistas</Text>
        <Text style={styles.subtitle}>Encontre seus artistas favoritos</Text>
      </View>

      <View style={styles.searchWrapper}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar artista..."
        />
      </View>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <EmptyState message={error} icon="alert-circle-outline" />
      ) : !hasSearched ? (
        <EmptyState
          message="Digite o nome de um artista para começar a busca."
          icon="search-outline"
        />
      ) : (
        <FlatList
          data={artists}
          keyExtractor={(item) => item.idArtist}
          renderItem={({ item }) => (
            <ArtistCard
              artist={item}
              onPress={() => router.push(`/tabs/artists/${item.idArtist}`)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              message="Nenhum artista encontrado. Tente outro nome."
              icon="people-outline"
            />
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

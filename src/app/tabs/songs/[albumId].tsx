import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { getAlbumTracks } from '@/services/api'
import { LoadingView } from '@/components/LoadingView'
import { EmptyState } from '@/components/EmptyState'
import { Track } from '@/types'
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
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTracks()
  }, [albumId])

  async function loadTracks() {
    try {
      setLoading(true)
      setError(null)
      const result = await getAlbumTracks(albumId)
      const sorted = result.sort(
        (a, b) => parseInt(a.intTrackNumber ?? '0') - parseInt(b.intTrackNumber ?? '0')
      )
      setTracks(sorted)
    } catch {
      setError('Não foi possível carregar as faixas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {loading ? (
        <LoadingView />
      ) : error ? (
        <EmptyState message={error} icon="alert-circle-outline" />
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.idTrack}
          renderItem={({ item, index }) => (
            <View style={styles.track}>
              <Text style={styles.trackNumber}>
                {item.intTrackNumber ?? index + 1}
              </Text>
              <Text style={styles.trackName} numberOfLines={1}>
                {item.strTrack}
              </Text>
              <Text style={styles.trackDuration}>
                {formatDuration(item.intDuration)}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <Text style={styles.listHeader}>
              {tracks.length} {tracks.length === 1 ? 'faixa' : 'faixas'}
            </Text>
          )}
          ListEmptyComponent={
            <EmptyState
              message="Nenhuma faixa encontrada para este álbum."
              icon="musical-note-outline"
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
  list: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 120,
  },
  listHeader: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
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
  separator: {
    height: 1,
    backgroundColor: '#F0F4FF',
  },
})

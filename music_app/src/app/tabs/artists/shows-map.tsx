import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { ShowCard } from '@/components/ShowCard'
import { EmptyState } from '@/components/EmptyState'
import { colors } from '@/constants/token'
import { Show } from '@/types'
import showsData from '@/data/shows.json'

// react-native-maps não funciona na web — importamos condicionalmente
let MapView: any = null
let Marker: any = null
let Callout: any = null

if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps')
    MapView = maps.default
    Marker = maps.Marker
    Callout = maps.Callout
  } catch {
    // módulo nativo não disponível (ex: Expo Go sem build)
  }
}

// ─── Utilitários ─────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00Z')
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Calcula a região inicial do mapa para englobar todos os shows,
 * com um padding visual de 20%.
 */
function computeRegion(shows: Show[]) {
  if (shows.length === 0) {
    return { latitude: -15.0, longitude: -50.0, latitudeDelta: 40, longitudeDelta: 60 }
  }

  if (shows.length === 1) {
    return {
      latitude: shows[0].latitude,
      longitude: shows[0].longitude,
      latitudeDelta: 3,
      longitudeDelta: 3,
    }
  }

  const lats = shows.map((s) => s.latitude)
  const lngs = shows.map((s) => s.longitude)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  const deltaLat = (maxLat - minLat) * 1.4 || 5
  const deltaLng = (maxLng - minLng) * 1.4 || 5

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(deltaLat, 3),
    longitudeDelta: Math.max(deltaLng, 3),
  }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ShowsMapScreen() {
  const { artistId } = useLocalSearchParams<{ artistId: string }>()
  const shows = (showsData as Show[]).filter((s) => s.artistId === artistId)
  const artistName = shows[0]?.artistName ?? 'Artista'
  const region = computeRegion(shows)

  return (
    <>
      <Stack.Screen
        options={{
          title: `Shows · ${artistName}`,
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      />

      {shows.length === 0 ? (
        <EmptyState
          message="Nenhum show cadastrado para este artista."
          icon="calendar-outline"
        />
      ) : MapView ? (
        /* ── Mapa nativo ─────────────────────────────────────────────── */
        <View style={styles.container}>
          <MapView
            style={styles.map}
            initialRegion={region}
            showsUserLocation={false}
            showsMyLocationButton={false}
          >
            {shows.map((show) => (
              <Marker
                key={show.id}
                coordinate={{ latitude: show.latitude, longitude: show.longitude }}
                pinColor={colors.primary}
              >
                <Callout tooltip>
                  <View style={styles.callout}>
                    <Text style={styles.calloutArtist}>{show.artistName}</Text>
                    <Text style={styles.calloutVenue}>{show.venue}</Text>
                    <Text style={styles.calloutCity}>{show.city}</Text>
                    <Text style={styles.calloutDate}>{formatDate(show.date)}</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          {/* Lista flutuante na parte inferior */}
          <View style={styles.bottomSheet}>
            <View style={styles.bottomHandle} />
            <Text style={styles.bottomTitle}>
              {shows.length} {shows.length === 1 ? 'show' : 'shows'}
            </Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.bottomList}
            >
              {shows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </ScrollView>
          </View>
        </View>
      ) : (
        /* ── Fallback (web ou Expo Go sem módulo nativo) ─────────────── */
        <ScrollView
          style={styles.fallbackContainer}
          contentContainerStyle={styles.fallbackContent}
        >
          <View style={styles.fallbackBanner}>
            <Ionicons
              name="map-outline"
              size={52}
              color={colors.primary}
              style={{ opacity: 0.45 }}
            />
            <Text style={styles.fallbackTitle}>Mapa disponível em dev build</Text>
            <Text style={styles.fallbackSub}>
              O mapa interativo requer um build nativo (EAS Build ou expo run).
              {'\n'}Veja os shows abaixo:
            </Text>
          </View>

          <View style={styles.showsList}>
            {shows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </View>
        </ScrollView>
      )}
    </>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Mapa
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },

  // Callout (balão do marcador)
  callout: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    minWidth: 180,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  calloutArtist: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  calloutVenue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  calloutCity: {
    fontSize: 12,
    color: colors.textMuted,
  },
  calloutDate: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },

  // Bottom sheet flutuante
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    maxHeight: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDE3F0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  bottomTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  bottomList: {
    gap: 8,
    paddingBottom: 8,
  },

  // Fallback
  fallbackContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fallbackContent: {
    padding: 24,
    paddingBottom: 120,
  },
  fallbackBanner: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  fallbackTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  fallbackSub: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 21,
  },
  showsList: {
    gap: 10,
  },
})

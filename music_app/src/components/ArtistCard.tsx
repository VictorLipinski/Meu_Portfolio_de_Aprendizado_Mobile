import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize } from '@/constants/token'
import { Artist } from '@/types'

type Props = {
  artist: Artist
  onPress: () => void
}

export function ArtistCard({ artist, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {artist.strArtistThumb ? (
        <Image source={{ uri: artist.strArtistThumb }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Ionicons name="person" size={28} color={colors.primary} style={{ opacity: 0.5 }} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {artist.strArtist}
        </Text>
        {artist.strGenre ? (
          <Text style={styles.genre} numberOfLines={1}>
            {artist.strGenre}
          </Text>
        ) : null}
        {artist.strCountry ? (
          <Text style={styles.country} numberOfLines={1}>
            {artist.strCountry}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    backgroundColor: '#E8EEFF',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  genre: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  country: {
    fontSize: 12,
    color: colors.textMuted,
  },
})

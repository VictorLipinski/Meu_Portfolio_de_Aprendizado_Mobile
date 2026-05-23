import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors, fontSize } from '@/constants/token'
import { Album } from '@/types'

type Props = {
  album: Album
  onPress: () => void
}

export function AlbumCard({ album, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {album.strAlbumThumb ? (
        <Image source={{ uri: album.strAlbumThumb }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <View style={styles.info}>
        <Text style={styles.albumName} numberOfLines={1}>
          {album.strAlbum}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {album.strArtist}
        </Text>
        {album.intYearReleased ? (
          <Text style={styles.year}>{album.intYearReleased}</Text>
        ) : null}
      </View>
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
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  placeholder: {
    backgroundColor: '#E8EEFF',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  albumName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  artistName: {
    fontSize: 14,
    color: colors.textMuted,
  },
  year: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
})

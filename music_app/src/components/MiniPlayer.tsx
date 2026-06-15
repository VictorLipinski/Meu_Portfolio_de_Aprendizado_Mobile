/**
 * MiniPlayer
 * ──────────
 * Barra compacta exibida acima das tabs sempre que houver uma faixa ativa.
 * Toque na área principal → abre Now Playing.
 * Controles: play/pause + próxima faixa.
 */

import { useRef } from 'react'
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useMusicPlayer } from '@/context/MusicPlayerContext'
import { colors } from '@/constants/token'

export function MiniPlayer() {
  const { nowPlaying, isPlaying, togglePlay, next, duration, progress } = useMusicPlayer()

  const pressScale = useRef(new Animated.Value(1)).current

  if (!nowPlaying) return null

  const { track, album } = nowPlaying
  const progressRatio = duration > 0 ? progress / duration : 0

  function handlePressIn() {
    Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start()
  }
  function handlePressOut() {
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 50 }).start()
  }

  return (
    <Pressable
      onPress={() => router.push('/player')}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.container, { transform: [{ scale: pressScale }] }]}>
        {/* Barra de progresso no topo */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
        </View>

        <View style={styles.inner}>
          {/* Capa */}
          {album.strAlbumThumb ? (
            <Image source={{ uri: album.strAlbumThumb }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.coverFallback]}>
              <Ionicons name="disc-outline" size={20} color={colors.primary} />
            </View>
          )}

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.trackName} numberOfLines={1}>
              {track.strTrack}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {album.strArtist}
            </Text>
          </View>

          {/* Controles: play/pause + próxima */}
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation?.(); togglePlay() }}
            activeOpacity={0.7}
            hitSlop={8}
            style={styles.controlBtn}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={26}
              color={colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => { e.stopPropagation?.(); next() }}
            activeOpacity={0.7}
            hitSlop={8}
            style={styles.controlBtn}
          >
            <Ionicons name="play-skip-forward" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#EEF3FF',
    shadowColor: '#88a5dc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  progressTrack: {
    height: 2,
    backgroundColor: '#C4D9FF',
    width: '100%',
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  coverFallback: {
    backgroundColor: '#C4D9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  trackName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  artistName: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  controlBtn: {
    padding: 4,
  },
})

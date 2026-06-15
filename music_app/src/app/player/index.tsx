/**
 * Now Playing Screen — app/player/index.tsx
 * ──────────────────────────────────────────
 * Tela expandida de reprodução. Inspirada em Apple Music / Spotify.
 * - Usa MusicPlayerContext (sem duplicar estado)
 * - Curtida de MÚSICA individual via useLikedSongs
 * - Capa anima tamanho conforme play/pause (igual ao Apple Music)
 * - Barra de progresso com touch + drag via responder system
 * - Info do álbum (ano, gênero) abaixo dos controles
 */

import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useMusicPlayer } from '@/context/MusicPlayerContext'
import { useLikedSongs } from '@/hooks/useLikedSongs'
import { usePlaylists } from '@/hooks/usePlaylists'
import { useNotifications } from '@/hooks/useNotifications'
import { PlaylistPickerModal } from '@/components/PlaylistPickerModal'
import { EmptyState } from '@/components/EmptyState'
import { REMINDER_OPTIONS } from '@/utils/reminderOptions'
import { colors } from '@/constants/token'
import { LikedSong, PlaylistSong } from '@/types'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')
// Capa ocupa ~55% da altura útil da tela (área principal/visual da tela)
const COVER_SIZE = Math.min(SCREEN_W - 64, SCREEN_H * 0.55)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NowPlayingScreen() {
  const {
    nowPlaying,
    isPlaying,
    progress,
    duration,
    togglePlay,
    next,
    previous,
    seekTo,
  } = useMusicPlayer()

  const { isLiked, toggleLike } = useLikedSongs()
  const { playlists, createPlaylist, addSongToPlaylist } = usePlaylists()
  const { hasReminder, scheduleReminder, cancelReminder } = useNotifications()

  const [playlistModal, setPlaylistModal] = useState(false)

  // ── Animação da capa: encolhe quando pausado (igual ao Apple Music) ────────
  const coverScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.spring(coverScale, {
      toValue: isPlaying ? 1 : 0.88,
      useNativeDriver: true,
      bounciness: 6,
      speed: 5,
    }).start()
  }, [isPlaying, coverScale])

  // ── Sem faixa ativa ───────────────────────────────────────────────────────
  if (!nowPlaying) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={12}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <EmptyState
          message={'Nenhuma música em reprodução.\nToque em uma faixa para começar.'}
          icon="musical-note-outline"
        />
      </SafeAreaView>
    )
  }

  const { track, album } = nowPlaying
  const liked = isLiked(track.idTrack)
  const reminded = hasReminder(album.idAlbum)
  const progressRatio = duration > 0 ? Math.min(1, progress / duration) : 0

  // ── Curtir música (nível de faixa, não álbum) ─────────────────────────────
  async function handleToggleLike() {
    const song: LikedSong = {
      songId: track.idTrack,
      songName: track.strTrack,
      artistName: album.strArtist,
      albumId: album.idAlbum,
      albumName: album.strAlbum,
      albumCover: album.strAlbumThumb,
      likedAt: new Date().toISOString(),
    }
    const added = await toggleLike(song)
    // Pulso rápido no ícone
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, speed: 50 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start()
    if (added) Alert.alert('❤️ Curtida!', `"${track.strTrack}" adicionada às músicas curtidas.`)
  }

  const heartScale = useRef(new Animated.Value(1)).current

  // ── Lembrete ─────────────────────────────────────────────────────────────
  function handleReminderPress() {
    if (reminded) {
      Alert.alert(
        '🔔 Lembrete ativo',
        `Você já tem um lembrete para "${album.strAlbum}". Deseja cancelá-lo?`,
        [
          { text: 'Manter', style: 'cancel' },
          {
            text: 'Cancelar lembrete',
            style: 'destructive',
            onPress: async () => {
              await cancelReminder(album.idAlbum)
              Alert.alert('Cancelado', `Lembrete de "${album.strAlbum}" removido.`)
            },
          },
        ]
      )
    } else {
      Alert.alert(
        '🔔 Lembrar-me',
        `Quando quer ser lembrado de ouvir "${album.strAlbum}"?`,
        [
          ...REMINDER_OPTIONS.map((opt) => ({
            text: opt.label,
            onPress: async () => {
              const ok = await scheduleReminder(
                album.idAlbum,
                album.strAlbum,
                album.strArtist,
                opt.seconds
              )
              if (ok) {
                Alert.alert('✅ Agendado!', `Você será lembrado: ${opt.label}.`)
              } else {
                Alert.alert(
                  'Permissão necessária',
                  'Ative as notificações nas configurações do dispositivo.'
                )
              }
            },
          })),
          { text: 'Cancelar', style: 'cancel' },
        ]
      )
    }
  }

  // ── Playlist ──────────────────────────────────────────────────────────────
  async function handleSelectPlaylist(playlistId: string) {
    const song: PlaylistSong = {
      songId: track.idTrack,
      songName: track.strTrack,
      artistName: album.strArtist,
      albumId: album.idAlbum,
      albumName: album.strAlbum,
      albumCover: album.strAlbumThumb,
    }
    await addSongToPlaylist(playlistId, song)
    setPlaylistModal(false)
    Alert.alert('Adicionado! ✓', `"${track.strTrack}" foi adicionado à playlist.`)
  }

  async function handleCreateAndAdd(name: string) {
    const song: PlaylistSong = {
      songId: track.idTrack,
      songName: track.strTrack,
      artistName: album.strArtist,
      albumId: album.idAlbum,
      albumName: album.strAlbum,
      albumCover: album.strAlbumThumb,
    }
    const pl = await createPlaylist(name)
    await addSongToPlaylist(pl.id, song)
    setPlaylistModal(false)
    Alert.alert('Criado! ✓', `Playlist "${pl.name}" criada com "${track.strTrack}".`)
  }

  // ── Progress bar: onLayout + responder ───────────────────────────────────
  const progressBarWidth = useRef(0)

  function clampedSeek(locationX: number) {
    if (progressBarWidth.current <= 0) return
    const ratio = Math.max(0, Math.min(1, locationX / progressBarWidth.current))
    seekTo(ratio)
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={12}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>REPRODUZINDO AGORA</Text>
          <Text style={styles.headerAlbum} numberOfLines={1}>
            {album.strAlbum}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setPlaylistModal(true)}
          style={styles.headerBtn}
          hitSlop={12}
        >
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Capa do álbum ──────────────────────────────────────────────────── */}
      <View style={styles.coverWrapper}>
        <Animated.View style={[styles.coverShadow, { transform: [{ scale: coverScale }] }]}>
          {album.strAlbumThumb ? (
            <Image
              source={{ uri: album.strAlbumThumb }}
              style={styles.cover}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cover, styles.coverFallback]}>
              <Ionicons
                name="disc-outline"
                size={80}
                color={colors.primary}
                style={{ opacity: 0.4 }}
              />
            </View>
          )}
        </Animated.View>
      </View>

      {/* ── Info da faixa + Curtir ─────────────────────────────────────────── */}
      <View style={styles.trackInfo}>
        <View style={styles.trackTextCol}>
          <Text style={styles.trackName} numberOfLines={1}>
            {track.strTrack}
          </Text>
          <Pressable
            onPress={() => album.idArtist && router.push(`/tabs/artists/${album.idArtist}`)}
            disabled={!album.idArtist}
          >
            <Text style={styles.artistName} numberOfLines={1}>
              {album.strArtist}
            </Text>
          </Pressable>
        </View>

        <TouchableOpacity onPress={handleToggleLike} hitSlop={10} activeOpacity={0.7}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={28}
              color={liked ? '#E05A6A' : '#C0CAD8'}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* ── Barra de progresso ─────────────────────────────────────────────── */}
      <View style={styles.progressSection}>
        {/* Touch/drag via responder system — sem measure() async */}
        <View
          style={styles.progressTrack}
          onLayout={(e) => { progressBarWidth.current = e.nativeEvent.layout.width }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(e) => clampedSeek(e.nativeEvent.locationX)}
          onResponderMove={(e) => clampedSeek(e.nativeEvent.locationX)}
        >
          <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]}>
            <View style={styles.progressThumb} />
          </View>
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(progress)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* ── Controles de reprodução ────────────────────────────────────────── */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={previous} activeOpacity={0.7} hitSlop={10}>
          <Ionicons name="play-skip-back" size={32} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlay}
          activeOpacity={0.85}
          style={styles.playPauseBtn}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={34}
            color="#fff"
            style={isPlaying ? undefined : { marginLeft: 3 }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={next} activeOpacity={0.7} hitSlop={10}>
          <Ionicons name="play-skip-forward" size={32} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* ── Ações secundárias ─────────────────────────────────────────────── */}
      <View style={styles.actions}>
        <ActionChip
          icon={reminded ? 'notifications' : 'notifications-outline'}
          label={reminded ? 'Lembrete ativo' : 'Lembrar-me'}
          onPress={handleReminderPress}
          active={reminded}
        />
        <ActionChip
          icon="add-circle-outline"
          label="Playlist"
          onPress={() => setPlaylistModal(true)}
          active={false}
        />
      </View>

      {/* ── Info do álbum (ano · gênero) ───────────────────────────────────── */}
      <View style={styles.albumInfoRow}>
        <Ionicons name="disc-outline" size={14} color={colors.textMuted} />
        <Text style={styles.albumInfoText} numberOfLines={1}>
          {album.strAlbum}
          {album.intYearReleased ? ` · ${album.intYearReleased}` : ''}
          {album.strGenre ? ` · ${album.strGenre}` : ''}
        </Text>
      </View>

      {/* ── Modal de playlists ─────────────────────────────────────────────── */}
      <PlaylistPickerModal
        visible={playlistModal}
        playlists={playlists}
        currentSongId={track.idTrack}
        onClose={() => setPlaylistModal(false)}
        onSelectPlaylist={handleSelectPlaylist}
        onCreateAndAdd={handleCreateAndAdd}
      />
    </SafeAreaView>
  )
}

// ─── ActionChip ───────────────────────────────────────────────────────────────

type ActionChipProps = {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  active: boolean
}

function ActionChip({ icon, label, onPress, active }: ActionChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        active && { borderColor: `${colors.primary}60`, backgroundColor: `${colors.primary}12` },
      ]}
    >
      <Ionicons name={icon} size={17} color={active ? colors.primary : colors.textMuted} />
      <Text style={[styles.chipLabel, active && { color: colors.primary }]}>{label}</Text>
    </TouchableOpacity>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerAlbum: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
    maxWidth: SCREEN_W - 140,
  },

  // ── Capa
  coverWrapper: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 28,
  },
  coverShadow: {
    shadowColor: '#5a7fc4',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.30,
    shadowRadius: 28,
    elevation: 16,
    borderRadius: 20,
  },
  cover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 20,
  },
  coverFallback: {
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Info da faixa
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 36,
    marginBottom: 20,
    gap: 12,
  },
  trackTextCol: {
    flex: 1,
  },
  trackName: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  artistName: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500',
  },

  // ── Progresso
  progressSection: {
    paddingHorizontal: 36,
    marginBottom: 28,
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#DDE5F5',
    borderRadius: 3,
    justifyContent: 'center',
  },
  progressFill: {
    height: 5,
    backgroundColor: colors.primary,
    borderRadius: 3,
    position: 'relative',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  progressThumb: {
    position: 'absolute',
    right: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    elevation: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },

  // ── Controles
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 44,
    marginBottom: 32,
    paddingHorizontal: 36,
  },
  playPauseBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 8,
  },

  // ── Chips de ação
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 36,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DDE5F5',
    backgroundColor: '#F7F9FF',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },

  // ── Info do álbum
  albumInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 36,
  },
  albumInfoText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'center',
  },
})

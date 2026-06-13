/**
 * Now Playing Screen — app/player/index.tsx
 * ──────────────────────────────────────────
 * Tela expandida de reprodução. Inspirada em Apple Music / Spotify.
 * Usa MusicPlayerContext (sem duplicar estado).
 * Integra: favoritos, playlists e lembretes já existentes.
 */

import { useRef, useState } from 'react'
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
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
import { useFavorites } from '@/hooks/useFavorites'
import { usePlaylists } from '@/hooks/usePlaylists'
import { useNotifications } from '@/hooks/useNotifications'
import { PlaylistPickerModal } from '@/components/PlaylistPickerModal'
import { EmptyState } from '@/components/EmptyState'
import { REMINDER_OPTIONS } from '@/utils/reminderOptions'
import { colors } from '@/constants/token'
import { PlaylistSong } from '@/types'

const { width: SCREEN_W } = Dimensions.get('window')
const COVER_SIZE = SCREEN_W - 72

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ─── Componente principal ─────────────────────────────────────────────────────

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

  const { isFavorite, toggleFavorite } = useFavorites()
  const { playlists, createPlaylist, addSongToPlaylist } = usePlaylists()
  const { hasReminder, scheduleReminder, cancelReminder } = useNotifications()

  const [playlistModal, setPlaylistModal] = useState(false)

  // Animação de escala da capa ao trocar play/pause
  const coverScale = useRef(new Animated.Value(1)).current

  // ── Sem faixa ativa ───────────────────────────────────────────────────────
  if (!nowPlaying) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <CloseButton />
        <EmptyState
          message="Nenhuma música em reprodução.\nToque em uma faixa para começar."
          icon="musical-note-outline"
        />
      </SafeAreaView>
    )
  }

  const { track, album } = nowPlaying
  const favored = isFavorite(album.idAlbum)
  const reminded = hasReminder(album.idAlbum)
  const progressRatio = duration > 0 ? progress / duration : 0

  // ── Ações ─────────────────────────────────────────────────────────────────

  function handleTogglePlay() {
    // Animação de pulso na capa
    Animated.sequence([
      Animated.spring(coverScale, {
        toValue: isPlaying ? 0.92 : 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 6,
      }),
    ]).start()
    togglePlay()
  }

  async function handleToggleFavorite() {
    const added = await toggleFavorite(album)
    Alert.alert(
      added ? '❤️ Favoritado' : 'Removido dos favoritos',
      added
        ? `"${album.strAlbum}" adicionado aos favoritos.`
        : `"${album.strAlbum}" removido dos favoritos.`
    )
  }

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
              Alert.alert('Lembrete cancelado', `Lembrete de "${album.strAlbum}" removido.`)
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

  // ── Seek por toque na barra ───────────────────────────────────────────────
  const progressBarRef = useRef<View>(null)

  function handleProgressPress(event: any) {
    progressBarRef.current?.measure((_x, _y, width) => {
      const ratio = event.nativeEvent.locationX / width
      seekTo(ratio)
    })
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>REPRODUZINDO AGORA</Text>
          <Text style={styles.headerAlbum} numberOfLines={1}>
            {album.strAlbum}
          </Text>
        </View>

        {/* Botão playlist no header */}
        <TouchableOpacity
          onPress={() => setPlaylistModal(true)}
          style={styles.closeBtn}
          hitSlop={12}
        >
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Capa do Álbum ── */}
      <View style={styles.coverWrapper}>
        <Animated.View style={[styles.coverShadow, { transform: [{ scale: coverScale }] }]}>
          {album.strAlbumThumb ? (
            <Image source={{ uri: album.strAlbumThumb }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.coverFallback]}>
              <Ionicons name="disc-outline" size={80} color={colors.primary} style={{ opacity: 0.4 }} />
            </View>
          )}
        </Animated.View>
      </View>

      {/* ── Info da faixa + Favoritar ── */}
      <View style={styles.trackInfo}>
        <View style={styles.trackTextCol}>
          <Text style={styles.trackName} numberOfLines={1}>
            {track.strTrack}
          </Text>
          <Pressable onPress={() => router.push(`/tabs/artists/${album.idArtist}`)}>
            <Text style={styles.artistName} numberOfLines={1}>
              {album.strArtist}
            </Text>
          </Pressable>
        </View>

        <TouchableOpacity onPress={handleToggleFavorite} hitSlop={8} activeOpacity={0.7}>
          <Animated.View>
            <Ionicons
              name={favored ? 'heart' : 'heart-outline'}
              size={28}
              color={favored ? '#E05A6A' : '#C0CAD8'}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* ── Barra de progresso ── */}
      <View style={styles.progressSection}>
        <Pressable onPress={handleProgressPress}>
          <View ref={progressBarRef} style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]}>
              <View style={styles.progressThumb} />
            </View>
          </View>
        </Pressable>

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(progress)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* ── Controles ── */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={previous} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="play-skip-back" size={32} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleTogglePlay} activeOpacity={0.85} style={styles.playPauseBtn}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={34}
            color="#fff"
            style={isPlaying ? {} : { marginLeft: 3 }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={next} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="play-skip-forward" size={32} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* ── Ações secundárias ── */}
      <View style={styles.actions}>
        <ActionChip
          icon={reminded ? 'notifications' : 'notifications-outline'}
          label={reminded ? 'Lembrete ativo' : 'Lembrar-me'}
          onPress={handleReminderPress}
          active={reminded}
          activeColor={colors.primary}
        />

        <ActionChip
          icon="add-circle-outline"
          label="Playlist"
          onPress={() => setPlaylistModal(true)}
          active={false}
          activeColor={colors.primary}
        />
      </View>

      {/* ── Modal de Playlists ── */}
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

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function CloseButton() {
  return (
    <TouchableOpacity onPress={() => router.back()} style={styles.closeBtnStandalone} hitSlop={12}>
      <Ionicons name="chevron-down" size={28} color={colors.text} />
    </TouchableOpacity>
  )
}

type ActionChipProps = {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  active: boolean
  activeColor: string
}

function ActionChip({ icon, label, onPress, active, activeColor }: ActionChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, active && { borderColor: activeColor + '60', backgroundColor: activeColor + '12' }]}
    >
      <Ionicons name={icon} size={18} color={active ? activeColor : colors.textMuted} />
      <Text style={[styles.chipLabel, active && { color: activeColor }]}>{label}</Text>
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
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnStandalone: {
    margin: 20,
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
    marginTop: 24,
    marginBottom: 32,
  },
  coverShadow: {
    shadowColor: '#5a7fc4',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.32,
    shadowRadius: 32,
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

  // ── Track info
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 36,
    marginBottom: 24,
    gap: 12,
  },
  trackTextCol: {
    flex: 1,
  },
  trackName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  artistName: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },

  // ── Progresso
  progressSection: {
    paddingHorizontal: 36,
    marginBottom: 32,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#DDE5F5',
    borderRadius: 2,
    overflow: 'visible',
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  progressThumb: {
    position: 'absolute',
    right: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
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
    gap: 40,
    marginBottom: 36,
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
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },

  // ── Ações secundárias
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 36,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
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
})

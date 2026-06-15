import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'

import { useAuth } from '@/context/AuthContext'
import { useFavorites } from '@/hooks/useFavorites'
import { usePlaylists } from '@/hooks/usePlaylists'
import { useNotifications } from '@/hooks/useNotifications'
import { colors } from '@/constants/token'

function formatScheduled(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const { favorites, reload: reloadFavs } = useFavorites()
  const { playlists, reload: reloadPlaylists } = usePlaylists()
  const { reminders, cancelReminder, reload: reloadReminders } = useNotifications()

  useFocusEffect(
    useCallback(() => {
      reloadFavs()
      reloadPlaylists()
      reloadReminders()
    }, [reloadFavs, reloadPlaylists, reloadReminders])
  )

  // ── Bug fix: usa p.songs (antes usava p.albums que não existe mais) ──────────
  const totalSongsInPlaylists = playlists.reduce((sum, p) => sum + (p.songs?.length ?? 0), 0)

  const displayName = user?.name ?? 'Visitante'
  const displayHandle = user ? `@${user.email.split('@')[0]}` : '@visitante'
  const isGuest = !user

  function confirmLogout() {
    if (!user) { router.replace('/'); return }
    Alert.alert(
      'Sair da conta',
      `Deseja encerrar a sessão de ${user.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => { await signOut(); router.replace('/') },
        },
      ]
    )
  }

  function confirmCancelReminder(albumId: string, albumName: string) {
    Alert.alert(
      'Cancelar lembrete',
      `Deseja cancelar o lembrete de "${albumName}"?`,
      [
        { text: 'Manter', style: 'cancel' },
        {
          text: 'Cancelar lembrete',
          style: 'destructive',
          onPress: () => cancelReminder(albumId),
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.screenTitle}>Perfil</Text>

        {/* ── Avatar ────────────────────────────────────────────────────── */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, isGuest && styles.avatarGuest]}>
            <Ionicons
              name={isGuest ? 'person-outline' : 'person'}
              size={48}
              color={colors.primary}
              style={{ opacity: isGuest ? 0.4 : 0.7 }}
            />
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.handle}>{displayHandle}</Text>

          {isGuest ? (
            <TouchableOpacity style={styles.loginBadge} onPress={() => router.push('/')} activeOpacity={0.7}>
              <Ionicons name="log-in-outline" size={13} color={colors.primary} />
              <Text style={styles.loginBadgeText}>Entrar ou cadastrar</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.badge}>
              <Ionicons name="musical-note" size={12} color={colors.primary} />
              <Text style={styles.badgeText}>Membro desde {user!.createdAt.slice(0, 4)}</Text>
            </View>
          )}
        </View>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard icon="heart" label="Favoritos" value={favorites.length}
            iconColor="#E05A6A" onPress={() => router.push('/tabs/favorites')} />
          <StatCard icon="musical-notes" label="Playlists" value={playlists.length}
            iconColor={colors.primary} onPress={() => router.push('/tabs/playlist')} />
          <StatCard icon="musical-note" label="Músicas" value={totalSongsInPlaylists}
            iconColor="#6B8DD6" />
        </View>

        {/* ── Lembretes ativos ──────────────────────────────────────────── */}
        {reminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>LEMBRETES ATIVOS</Text>
            {reminders.map((reminder) => (
              <View key={reminder.id}>
                <View style={styles.reminderRow}>
                  <View style={styles.reminderIcon}>
                    <Ionicons name="notifications" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderAlbum} numberOfLines={1}>
                      {reminder.albumName}
                    </Text>
                    <Text style={styles.reminderArtist} numberOfLines={1}>
                      {reminder.artistName} · {formatScheduled(reminder.scheduledFor)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => confirmCancelReminder(reminder.albumId, reminder.albumName)}
                    hitSlop={10}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="#E05A6A" />
                  </TouchableOpacity>
                </View>
                <View style={styles.divider} />
              </View>
            ))}
          </View>
        )}

        {/* ── Biblioteca ────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BIBLIOTECA</Text>
          <MenuItem icon="heart-outline" label="Meus Favoritos"
            detail={`${favorites.length} álbuns`} onPress={() => router.push('/tabs/favorites')} />
          <View style={styles.divider} />
          <MenuItem icon="list-outline" label="Minhas Playlists"
            detail={`${playlists.length} playlists`} onPress={() => router.push('/tabs/playlist')} />
        </View>

        {/* ── Descobrir ─────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DESCOBRIR</Text>
          <MenuItem icon="disc-outline" label="Explorar Álbuns"
            onPress={() => router.push('/tabs/songs')} />
          <View style={styles.divider} />
          <MenuItem icon="people-outline" label="Buscar Artistas"
            onPress={() => router.push('/tabs/artists')} />
        </View>

        {/* ── Conta ─────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONTA</Text>
          <MenuItem
            icon={isGuest ? 'log-in-outline' : 'log-out-outline'}
            label={isGuest ? 'Fazer login' : 'Sair da conta'}
            onPress={confirmLogout}
            destructive={!isGuest}
          />
        </View>

        <Text style={styles.version}>Noomi · v4.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap; label: string; value: number
  iconColor: string; onPress?: () => void
}

function StatCard({ icon, label, value, iconColor, onPress }: StatCardProps) {
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.statIconWrap, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap; label: string; detail?: string
  onPress: () => void; destructive?: boolean
}

function MenuItem({ icon, label, detail, onPress, destructive }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={20} color={destructive ? '#E05A6A' : colors.text} />
      <Text style={[styles.menuLabel, destructive && styles.menuLabelDestructive]}>{label}</Text>
      {detail ? <Text style={styles.menuDetail}>{detail}</Text> : null}
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 120 },
  screenTitle: {
    fontSize: 28, fontWeight: '800', color: colors.text,
    paddingHorizontal: 24, paddingTop: 8, paddingBottom: 20,
  },
  profileCard: { alignItems: 'center', paddingBottom: 24 },
  avatar: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#EFF3FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarGuest: { backgroundColor: '#F5F5F5' },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  handle: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#EFF3FF', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, marginTop: 10,
  },
  badgeText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  loginBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#EFF3FF', paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, marginTop: 10,
  },
  loginBadgeText: { fontSize: 13, color: colors.primary, fontWeight: '700' },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: '#F7F9FF', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', gap: 5,
  },
  statIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500', textAlign: 'center' },

  // Menu sections
  section: {
    marginHorizontal: 24, marginBottom: 16,
    backgroundColor: '#F7F9FF', borderRadius: 16, overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.8,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.text },
  menuLabelDestructive: { color: '#E05A6A' },
  menuDetail: { fontSize: 13, color: colors.textMuted },
  divider: { height: 1, backgroundColor: '#E8EEFF', marginLeft: 48 },

  // Reminders
  reminderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  reminderIcon: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#EFF3FF',
    alignItems: 'center', justifyContent: 'center',
  },
  reminderInfo: { flex: 1 },
  reminderAlbum: { fontSize: 14, fontWeight: '600', color: colors.text },
  reminderArtist: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  version: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: 4 },
})

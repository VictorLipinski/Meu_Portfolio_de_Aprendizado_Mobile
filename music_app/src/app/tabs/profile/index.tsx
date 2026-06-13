import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'

import { useAuth } from '@/context/AuthContext'
import { useFavorites } from '@/hooks/useFavorites'
import { usePlaylists } from '@/hooks/usePlaylists'
import { colors } from '@/constants/token'

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const { favorites, reload: reloadFavs } = useFavorites()
  const { playlists, reload: reloadPlaylists } = usePlaylists()

  useFocusEffect(
    useCallback(() => {
      reloadFavs()
      reloadPlaylists()
    }, [reloadFavs, reloadPlaylists])
  )

  const totalAlbumsInPlaylists = playlists.reduce(
  (sum, p) => sum + (p.albums?.length || 0),
  0
)

  function confirmLogout() {
    if (!user) {
      router.replace('/')
      return
    }
    Alert.alert(
      'Sair da conta',
      `Deseja encerrar a sessão de ${user.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut()
            router.replace('/')
          },
        },
      ]
    )
  }

  // Display data — real if logged in, placeholder if guest
  const displayName = user?.name ?? 'Visitante'
  const displayHandle = user ? `@${user.email.split('@')[0]}` : '@visitante'
  const isGuest = !user

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.screenTitle}>Perfil</Text>

        {/* ── Avatar + Info ─────────────────────────────────────────────── */}
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
            <TouchableOpacity
              style={styles.loginBadge}
              onPress={() => router.push('/')}
              activeOpacity={0.7}
            >
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
          <StatCard
            icon="heart"
            label="Favoritos"
            value={favorites.length}
            iconColor="#E05A6A"
            onPress={() => router.push('/tabs/favorites')}
          />
          <StatCard
            icon="musical-notes"
            label="Playlists"
            value={playlists.length}
            iconColor={colors.primary}
            onPress={() => router.push('/tabs/playlist')}
          />
          <StatCard
            icon="disc-outline"
            label="Em playlists"
            value={totalAlbumsInPlaylists}
            iconColor="#6B8DD6"
          />
        </View>

        {/* ── Biblioteca ────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BIBLIOTECA</Text>
          <MenuItem
            icon="heart-outline"
            label="Meus Favoritos"
            detail={`${favorites.length} álbuns`}
            onPress={() => router.push('/tabs/favorites')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="list-outline"
            label="Minhas Playlists"
            detail={`${playlists.length} playlists`}
            onPress={() => router.push('/tabs/playlist')}
          />
        </View>

        {/* ── Descobrir ─────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DESCOBRIR</Text>
          <MenuItem
            icon="disc-outline"
            label="Explorar Álbuns"
            onPress={() => router.push('/tabs/songs')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="people-outline"
            label="Buscar Artistas"
            onPress={() => router.push('/tabs/artists')}
          />
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

        <Text style={styles.version}>Noomi · v3.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: number
  iconColor: string
  onPress?: () => void
}

function StatCard({ icon, label, value, iconColor, onPress }: StatCardProps) {
  return (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.statIconWrap, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

// ─── MenuItem ─────────────────────────────────────────────────────────────────

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  detail?: string
  onPress: () => void
  destructive?: boolean
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  profileCard: { alignItems: 'center', paddingBottom: 24 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarGuest: { backgroundColor: '#F5F5F5' },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  handle: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF3FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  badgeText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  loginBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF3FF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 10,
  },
  loginBadgeText: { fontSize: 13, color: colors.primary, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#F7F9FF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 5,
  },
  statIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500', textAlign: 'center' },
  section: { marginHorizontal: 24, marginBottom: 16, backgroundColor: '#F7F9FF', borderRadius: 16, overflow: 'hidden' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.text },
  menuLabelDestructive: { color: '#E05A6A' },
  menuDetail: { fontSize: 13, color: colors.textMuted },
  divider: { height: 1, backgroundColor: '#E8EEFF', marginLeft: 48 },
  version: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: 4 },
})

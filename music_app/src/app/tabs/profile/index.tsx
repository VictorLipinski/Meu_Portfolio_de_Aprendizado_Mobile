import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'

import { useFavorites } from '@/hooks/useFavorites'
import { usePlaylists } from '@/hooks/usePlaylists'
import { colors } from '@/constants/token'

const USER = { name: 'Usuário Noomi', handle: '@noomiuser', since: '2025' }

export default function ProfileScreen() {
  const { favorites, reload: reloadFavs } = useFavorites()
  const { playlists, reload: reloadPlaylists } = usePlaylists()

  useFocusEffect(
    useCallback(() => {
      reloadFavs()
      reloadPlaylists()
    }, [reloadFavs, reloadPlaylists])
  )

  const totalAlbumsInPlaylists = playlists.reduce((sum, p) => sum + p.albums.length, 0)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.screenTitle}>Perfil</Text>

        {/* Avatar + Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={colors.primary} style={{ opacity: 0.6 }} />
          </View>
          <Text style={styles.name}>{USER.name}</Text>
          <Text style={styles.handle}>{USER.handle}</Text>
          <View style={styles.badge}>
            <Ionicons name="musical-note" size={12} color={colors.primary} />
            <Text style={styles.badgeText}>Membro desde {USER.since}</Text>
          </View>
        </View>

        {/* Stats */}
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

        {/* Menu Biblioteca */}
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

        {/* Menu Descobrir */}
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

        <Text style={styles.version}>Noomi · v2.0</Text>
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
}

function MenuItem({ icon, label, detail, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={20} color={colors.text} />
      <Text style={styles.menuLabel}>{label}</Text>
      {detail ? <Text style={styles.menuDetail}>{detail}</Text> : null}
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 120,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },

  // Profile card
  profileCard: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  handle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
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
  badgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F7F9FF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 5,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Menu sections
  section: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#F7F9FF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  menuDetail: {
    fontSize: 13,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EEFF',
    marginLeft: 48,
  },

  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
})

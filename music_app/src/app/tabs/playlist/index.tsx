import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCallback, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

import { EmptyState } from '@/components/EmptyState'
import { LoadingView } from '@/components/LoadingView'
import { RenameModal } from '@/components/RenameModal'
import { usePlaylists } from '@/hooks/usePlaylists'
import { colors, fontSize } from '@/constants/token'
import { Playlist } from '@/types'

export default function PlaylistScreen() {
  const { playlists, loading, createPlaylist, deletePlaylist, renamePlaylist, reload } =
    usePlaylists()

  const [renaming, setRenaming] = useState<Playlist | null>(null)
  const [creating, setCreating] = useState(false)

  useFocusEffect(
    useCallback(() => {
      reload()
    }, [reload])
  )

  function promptCreate() {
    setCreating(true)
  }

  async function handleCreate(name: string) {
    setCreating(false)
    await createPlaylist(name)
  }

  function confirmDelete(playlist: Playlist) {
    Alert.alert(
      'Excluir Playlist',
      `Deseja excluir "${playlist.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deletePlaylist(playlist.id),
        },
      ]
    )
  }

  if (loading) return <LoadingView />

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Playlists</Text>
          <Text style={styles.subtitle}>
            {playlists.length === 0
              ? 'Nenhuma playlist criada'
              : `${playlists.length} ${playlists.length === 1 ? 'playlist' : 'playlists'}`}
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={promptCreate} activeOpacity={0.8}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {playlists.length === 0 ? (
        <EmptyState
          message="Nenhuma playlist ainda. Toque em + para criar a primeira!"
          icon="musical-notes-outline"
        />
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PlaylistRow
              playlist={item}
              onPress={() => router.push(`/tabs/playlist/${item.id}`)}
              onRename={() => setRenaming(item)}
              onDelete={() => confirmDelete(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Modal criar playlist */}
      <RenameModal
        visible={creating}
        initialValue=""
        title="Nova Playlist"
        onConfirm={handleCreate}
        onCancel={() => setCreating(false)}
      />

      {/* Modal renomear playlist */}
      <RenameModal
        visible={renaming !== null}
        initialValue={renaming?.name ?? ''}
        title="Renomear Playlist"
        onConfirm={async (name) => {
          if (renaming) await renamePlaylist(renaming.id, name)
          setRenaming(null)
        }}
        onCancel={() => setRenaming(null)}
      />
    </SafeAreaView>
  )
}

// ─── PlaylistRow ──────────────────────────────────────────────────────────────

type PlaylistRowProps = {
  playlist: Playlist
  onPress: () => void
  onRename: () => void
  onDelete: () => void
}

function PlaylistRow({ playlist, onPress, onRename, onDelete }: PlaylistRowProps) {
  const count = playlist.songs.length
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowIcon}>
        <Ionicons name="musical-notes" size={22} color={colors.primary} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>
          {playlist.name}
        </Text>
        <Text style={styles.rowCount}>
          {count} {count === 1 ? 'música' : 'músicas'}
        </Text>
      </View>
      <TouchableOpacity onPress={onRename} style={styles.iconBtn} hitSlop={8}>
        <Ionicons name="pencil-outline" size={18} color={colors.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.iconBtn} hitSlop={8}>
        <Ionicons name="trash-outline" size={18} color="#E05A6A" />
      </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F4FF',
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  rowIcon: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#EFF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: { flex: 1 },
  rowName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  rowCount: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  iconBtn: { padding: 4 },
})

import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { colors } from '@/constants/token'
import { Playlist } from '@/types'

type Props = {
  visible: boolean
  playlists: Playlist[]
  currentSongId: string        // ← era currentAlbumId
  onClose: () => void
  onSelectPlaylist: (playlistId: string) => void
  onCreateAndAdd: (name: string) => void
}

export function PlaylistPickerModal({
  visible,
  playlists,
  currentSongId,
  onClose,
  onSelectPlaylist,
  onCreateAndAdd,
}: Props) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  function handleCreate() {
    if (!newName.trim()) return
    onCreateAndAdd(newName.trim())
    setNewName('')
    setCreating(false)
  }

  function handleClose() {
    setCreating(false)
    setNewName('')
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.overlay} onPress={handleClose} activeOpacity={1}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1}>
          <View style={styles.handle} />
          <Text style={styles.title}>Adicionar à Playlist</Text>

          {creating ? (
            <View style={styles.createRow}>
              <TextInput
                style={styles.nameInput}
                placeholder="Nome da playlist..."
                placeholderTextColor={colors.textMuted}
                value={newName}
                onChangeText={setNewName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />
              <TouchableOpacity
                style={[styles.confirmBtn, !newName.trim() && styles.confirmBtnDisabled]}
                onPress={handleCreate}
                disabled={!newName.trim()}
              >
                <Text style={styles.confirmBtnText}>Criar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.newBtn} onPress={() => setCreating(true)}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.newBtnText}>Nova playlist</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          {playlists.length === 0 ? (
            <Text style={styles.empty}>Nenhuma playlist criada ainda.</Text>
          ) : (
            <FlatList
              data={playlists}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 260 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                // ← verifica por songId agora
                const added = item.songs.some((s) => s.songId === currentSongId)
                const count = item.songs.length
                return (
                  <TouchableOpacity
                    style={styles.playlistRow}
                    onPress={() => onSelectPlaylist(item.id)}
                    disabled={added}
                    activeOpacity={0.7}
                  >
                    <View style={styles.playlistIcon}>
                      <Ionicons name="musical-notes" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.playlistInfo}>
                      <Text
                        style={[styles.playlistName, added && styles.playlistNameMuted]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.playlistCount}>
                        {count} {count === 1 ? 'música' : 'músicas'}
                      </Text>
                    </View>
                    {added && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )
              }}
            />
          )}

          <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDE3F0',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  newBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  nameInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#C4D9FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  divider: { height: 1, backgroundColor: '#F0F4FF', marginVertical: 12 },
  empty: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  playlistIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistInfo: { flex: 1 },
  playlistName: { fontSize: 15, fontWeight: '600', color: colors.text },
  playlistNameMuted: { color: colors.textMuted },
  playlistCount: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  cancelBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: colors.text },
})

import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { CommentCard } from '@/components/CommentCard'
import { useAuth } from '@/context/AuthContext'
import { useComments } from '@/hooks/useComments'
import { colors } from '@/constants/token'

type Props = {
  albumId: string
}

export function CommentSection({ albumId }: Props) {
  const { user } = useAuth()
  const { comments, loading, addComment, editComment, deleteComment } = useComments(albumId)

  const [newText, setNewText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Edit modal state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  // ── Add comment ──────────────────────────────────────────────────────────────
  async function handleAdd() {
    if (!user) return
    const trimmed = newText.trim()
    if (!trimmed) return
    try {
      setSubmitting(true)
      await addComment(user.id, user.name, trimmed)
      setNewText('')
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar o comentário. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Delete comment ───────────────────────────────────────────────────────────
  function confirmDelete(commentId: string) {
    Alert.alert(
      'Excluir comentário',
      'Deseja excluir este comentário? Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteComment(commentId),
        },
      ]
    )
  }

  // ── Open edit modal ──────────────────────────────────────────────────────────
  function openEdit(commentId: string, currentText: string) {
    setEditingId(commentId)
    setEditText(currentText)
  }

  async function confirmEdit() {
    if (!editingId || !editText.trim()) return
    try {
      await editComment(editingId, editText.trim())
      setEditingId(null)
    } catch {
      Alert.alert('Erro', 'Não foi possível editar o comentário.')
    }
  }

  return (
    <View style={styles.container}>
      {/* ── Título da seção ─────────────────────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Comentários
        </Text>
        <Text style={styles.sectionCount}>
          {comments.length}
        </Text>
      </View>

      {/* ── Input de novo comentário (só para autenticados) ──────────────── */}
      {user ? (
        <View style={styles.inputRow}>
          <View style={styles.inputAvatar}>
            <Ionicons name="person" size={16} color={colors.primary} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Escreva um comentário..."
            placeholderTextColor={colors.textMuted}
            value={newText}
            onChangeText={setNewText}
            multiline
            maxLength={500}
            editable={!submitting}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!newText.trim() || submitting) && styles.sendBtnDisabled]}
            onPress={handleAdd}
            disabled={!newText.trim() || submitting}
            activeOpacity={0.7}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        /* ── Usuário não autenticado: prompt de login ──────────────────── */
        <TouchableOpacity
          style={styles.loginPrompt}
          onPress={() => router.push('/')}
          activeOpacity={0.7}
        >
          <Ionicons name="lock-closed-outline" size={16} color={colors.primary} />
          <Text style={styles.loginPromptText}>
            Faça login para comentar
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* ── Lista de comentários ─────────────────────────────────────────── */}
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.loadingSpinner} />
      ) : comments.length === 0 ? (
        <View style={styles.emptyComments}>
          <Ionicons name="chatbubble-outline" size={32} color={colors.primary} style={{ opacity: 0.4 }} />
          <Text style={styles.emptyText}>Nenhum comentário ainda.</Text>
          {!user && (
            <Text style={styles.emptySubText}>Faça login para ser o primeiro!</Text>
          )}
        </View>
      ) : (
        <View style={styles.commentsList}>
          {comments.map((c) => (
            <CommentCard
              key={c.id}
              comment={c}
              isOwner={user?.id === c.userId}
              onEdit={() => openEdit(c.id, c.comment)}
              onDelete={() => confirmDelete(c.id)}
            />
          ))}
        </View>
      )}

      {/* ── Modal de edição ─────────────────────────────────────────────── */}
      <Modal
        visible={editingId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingId(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar comentário</Text>
            <TextInput
              style={styles.modalInput}
              value={editText}
              onChangeText={setEditText}
              multiline
              maxLength={500}
              autoFocus
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditingId(null)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, !editText.trim() && styles.modalBtnDisabled]}
                onPress={confirmEdit}
                disabled={!editText.trim()}
              >
                <Text style={styles.modalConfirmText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 12,
  },

  // Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionCount: {
    fontSize: 14,
    color: colors.textMuted,
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },

  // Input row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: '#F7F9FF',
    borderRadius: 14,
    padding: 10,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
    paddingTop: 4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },

  // Login prompt
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF3FF',
    padding: 14,
    borderRadius: 12,
  },
  loginPromptText: {
    flex: 1,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },

  // Loading
  loadingSpinner: { marginVertical: 24 },

  // Empty
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 13,
    color: colors.textMuted,
  },

  // Comments list
  commentsList: { gap: 10 },

  // Edit modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    gap: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  modalInput: {
    minHeight: 80,
    maxHeight: 160,
    borderWidth: 1,
    borderColor: '#C4D9FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#F7F9FF',
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalBtnDisabled: { opacity: 0.4 },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
})

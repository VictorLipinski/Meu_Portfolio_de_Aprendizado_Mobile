import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/token'
import { Comment } from '@/types'

type Props = {
  comment: Comment
  isOwner: boolean          // current user is the author
  onEdit: () => void
  onDelete: () => void
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function CommentCard({ comment, isOwner, onEdit, onDelete }: Props) {
  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={16} color={colors.primary} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.userName}>{comment.userName}</Text>
          <Text style={styles.date}>{formatDate(comment.createdAt)}</Text>
        </View>
        {/* Ações: visíveis apenas para o autor */}
        {isOwner && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={styles.actionBtn} hitSlop={8}>
              <Ionicons name="pencil-outline" size={16} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.actionBtn} hitSlop={8}>
              <Ionicons name="trash-outline" size={16} color="#E05A6A" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Texto */}
      <Text style={styles.text}>{comment.comment}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F9FF',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flex: 1 },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  date: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: { padding: 2 },
  text: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
})

import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/token'
import { Show } from '@/types'

type Props = {
  show: Show
}

function formatDate(dateStr: string): string {
  // Append noon UTC so the date never shifts by timezone offset
  const date = new Date(dateStr + 'T12:00:00Z')
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function ShowCard({ show }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="location" size={20} color={colors.primary} />
      </View>

      <View style={styles.info}>
        <Text style={styles.venue} numberOfLines={1}>
          {show.venue}
        </Text>
        <Text style={styles.city} numberOfLines={1}>
          {show.city}
        </Text>
      </View>

      <View style={styles.dateBadge}>
        <Text style={styles.dateText}>{formatDate(show.date)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FF',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  venue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  city: {
    fontSize: 12,
    color: colors.textMuted,
  },
  dateBadge: {
    backgroundColor: '#EFF3FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
})

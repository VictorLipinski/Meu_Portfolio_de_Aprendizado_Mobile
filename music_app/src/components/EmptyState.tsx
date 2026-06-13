import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/token'

type Props = {
  message: string
  icon?: keyof typeof Ionicons.glyphMap
}

export function EmptyState({ message, icon = 'musical-notes-outline' }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.primary} style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  icon: {
    opacity: 0.4,
  },
  message: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
})

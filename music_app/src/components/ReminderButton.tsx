import { Animated, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRef } from 'react'

type Props = {
  hasReminder: boolean
  onPress: () => void
  size?: number
}

const ACTIVE_COLOR = '#88a5dc'   // colors.primary — sino ativo
const INACTIVE_COLOR = '#A0A8B8' // igual ao FavoriteButton inativo

export function ReminderButton({ hasReminder, onPress, size = 24 }: Props) {
  const scale = useRef(new Animated.Value(1)).current

  function handlePress() {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, speed: 40 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }),
    ]).start()
    onPress()
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.btn}
      hitSlop={8}
      accessibilityLabel={hasReminder ? 'Cancelar lembrete' : 'Agendar lembrete'}
      accessibilityRole="button"
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={hasReminder ? 'notifications' : 'notifications-outline'}
          size={size}
          color={hasReminder ? ACTIVE_COLOR : INACTIVE_COLOR}
        />
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: { padding: 4 },
})

import { Animated, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRef } from 'react'

type Props = {
  isFavorite: boolean
  onPress: () => void
  size?: number
}

const ACTIVE_COLOR = '#E05A6A'
const INACTIVE_COLOR = '#A0A8B8'

export function FavoriteButton({ isFavorite, onPress, size = 24 }: Props) {
  const scale = useRef(new Animated.Value(1)).current

  function handlePress() {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, speed: 40 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }),
    ]).start()
    onPress()
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.btn} hitSlop={8}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={size}
          color={isFavorite ? ACTIVE_COLOR : INACTIVE_COLOR}
        />
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: { padding: 4 },
})

import { StyleSheet, Text, TextStyle, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native'

type ButtonProps = TouchableOpacityProps & {
  label: string
  style?: ViewStyle
  labelStyle?: TextStyle
}

export function Button({ label, style, labelStyle, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={0.8}
      {...rest}
    >
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 48,
    backgroundColor: '#C4D9FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  label: {
    color: '#2B2E4A',
    fontSize: 16,
    fontWeight: '600',
  },
})

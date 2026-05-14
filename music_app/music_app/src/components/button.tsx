import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps} from "react-native";

type ButtonProps = TouchableOpacityProps & {
    label: string
}

export function Button({label, ...rest}: ButtonProps) {
    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.8}{...rest}>
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({

        container:{
            width: "100%",
            height:48,
            backgroundColor: "#C4D9FF",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
        },

        label:{
            color: "#2B2E4A",
            fontSize: 16,
            fontWeight: 600
        }
})
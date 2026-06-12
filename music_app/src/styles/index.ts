import { colors, fontSize } from "@/constants/token";
import { StyleSheet } from "react-native";

export const defaultStyles = {
     container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    text: {
        fontSize: fontSize.base,
        color: colors.text,
    }
}

export const utilsStyles = StyleSheet.create({})
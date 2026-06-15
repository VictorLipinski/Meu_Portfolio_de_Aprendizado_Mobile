import { NativeStackNavigationOptions } from "react-native-screens/lib/typescript/native-stack/types";
import { colors } from "./token";
export const StackScreenWithScearchBar:
NativeStackNavigationOptions = {
    headerLargeTitle: true,
    headerLargeStyle:{
        backgroundColor: colors.background,
    },
    headerLargeTitleStyle: {
        color: colors.text
    },
    headerTintColor: colors.text,
    headerTranslucent: true,
    headerStyle: {
        blurEffect: "prominent",
    },
    headerHideShadow: true,

    
}
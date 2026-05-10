import { View } from "react-native";
import { defaultStyles } from "@/styles/index";
import { Stack } from "expo-router";
import { StackScreenWithScearchBar } from "@/constants/layout";

const FavoritesScreenLayout = () => {
    return(
     <View style ={defaultStyles.container}>
        <Stack>
        <Stack.Screen name="index" options={{...StackScreenWithScearchBar, headerTitle: "Favoritos"}}/>
        </Stack>
     </View>
     )
}

export default FavoritesScreenLayout
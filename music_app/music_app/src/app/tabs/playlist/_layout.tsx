import { StackScreenWithScearchBar } from "@/constants/layout";
import { View } from "react-native";
import { defaultStyles } from "@/styles/index";
import { Stack } from "expo-router";


const PlaylistScreenLayout = () => {
    return(
     <View style ={defaultStyles.container}>
        <Stack>
        <Stack.Screen name="index" options={{...StackScreenWithScearchBar,headerTitle: "Playlist"}}/>
        </Stack>
     </View>
    )
}

export default PlaylistScreenLayout



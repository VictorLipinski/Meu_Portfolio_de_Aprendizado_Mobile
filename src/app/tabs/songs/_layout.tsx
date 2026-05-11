import { StackScreenWithScearchBar } from "@/constants/layout";
import { defaultStyles } from "@/styles/index";
import { Stack } from "expo-router";
import { View } from "react-native";


const SongsScreenLayout = () => {
    return(
     <View style ={defaultStyles.container}>
        <Stack>
        <Stack.Screen name="index" options={{
         ...StackScreenWithScearchBar,
         headerTitle: 'Músicas'
         }}/>
        </Stack>
     </View>
    );
}

export default SongsScreenLayout
import { TextInput,TextInputProps, StyleSheet } from "react-native";

export function Input({...rest}: TextInputProps){
    return <TextInput style={styles.input}{...rest}/>

}

const styles = StyleSheet.create({
    input:{
        height: 48,
        width: "100%",
        borderWidth: 1,
        borderColor: "#C4D9FF",
        borderRadius: 8,
        fontSize: 16,
        paddingLeft: 12,
        backgroundColor: "#ffffff"
    }
})
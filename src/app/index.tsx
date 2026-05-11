import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native"

import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Link, router} from "expo-router"
import { useState } from "react"

export default function IndexPage(){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")


    function handleSignIn(){
        if(!email.trim()|| !password.trim()){
            return Alert.alert("Entrar", "Preencha e-mail e senha para entrar")
        }
        Alert.alert("Bem-vindo", `Login com: ${email}`)
        router.replace("/tabs/songs")
    }

    return (
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.select({ios: "padding", android: "height"})}>
            <ScrollView
            contentContainerStyle= {{flexGrow: 1}}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <View style= {styles.container}>
                

            <Image source={require("@/assets/img_login.png")}
            style ={styles.illustration} />


            <Text style={styles.title}>Entrar</Text>  
            <Text style={styles.subtitle}>Acesse sua conta com e-mail e senha.</Text>
            <View style ={styles.form}>                                            
                <Input placeholder="E-mail" keyboardType="email-address" onChangeText={setEmail}/>

                <Input placeholder="Senha" secureTextEntry onChangeText={setPassword}/>

                <Button label="Entrar" onPress={handleSignIn}/>

            </View>

                <Text style={styles.footerText}>Não tem uma conta?{""}
                    <Link href="/singup" style = {styles.footerLink}> Cadastre-se Aqui.</Link>
                </Text>

            </View>

            </ScrollView>
        </KeyboardAvoidingView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 32, 
    
    },
    illustration: {
        width: "100%",
        height: 330,
        resizeMode: 'contain',
        marginTop: 52,
    },
    title:{
        fontSize: 32,
        fontWeight: 900,
        color: "#a397e0"
    },
    subtitle: {
        fontSize: 16,
     },
    form: {
        marginTop: 24,
        gap:12,
     },
     footerText:{
        textAlign: 'center',
        marginTop: 24,
        color: "#2B2E4A",
     },
     footerLink: {
        color: "#9fb4db",
        fontWeight: 700,
     }
})
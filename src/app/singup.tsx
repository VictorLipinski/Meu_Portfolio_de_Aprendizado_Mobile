import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, } from "react-native"

import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Link } from "expo-router"
 
import { BlurView } from "expo-blur"
export default function SignUp() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({
        ios: "padding",
        android: "height",
      })}
    >
      <ImageBackground
        source={require("@/assets/background_singup.png")}
        style={styles.image}
        resizeMode="cover"
        imageStyle={styles.backgroundImage}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View>
              <Text style={styles.title}>Cadastrar</Text>

              <Text style={styles.subtitle}>
                Crie sua conta para acessar o Noomi
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                placeholder="Nome"
                autoCapitalize="words"
              />

              <Input
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                placeholder="Senha"
                secureTextEntry
              />

              <Input
                placeholder="Confirmar senha"
                secureTextEntry
              />

              <Button label="Cadastrar" />
            </View>

            <Text style={styles.footerText}>
              Já tem uma conta?
              <Link href="/" style={styles.footerLink}>
                {" "}Entre aqui
              </Link>
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
  },

  backgroundImage: {
    opacity: 0.45,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
  },

  container: {
    paddingHorizontal: 32,
    paddingVertical: 40,
  },

  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#243447",
  },

  subtitle: {
    fontSize: 16,
    color: "#5B6B7A",
    marginTop: 8,
  },

  form: {
    marginTop: 32,
    gap: 14,
  },

  footerText: {
    textAlign: "center",
    marginTop: 28,
    color: "#4A5568",
    fontSize: 14,
  },

  footerLink: {
    color: "#9FB4DB",
    fontWeight: "700",
  },
})
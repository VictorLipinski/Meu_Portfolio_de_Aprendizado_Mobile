import React from "react";
import { Views, Text, StyleSheet, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";

const ListaMusicas = () => {
    const navigation = useNavigation();

    const handleGoToDetails = () => {
        navigation.navigate("DetalhesMusica", {
            nome: "Wait for Me",
            artista: "Original Broadway Cast of Hadestown",
            album: "Hadestown",
            ano_lancamento: "2019",
            descricao: "A powerful, emotional number where Orpheus sets out to rescue Eurydice, driven by hope and determination.",
        });
    };

    return (
        <View style={ styles.container }>
            <Text style={ styles.title }>Lista de Músicas</Text>
            <Button title="Ver Detalhes da Música Wait for Me" onPress={ handleGoToDetails }/>
            {}
        </View>
    );
};

const styles = StyleSheet.create({
    container :{ flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 24, marginBottom: 20 },
});

export default ListaMusicas;
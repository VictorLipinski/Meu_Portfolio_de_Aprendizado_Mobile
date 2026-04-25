import React from "react";
import { Views, Text, StyleSheet, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";

const ListaAlbuns = () => {
    const navigation = useNavigation();

    const handleGoToDetails = () => {
        navigation.navigate("DetalhesAlbum", {
            nome: "Hadestown",
            artista: "Original Broadway Cast of Hadestown",
            ano_lancamento: "2019",
            descricao: "Hadestown is a musical with music, lyrics, and book by Anaïs Mitchell. It tells a version of the ancient Greek myth of Orpheus and Eurydice. Eurydice, a starving young girl, goes to work in a hellish industrial version of the Greek underworld to escape poverty and the cold, and her poor singer-songwriter lover Orpheus comes to rescue her.",
        });
    };

    return (
        <View style={ styles.container }>
            <Text style={ styles.title }>Lista de Álbuns</Text>
            <Button title="Ver detalhes do Álbum Hadestown" onPress={ handleGoToDetails }/>
            {}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1,  justifyContent: "center", alignItems: "center" },
    title: { fontSize: 24, marginBottom: 20 },
});

export default ListaAlbuns;
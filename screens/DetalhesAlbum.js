import React from "react";
import { Views, Text, StyleSheet, Button } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

const DetalhesAlbum = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { nome, artista, ano_lancamento, descricao } = route.params;

    return (
        <View style={ styles.container }>
            <Text style={ styles.title }>Detalhes do Álbum</Text>
            <Text style={ styles.detailText }>Nome: { nome }</Text>
            <Text style={ styles.detailText }>Artista: { artista }</Text>
            <Text style={ styles.detailText }>Ano de Lançamento: { ano_lancamento }</Text>
            <Text style={ styles.detailText }>Descrição: { descricao }</Text>
            <Button title="Voltar" onPress={ () => navigation.goBack() } />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    title: { fontSize: 24, marginBottom: 20 },
    detailText: { fontSize: 18, marginBottom: 10, textAlign: "center" },
});

export default DetalhesAlbum;
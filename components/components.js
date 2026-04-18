import React from "react";
import { View, Text, StyleSheet } from "react-native";

const AlbumCard = (props) => {
    return (
        <View style={styles.card}>
            <Text style={styles.titulo}>{props.nome}</Text>
            <Text style={styles.subtitulo}>{props.artista}</Text>
            <Text style={styles.subtitulo}>{props.ano_lancamento}</Text>
            <Text style={styles.descricao}>{props.descricao}</Text>
        </View>
    );
};

const MusicCard = (props) => {
    return (
        <View style={styles.card}>
            <Text style={styles.titulo}>{props.nome}</Text>
            <Text style={styles.subtitulo}>{props.artista}</Text>
            <Text style={styles.subtitulo}>{props.album}</Text>
            <Text style={styles.subtitulo}>{props.ano_lancamento}</Text>
            <Text style={styles.descricao}>{props.descricao}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#1e1e1e",
        padding: 15,
        marginVertical: 10,
        marginHorizontal: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
        borderWidth: 1,
        borderColor: "#2a2a2a",
    },
    titulo: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#ffffff",
    },
    subtitulo: {
        fontSize: 14,
        color: "#1DB954",
        marginBottom: 6,
    },
    descricao: {
        fontSize: 14,
        color: "#b3b3b3",
        lineHeight: 20,
    },
});

export { AlbumCard, MusicCard };
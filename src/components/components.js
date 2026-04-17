import react from "react";
import { Views, Text, StyleSheet } from "react-native";

const AlbumCard = (props) => {
    return (
        <View style={StyleSheet.card}>
            <Text style={StyleSheet.titulo}>{props.name}</Text>
        </View>
    )
};

const MusicCard =  (props) => {
    return (
        <View style={StyleSheet.card}>
            <Text style={StyleSheet.titulo}>{props.name}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        padding: 15,
        marginVertical: 10,
        marginHorizontal: 20,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { widht: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    titulo: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333",
    },
    descricao: {
        fontSize: 14,
        color: "#666",
    }
});

export default { AlbumCard, MusicCard };
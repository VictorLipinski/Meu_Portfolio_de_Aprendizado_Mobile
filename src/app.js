import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { AlbumCard, MusicCard } from "./components/MyCard";

export default function App() {
    return (
        <ScrollView style={StyleSheet.scrollViewContainer}>
            <View style={styles.container}>
                <Text style={styles.mainTitle}>Meus Cards</Text>
                <AlbumCard
                    nome="Hadestown"
                    artista="Original Broadway Cast of Hadestown"
                    ano_lancamento="2019"
                    descricao=""
                />
                <AlbumCard
                    nome="Laterarus"
                    artista="TOOL"
                    ano_lancamento="2001"
                    descricao=""
                />
                <AlbumCard
                    nome="Rust In Peace"
                    artista="Megadeth"
                    ano_lancamento="1990"
                    descricao=""
                />
                <MusicCard
                    nome="Wait for Me"
                    artista="Original Broadway Cast of Hadestown"
                    album="Hadestown"
                    ano_lancamento="2019"
                    descricao=""
                />
                <MusicCard
                    nome="Schism"
                    artista="TOOL"
                    album="Laterarus"
                    ano_lancamento="2001"
                    descricao=""
                />
                <MusicCard
                    nome="Tornado of Souls"
                    artista="Megadeth"
                    album="Rust In Peace"
                    ano_lancamento="1990"
                    descricao=""
                />
                <MusicCard
                    nome=""
                    artista=""
                    album=""
                    ano_lancamento=""
                    descricao=""
                />
                <StatusBar style="auto"/>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        paddingTop: 50,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#333",
    },
    flexboxExample: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#e0e0e0",
        padding: 10,
        margin: 20,
        borderRadius: 8,
    },
    box: {
        width: 50,
        height: 50,
        backgroundColor: "lightblue",
        justifyContent: "center",
        alignItems: "center",
        margin: 5,
        borderRadius: 5,
    },
});
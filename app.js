import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { AlbumCard, MusicCard } from "./components/components";

export default function App() {
    return (
        <ScrollView style={styles.scrollViewContainer}>
            <View style={styles.container}>
                <Text style={styles.mainTitle}>Meus Cards</Text>
                <AlbumCard
                    nome="Hadestown"
                    artista="Original Broadway Cast of Hadestown"
                    ano_lancamento="2019"
                    descricao={"Hadestown is a musical with music, lyrics, and book by Anaïs Mitchell. It tells a version of the ancient Greek myth of Orpheus and Eurydice. Eurydice, a starving young girl, goes to work in a hellish industrial version of the Greek underworld to escape poverty and the cold, and her poor singer-songwriter lover Orpheus comes to rescue her."}
                />
                <AlbumCard
                    nome="Lateralus"
                    artista="TOOL"
                    ano_lancamento="2001"
                    descricao={"Lateralus is the third studio album by the American rock band Tool. It was released on May 15, 2001, through Volcano Entertainment. The album was recorded at Cello Studios in Hollywood and The Hook, Big Empty Space, and The Lodge, in North Hollywood, between October 2000 and January 2001. David Bottrill, who had produced the band's two previous releases Ænima and Undertow, produced the album along with the band, and became the last Tool album produced by Bottrill to date. On August 23, 2005, Lateralus was released as a limited edition two-picture-disc vinyl LP in a holographic gatefold package."}
                />
                <AlbumCard
                    nome="Rust In Peace"
                    artista="Megadeth"
                    ano_lancamento="1990"
                    descricao={"Rust in Peace is the fourth studio album by American thrash metal band Megadeth, released on September 24, 1990, by Capitol Records.[2] It was the first Megadeth album to feature guitarist Marty Friedman and drummer Nick Menza. The songs 'Hangar 18' and 'Holy Wars... The Punishment Due' were released as singles. A remixed and remastered version of the album featuring four bonus tracks was released in 2004."}
                />
                <MusicCard
                    nome="Wait for Me"
                    artista="Original Broadway Cast of Hadestown"
                    album="Hadestown"
                    ano_lancamento="2019"
                    descricao={"A powerful, emotional number where Orpheus sets out to rescue Eurydice, driven by hope and determination."}
                />
                <MusicCard
                    nome="Schism"
                    artista="TOOL"
                    album="Lateralus"
                    ano_lancamento="2001"
                    descricao={"A complex, rhythm-driven track exploring communication breakdown and the struggle to reconnect fractured relationships."}
                />
                <MusicCard
                    nome="Tornado of Souls"
                    artista="Megadeth"
                    album="Rust In Peace"
                    ano_lancamento="1990"
                    descricao={"A fast, melodic thrash metal track about emotional turmoil and betrayal, featuring one of the genre’s most iconic guitar solos."}
                />
                <StatusBar style="auto"/>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        flex: 1,
        backgroundColor: "#121212",
    },
    container: {
        flex: 1,
        backgroundColor: "#121212",
        paddingTop: 50,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#1DB954",
    },
    flexboxExample: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#1e1e1e",
        padding: 10,
        margin: 20,
        borderRadius: 8,
    },
    box: {
        width: 50,
        height: 50,
        backgroundColor: "#282828",
        justifyContent: "center",
        alignItems: "center",
        margin: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#1DB954",
    },
});
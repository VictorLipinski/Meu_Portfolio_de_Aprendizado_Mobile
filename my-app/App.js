import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import AlbumCard from './components/AlbumCard';
import Header from './components/Header';
import { albuns } from './data/albuns';


export default function App() {
  return (
    <ScrollView
      style={styles.scrollViewContainer}
      contentContainerStyle={styles.scrollConteudo}
      showsVerticalScrollIndicator={false}
    >
      <Header />

      {/* Lista dinâmica: um AlbumCard pra cada item do array 'albuns' */}
      {albuns.map((album) => (
        <AlbumCard
          key={album.id}
          nome={album.nome}
          artista={album.artista}
          ano={album.ano}
          descricao={album.descricao}
          genero={album.genero}
          cor={album.cor}
          icone={album.icone}
        />
      ))}

      {/* Rodapé */}
      <View style={styles.rodape}>
        <Text style={styles.rodapeTexto}>
          🎧 Feito com React Native
        </Text>
      </View>

      {/* StatusBar clara porque o fundo é escuro */}
      <StatusBar style="light" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    backgroundColor: '#0A0A0D',
  },
  scrollConteudo: {
    paddingBottom: 24,
  },
  rodape: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  rodapeTexto: {
    color: '#5A5A62',
    fontSize: 12,
    fontWeight: '500',
  },
});

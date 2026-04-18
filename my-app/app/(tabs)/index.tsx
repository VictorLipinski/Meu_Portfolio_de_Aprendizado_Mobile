import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import AlbumCard from '../../components/AlbumCard';
import Header from '../../components/Header';
import { albuns } from '../../data/albuns';

export default function HomeScreen() {
  return (
    <ScrollView 
      style={styles.containerPrincipal} 
      contentContainerStyle={styles.conteudoRolagem}
      showsVerticalScrollIndicator={false}
    >
      <Header />

      {/* Renderização dinâmica dos álbuns com .map() (Aula 2) */}
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

      <View style={styles.rodape}>
        <Text style={styles.rodapeTexto}>🎧 Meu Portfólio de Aprendizado Mobile</Text>
      </View>

      <StatusBar style="light" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  containerPrincipal: {
    flex: 1,
    backgroundColor: '#0A0A0D', 
  },
  conteudoRolagem: {
    paddingBottom: 40,
  },
  rodape: {
    padding: 30,
    alignItems: 'center',
  },
  rodapeTexto: {
    color: '#444',
    fontSize: 12,
  },
});
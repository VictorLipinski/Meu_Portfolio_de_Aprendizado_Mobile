import React from 'react';
import { View, Text, StyleSheet } from 'react-native';



const AlbumCard = ({ nome, artista, ano, descricao, genero, cor, icone }) => {
  return (
    <View style={styles.card}>
      {/* Linha de cima: "capa" colorida do álbum + badge do gênero */}
      <View style={styles.topo}>
        <View style={[styles.capa, { backgroundColor: cor }]}>
          <Text style={styles.icone}>{icone}</Text>
        </View>

        <View style={[styles.badge, { borderColor: cor }]}>
          <Text style={[styles.badgeTexto, { color: cor }]}>{genero}</Text>
        </View>
      </View>

      {/* Conteúdo principal: nome do álbum, artista + ano, descrição */}
      <Text style={styles.nome}>{nome}</Text>
      <Text style={styles.artista}>{artista} · {ano}</Text>
      <Text style={styles.descricao}>{descricao}</Text>

      {/* Barrinha colorida na base pra dar um detalhe visual */}
      <View style={[styles.linhaInferior, { backgroundColor: cor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181C',
    padding: 18,
    marginVertical: 8,
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#26262C',
    overflow: 'hidden',
  },
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  capa: {
    width: 56,
    height: 56,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icone: {
    fontSize: 28,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  badgeTexto: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  nome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F2F2F5',
    marginBottom: 4,
  },
  artista: {
    fontSize: 14,
    color: '#A8A8B2',
    fontWeight: '600',
    marginBottom: 10,
  },
  descricao: {
    fontSize: 14,
    color: '#8A8A94',
    lineHeight: 20,
    marginBottom: 14,
  },
  linhaInferior: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
  },
});

export default AlbumCard;

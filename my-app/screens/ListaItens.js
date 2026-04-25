import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ListaItens = () => {
  const navigation = useNavigation();

  // Função para navegar passando os dados específicos do item clicado
  const handleGoToDetails = (itemData) => {
    navigation.navigate('DetalhesItem', itemData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Artistas em Destaque</Text>

      {/* Botão 1 - Passando parâmetros do primeiro item */}
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => handleGoToDetails({ id: '101', titulo: 'Rap é Compromisso', artista: 'Sabotage' })}
      >
        <Text style={styles.cardText}>🎵 Álbum: Sabotage</Text>
      </TouchableOpacity>

      {/* Botão 2 - Passando parâmetros do segundo item */}
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => handleGoToDetails({ id: '102', titulo: 'Dos Prédios', artista: 'Veigh' })}
      >
        <Text style={styles.cardText}>🎵 Álbum: Veigh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#121212' },
  title: { fontSize: 24, marginBottom: 20, color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#333', padding: 20, marginBottom: 15, borderRadius: 8 },
  cardText: { color: '#fff', fontSize: 18 }
});

export default ListaItens;
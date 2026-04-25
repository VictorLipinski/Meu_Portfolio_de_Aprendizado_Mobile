import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const DetalhesItem = () => {
  const route = useRoute();
  const navigation = useNavigation();

  // Desestruturando os parâmetros recebidos da tela anterior
  const { id, titulo, artista } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações do Álbum</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.detailText}>ID de Registro: {id}</Text>
        <Text style={styles.detailText}>Título: {titulo}</Text>
        <Text style={styles.detailText}>Artista: {artista}</Text>
      </View>

      <Button title="Voltar para a Lista" onPress={() => navigation.goBack()} color="#888" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 20 },
  title: { fontSize: 26, marginBottom: 20, color: '#fff', fontWeight: 'bold' },
  infoBox: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 10, marginBottom: 30, width: '100%' },
  detailText: { fontSize: 18, marginBottom: 10, color: '#ccc' },
});

export default DetalhesItem;
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import CompetenciaCard from './components/CompetenciaCard';

export default function App() {
  const competencias = [
    { id: '1', n: 'Desenvolvimento Mobile', d: 'Criação de apps com React Native e Expo.' },
    { id: '2', n: 'Componentização', d: 'Uso de props para criar interfaces reutilizáveis.' },
    { id: '3', n: 'Estilização', d: 'Aplicação de layouts com StyleSheet e Flexbox.' },
    { id: '4', n: 'Lógica de Arrays', d: 'Uso de .map() para listas dinâmicas.' },
    { id: '5', n: 'Versionamento', d: 'Gestão de código com Git e Branches.' },
    { id: '6', n: 'Arquitetura', d: 'Organização de pastas e arquivos no projeto.' },
  ];

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.titulo}>Meu Portfólio Mobile</Text>
        <Text style={styles.subtitulo}>Engenharia de Software 2026</Text>
      </View>
      
      {competencias.map(item => (
        <CompetenciaCard 
          key={item.id} 
          nome={item.n} 
          descricao={item.d} 
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  header: { 
    padding: 40, 
    alignItems: 'center', 
    backgroundColor: '#ffffff', 
    marginBottom: 10 
  },
  titulo: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#6C5CE7' 
  },
  subtitulo: { 
    fontSize: 14, 
    color: '#999999' 
  }
});
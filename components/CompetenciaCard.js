import { StyleSheet, Text, View } from 'react-native';

const CompetenciaCard = (props) => {
  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>{props.nome}</Text>
      <Text style={styles.descricao}>{props.descricao}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 15,
    elevation: 4, 
    borderLeftWidth: 6,
    borderLeftColor: '#6C5CE7',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  descricao: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default CompetenciaCard;
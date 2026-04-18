import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Cabeçalho fixo no topo da tela: etiqueta, título, subtítulo e
// um bloquinho com três mini-estatísticas (8 álbuns / 4 artistas
// / 25 anos — do Sabotage de 2000 até os lançamentos de 2025).

const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.etiqueta}>
        <Text style={styles.etiquetaTexto}>CATÁLOGO MUSICAL</Text>
      </View>

      <Text style={styles.titulo}>
        Meus Álbuns{'\n'}Favoritos
      </Text>

      <Text style={styles.subtitulo}>
        Uma seleção pessoal dos álbuns que não saem da minha playlist.
        Do rap clássico ao pop, passando pelo trap brasileiro.
      </Text>

      {/* Bloco com três mini-estatísticas lado a lado (Flexbox da Aula 3) */}
      <View style={styles.estatisticas}>
        <View style={styles.estatistica}>
          <Text style={styles.statNumero}>8</Text>
          <Text style={styles.statRotulo}>Álbuns</Text>
        </View>
        <View style={styles.divisor} />
        <View style={styles.estatistica}>
          <Text style={styles.statNumero}>4</Text>
          <Text style={styles.statRotulo}>Artistas</Text>
        </View>
        <View style={styles.divisor} />
        <View style={styles.estatistica}>
          <Text style={styles.statNumero}>25</Text>
          <Text style={styles.statRotulo}>Anos</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#111117',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 12,
  },
  etiqueta: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 18,
  },
  etiquetaTexto: {
    color: '#EC4899',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.4,
  },
  titulo: {
    color: '#F2F2F5',
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 42,
    marginBottom: 12,
  },
  subtitulo: {
    color: '#8A8A94',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  estatisticas: {
    flexDirection: 'row',
    backgroundColor: '#18181C',
    borderWidth: 1,
    borderColor: '#26262C',
    borderRadius: 14,
    paddingVertical: 14,
  },
  estatistica: {
    flex: 1,
    alignItems: 'center',
  },
  statNumero: {
    color: '#F2F2F5',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statRotulo: {
    color: '#8A8A94',
    fontSize: 11,
    fontWeight: '600',
  },
  divisor: {
    width: 1,
    backgroundColor: '#26262C',
  },
});

export default Header;

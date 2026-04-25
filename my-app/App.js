import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Aqui nós avisamos ao App.js que as telas novas existem
import ListaItens from './screens/ListaItens';
import DetalhesItem from './screens/DetalhesItem';

const Stack = createStackNavigator();

export default function App() {
  return (
    /* O NavigationContainer envolve todo o app para permitir a navegação */
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ListaItens">
        
        {/* Definimos a tela de entrada (Lista) */}
        <Stack.Screen 
          name="ListaItens" 
          component={ListaItens} 
          options={{ title: 'Meu Portfólio Musical' }} 
        />

        {/* Definimos a tela que mostra os detalhes */}
        <Stack.Screen 
          name="DetalhesItem" 
          component={DetalhesItem} 
          options={{ title: 'Detalhes do Álbum' }} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
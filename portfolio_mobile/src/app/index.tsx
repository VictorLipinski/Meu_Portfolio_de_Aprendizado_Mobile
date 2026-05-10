import { ImageBackground, ScrollView, StyleSheet, Text, View } from "react-native";

import Cards from "../components/cards";



export default function IndexPage(){

    const dados = [
  { id: 1, nome: "Nome", descricao: "Victor Hugo Lipinski de Lima" },
  { id: 2, nome: "Hobbies", descricao: "Crochê, Produção musical e Cozinhar" },
  { id: 3, nome: "Experiências Profissionais", descricao: "Aprendiz de TI, Analista de Dados" },
  { id: 4, nome: "Formação", descricao: "Engenharia de Software, Ciência de Dados" },
  { id: 5, nome: "Música do Dia", descricao: "Yves - Break It feat. Lexie Liu" },
  { id: 6, nome: "Linkedin", descricao: "https://www.linkedin.com/in/victorlipinski/" }
    ];
    return(
        <View style={{flex: 1}}>
             <ImageBackground 
                source={require('../assets/cloud.png')} 
                    style={[StyleSheet.absoluteFillObject]}
                    imageStyle={{ opacity: 0.2 }}    
                />
            <ScrollView
                contentContainerStyle= {{flexGrow: 1}}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                    <View style= {styles.container}>
                        <Text style={styles.title}>v,hugo studio</Text>
                        <Text style={styles.subtitle}>sejam bem vindo ao studio do vic!</Text>
                        

                        {dados.map((item) => (
                                <Cards 
                                    key={item.id}
                                    nome={item.nome}
                                    descricao={item.descricao}
                                />
                                ))}
                    </View>
            
            
            

            </ScrollView>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32, 
    },
    title:{
        fontSize: 32,
        fontWeight: 900,
        color: "#068f8f",
        justifyContent: "center"
    },
    subtitle:{
        fontSize: 16,
        color: "#124c4c",
        justifyContent: "center"
    }
  }

)
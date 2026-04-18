import React from "react";
import { StyleSheet, Text, View } from 'react-native';


type CardProps = {
  nome: string;
  descricao: string;
};

const  Cards = (props: CardProps) => {
    return(
        <View style={styles.card}>
            <Text style={styles.titulo}>{props.nome}</Text>
            <Text style={styles.descricao}>{props.descricao}</Text>
        </View>
    );
};



const styles = StyleSheet.create(
    {
        card:{
            backgroundColor: '#ffffff',
            padding: 20,
            margin: 20,
            borderRadius: 10,
            shadowColor: '#adf4ff',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 6
        },
        titulo:{
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 5,
            color: "#0091a1",

        },
        descricao:{
            fontSize: 16,
            color: "#054444",
        }

    }
);

export default Cards;
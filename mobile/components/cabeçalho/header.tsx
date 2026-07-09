import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Header(){
    return(
        <View style={style.cabecalho}>
            <Text style={style.titulo}>IFSP - iFoodies</Text>
        </View>
    )
}
const style = StyleSheet.create({
    titulo:{
        fontFamily: 'Fraunces',
        fontSize: 26,
        textAlign: 'center',
        color: '#32984D',
    },
    cabecalho:{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#fff',
        borderBottomColor: '#e1e5e9',
        borderBottomWidth: 1,
        position: 'absolute',
        width: '100%',
        top: 0,
        paddingVertical: 10,
        zIndex: 10,
    }
});
import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { usePathname, useRouter } from 'expo-router';

export default function Footer (){
    const router = useRouter();
    const pathname = usePathname();

    const getIconColor = (screenName: string) => {
        return pathname === `/${screenName}` ? '#32984D' : '#8E8E8E';
    };

    const hitSlop = { top: 12, bottom: 12, left: 16, right: 16 }

    return(
        <View style={style.footerContainer}>
            <TouchableOpacity onPress={() => router.push('/produtos')} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel="Produtos">
                <MaterialCommunityIcons name="silverware-variant" size={24} color={getIconColor('produtos')} style={style.iconContainer} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/carrinho')} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel="Carrinho">
                <MaterialCommunityIcons name="cart" size={24} color={getIconColor('carrinho')} style={style.iconContainer} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/pedidos')} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel="Meus pedidos">
                <MaterialCommunityIcons name="receipt" size={24} color={getIconColor('pedidos')} style={style.iconContainer} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/perfil')} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel="Perfil">
                <MaterialCommunityIcons name="account" size={24} color={getIconColor('perfil')} style={style.iconContainer} />
            </TouchableOpacity>
        </View>
    )
}
const style = StyleSheet.create({
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 20,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e1e5e9',
    },
    iconContainer: {
        alignItems: 'center',
    }
});
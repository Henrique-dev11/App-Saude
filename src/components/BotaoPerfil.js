import React from 'react';
import { Pressable, Image, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { useAutenticacao } from '../contexts/Autenticacao';

// Bolinha com o ícone de perfil que fica no canto superior direito do cabeçalho.
const BotaoPerfil = ({ onPress }) => {
    const { usuario } = useAutenticacao();
    return (
        <Pressable onPress={onPress} style={styles.botao} accessibilityRole="button" accessibilityLabel="Abrir perfil">
            <Image source={usuario?.foto ? { uri: usuario.foto } : require('../../assets/avatar.png')}
                style={[styles.imagem, usuario?.foto && { width: 36, height: 36, borderRadius: 18 }]} resizeMode={usuario?.foto ? 'cover' : 'contain'} />
        </Pressable>
    );
};

export default BotaoPerfil;

const styles = StyleSheet.create({
    botao: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    imagem: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
});

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

// Botão para escolher um tipo sanguíneo.
// "ativo" = true deixa o botão vermelho (é o tipo escolhido).
const BotaoTipo = ({ tipo, ativo, onPress }) => {
    return (
        <Pressable style={[styles.botao, ativo && styles.botaoAtivo]} onPress={onPress}
            accessibilityRole="radio" accessibilityState={{ checked: ativo }} accessibilityLabel={tipo}>
            <Text style={[styles.texto, ativo && styles.textoAtivo]}>{tipo}</Text>
        </Pressable>
    );
};

export default BotaoTipo;

const styles = StyleSheet.create({
    botao: {
        minWidth: 64,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
    },
    botaoAtivo: {
        backgroundColor: colors.danger,
        borderColor: colors.danger,
    },
    texto: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    textoAtivo: {
        color: colors.textOnPrimary,
    },
});

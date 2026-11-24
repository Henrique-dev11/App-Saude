import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

// Texto clicável simples (ex.: "Não tem conta? Cadastre-se").
const BotaoLink = ({ texto, destaque, onPress }) => {
    return (
        <Pressable style={styles.btn} onPress={onPress}>
            <Text style={styles.texto}>
                {texto} <Text style={styles.destaque}>{destaque}</Text>
            </Text>
        </Pressable>
    );
};

export default BotaoLink;

const styles = StyleSheet.create({
    btn: {
        marginTop: spacing.md,
        alignItems: 'center',
    },
    texto: {
        fontSize: 14,
        color: colors.textMuted,
    },
    destaque: {
        color: colors.primary,
        fontWeight: '700',
    },
});

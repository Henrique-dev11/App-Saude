import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

// Botão simples, igual ao botão "Calcular" da tela de IMC.
const Botao = ({ titulo, onPress, carregando = false, disabled = false }) => {
    return (
        <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed, (disabled || carregando) && { opacity: 0.6 }]}
            onPress={onPress}
            disabled={disabled || carregando}
            accessibilityRole="button" accessibilityState={{ disabled: disabled || carregando, busy: carregando }}
        >
            {carregando ? <ActivityIndicator color={colors.textOnPrimary} accessibilityLabel="Salvando" /> : <Text style={styles.texto}>{titulo}</Text>}
        </Pressable>
    );
};

export default Botao;

const styles = StyleSheet.create({
    btn: {
        width: '100%',
        height: 50,
        backgroundColor: colors.primary,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.sm,
    },
    btnPressed: {
        backgroundColor: colors.primaryDark,
    },
    texto: {
        color: colors.textOnPrimary,
        fontWeight: '600',
        fontSize: 16,
    },
});

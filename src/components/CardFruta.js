import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

const CardFruta = ({ nome, onPress }) => {
    return (
        <Pressable style={styles.card} accessibilityRole="button"
            accessibilityLabel={nome} accessibilityHint="Ver informações nutricionais" onPress={onPress}>
            <Text style={styles.titulo}>{nome}</Text>
        </Pressable>
    );
};

export default CardFruta;

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        marginTop: spacing.md,
    },
    titulo: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
    },
});

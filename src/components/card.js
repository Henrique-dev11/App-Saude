import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../theme';

const Card = () => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>Card Title</Text>
            <Text>Conteúdo do cartão</Text>
        </View>
    );
};

export default Card;

const styles = StyleSheet.create({
    card: {
        flex: 1,
        margin: spacing.sm,
        height: 120,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.card,
    },
    title: {
        ...typography.heading,
        marginBottom: spacing.sm,
    },
});

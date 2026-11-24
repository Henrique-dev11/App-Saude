import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

// Card que mostra um tipo sanguíneo, para quem ele doa e de quem recebe.
// É usado no resultado do tipo escolhido e também na lista de todos os tipos.
// "doar" e "receber" são listas, por exemplo ['O+', 'A+'].
const CardTipo = ({ titulo, doar, receber }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.titulo}>{titulo}</Text>

            <Text style={styles.rotulo}>
                Doa para: <Text style={styles.valor}>{doar.join(', ')}</Text>
            </Text>
            <Text style={styles.rotulo}>
                Recebe de: <Text style={styles.valor}>{receber.join(', ')}</Text>
            </Text>
        </View>
    );
};

export default CardTipo;

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm + 4,
    },
    titulo: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    rotulo: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: 4,
    },
    valor: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

export default function BarraAgua({ consumido, total }) {
    // a barra enche até 100% e fica cheia se a meta for ultrapassada
    // (também evita NaN/Infinity enquanto a meta for 0)
    const porcentagem = total > 0 ? Math.min(100, (consumido / total) * 100) : 0;

    return (
        <View style={styles.barraFundo}>
            <View style={[styles.barraPreenchida, { width: `${porcentagem}%` }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    barraFundo: {
        width: '100%',
        height: 14,
        backgroundColor: colors.track,
        borderRadius: radius.sm,
        overflow: 'hidden',
    },
    barraPreenchida: {
        height: '100%',
        backgroundColor: colors.accent,
        borderRadius: radius.sm,
    },
});

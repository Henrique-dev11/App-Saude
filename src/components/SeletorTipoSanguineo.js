import React from 'react';
import { View, StyleSheet } from 'react-native';
import { tipos } from '../data/tiposSanguineos';
import BotaoTipo from './BotaoTipo';
import { spacing } from '../theme';

export default function SeletorTipoSanguineo({ value, onChange, disabled }) {
    return <View style={styles.opcoes} accessibilityLabel="Tipo sanguíneo" pointerEvents={disabled ? 'none' : 'auto'}>
        {tipos.map(tipo => <BotaoTipo key={tipo} tipo={tipo} ativo={value === tipo} onPress={() => onChange(tipo)} />)}
    </View>;
}

const styles = StyleSheet.create({ opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md } });

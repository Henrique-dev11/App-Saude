import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import InputCampo from './InputCampo';
import { colors, spacing } from '../theme';
export function dataHoraAtual() {
    const agora = new Date();
    return { dia: agora.toLocaleDateString('pt-BR'), hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
}
export default function DataMedicao({ dia, hora, setDia, setHora }) {
    return <View><Text style={s.label}>Data da medição (DD/MM/AAAA)</Text><InputCampo accessibilityLabel="Data da medição" placeholder="DD/MM/AAAA" keyboardType="default" value={dia} onChangeText={setDia} maxLength={10} /><Text style={s.label}>Hora da medição (HH:MM)</Text><InputCampo accessibilityLabel="Hora da medição" placeholder="HH:MM" keyboardType="default" value={hora} onChangeText={setHora} maxLength={5} /></View>;
}
const s = StyleSheet.create({ label: { color: colors.textMuted, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm } });

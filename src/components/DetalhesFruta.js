import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { informacoesNutricionais } from '../services/nutricaoFrutas';

export default function DetalhesFruta({ fruta, offline, onVoltar }) {
    return (
        <View style={styles.card}>
            <Text style={styles.titulo} accessibilityRole="header">{fruta.nomePtBr}</Text>
            <Text style={styles.fonte}>{offline ? 'Dados salvos da última consulta à Fruityvice.' : 'Dados nutricionais fornecidos pela Fruityvice.'}</Text>
            <Text style={styles.fonte}>Valores por 100 g de fruta.</Text>
            {informacoesNutricionais(fruta).map(campo => (
                <View key={campo.chave} style={styles.linha}>
                    <Text style={styles.rotulo}>{campo.nome}</Text>
                    <Text style={styles.valor}>{campo.valor === null
                        ? 'Não informado pela API'
                        : campo.valor.toLocaleString('pt-BR', { maximumFractionDigits: 10 }) + ' ' + campo.unidade}</Text>
                </View>
            ))}
            <Button title="Voltar à lista" onPress={onVoltar} />
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
        borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
    titulo: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
    fonte: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.md },
    linha: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
        gap: spacing.sm, paddingVertical: spacing.sm },
    rotulo: { fontSize: 16, color: colors.text },
    valor: { fontSize: 16, fontWeight: '600', color: colors.text, flexShrink: 1 },
});

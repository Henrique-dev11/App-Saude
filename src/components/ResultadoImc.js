import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme';

export default function ResultadoImc({ imc, style }) {
    if (!(imc > 0)) return null;

    function categoria() {
        if (imc < 18.5) return 'Abaixo do peso';
        if (imc < 25) return 'Saudável';
        return 'Sobrepeso';
    }

    function cor() {
        if (imc < 18.5) return colors.info;
        if (imc < 25) return colors.success;
        return colors.danger;
    }

    return (
        <View style={style.resultadoContainer}>
            <Text style={style.resultado}>Seu IMC: {imc.toFixed(1)}</Text>
            <Text style={[style.categoria, { color: cor(), backgroundColor: cor() + '1A' }]}>{categoria()}</Text>
        </View>
    );
}

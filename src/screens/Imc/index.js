import React, { useState } from 'react';
import { View, Text, Pressable, Image, ScrollView } from 'react-native';
import styles from './style';
import InputCampo from '../../components/InputCampo';
import ResultadoImc from '../../components/ResultadoImc';

export default function Imc() {
    const [peso, setPeso] = useState('');
    const [altura, setAltura] = useState('');
    const [imc, setImc] = useState(null);

    function calcularImc() {
        setImc(parseFloat(peso) / (parseFloat(altura) * parseFloat(altura)));
    }

    return (
        <ScrollView
            style={styles.fundo}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps='handled'
        >
            <View style={styles.card}>
                <Text style={styles.title}>Calculadora de IMC</Text>
                <Image source={require('../../../assets/imcc.png')} style={styles.imc} />
                <InputCampo
                    style={styles.input}
                    placeholder='Peso (kg)'
                    value={peso}
                    onChangeText={setPeso}
                />

                <InputCampo
                    style={styles.input}
                    placeholder='Altura (m)'
                    value={altura}
                    onChangeText={setAltura}
                />

                <Pressable
                    style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
                    onPress={calcularImc}
                >
                    <Text style={styles.btnText}>Calcular</Text>
                </Pressable>

                <ResultadoImc imc={imc} style={styles} />
            </View>
        </ScrollView>
    );
}

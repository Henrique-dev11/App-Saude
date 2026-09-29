import React, { useState } from 'react';
import { View, Text, Image, TextInput, Pressable } from 'react-native';

import styles from "./style"
import Button from '../../components/Button';
import Input from '../../components/Input';


export default function Remedio() {
    
    const [peso, setPeso] = useState('');
    const [altura, setAltura] = useState('');
    const [calculo, setCalculo] = useState('');
    const [classificacao, setClassificacao] = useState('');

    function classificar(remedio) {
        if (imc < 18.5) return 'Abaixo do peso';
        if (imc < 24.9) return 'Peso normal';
        if (imc < 29.9) return 'Sobrepeso';
        if (imc < 34.9) return 'Obesidade grau I';
        if (imc < 39.9) return 'Obesidade grau II';
        return 'Obesidade grau III';
    }

    function calcularRemedio() {
        const imc = peso / (altura * altura);
        setCalculo(imc.toFixed(2));
        setClassificacao(classificar(imc));
    }

    return (


        <View style={styles.container}>

            <Text style={styles.title}>Rémedio</Text>

            <Image
            source={require('../../../assets/IMC.png')}
            style={styles.img} 
            resizeMode='contain'
            />

            <Input placeholder="Peso (kg)" keyboardType="decimal-pad" value={peso} onChangeText={setPeso} />
            <Input placeholder="Altura (m)" keyboardType="decimal-pad" value={altura} onChangeText={setAltura} />

            <Button label="Calcular" onPress={calcularRemedio} />

            <Text style={styles.resultado}>{calculo}</Text>
            <Text style={styles.resultado}>{classificacao}</Text>
        </View>
    );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { parseWeight } from '../../Function/functionPerfil';
import { View, Text, Image, TextInput, Pressable } from 'react-native';

import styles from "./style"
import Button from '../../components/Button';
import Input from '../../components/Input';


export default function Imc() {
    
    const { user, updateProfile } = useAuth();
    const [peso, setPeso] = useState(String(user.weight ?? ''));
    const [altura, setAltura] = useState('');
    const [calculo, setCalculo] = useState('');
    const [classificacao, setClassificacao] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setPeso(String(user.weight ?? ''));
    }, [user.weight]);

    function classificar(imc) {
        if (imc < 18.5) return 'Abaixo do peso';
        if (imc < 24.9) return 'Peso normal';
        if (imc < 29.9) return 'Sobrepeso';
        if (imc < 34.9) return 'Obesidade grau I';
        if (imc < 39.9) return 'Obesidade grau II';
        return 'Obesidade grau III';
    }

    function calcularIMC() {
        setError('');
        const pesoNum = parseWeight(peso);
        const alturaNum = parseWeight(altura);
        if (!Number.isFinite(pesoNum) || pesoNum <= 0 || !Number.isFinite(alturaNum) || alturaNum <= 0) {
            setCalculo('');
            setClassificacao('');
            setError('Informe peso e altura válidos, maiores que zero.');
            return;
        }
        updateProfile({ weight: pesoNum });
        const imc = pesoNum / (alturaNum * alturaNum);
        setCalculo(imc.toFixed(2));
        setClassificacao(classificar(imc));
    }

    return (


        <View style={styles.container}>

            <Text style={styles.title}>IMC</Text>

            <Image
            source={require('../../../assets/IMC.png')}
            style={styles.img} 
            resizeMode='contain'
            />

            <Input placeholder="Peso (kg)" keyboardType="decimal-pad" value={peso} onChangeText={(value) => { setPeso(value); setCalculo(''); setClassificacao(''); }} />
            <Input placeholder="Altura (m)" keyboardType="decimal-pad" value={altura} onChangeText={(value) => { setAltura(value); setCalculo(''); setClassificacao(''); }} />

            <Button label="Calcular" onPress={calcularIMC} />

            {!!error && <Text accessibilityRole="alert" style={{ color: '#b42318' }}>{error}</Text>}
            <Text style={styles.resultado}>{calculo}</Text>
            <Text style={styles.resultado}>{classificacao}</Text>
        </View>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

import styles from './style';
import Button from '../../components/ButtonAgua';
import Input from '../../components/Input';

export default function Agua() {
    const [peso, setPeso] = useState('');
    const [metaDiaria, setMetaDiaria] = useState(0);
    const [consumoAtual, setConsumoAtual] = useState(0);

    const wave1 = useRef(new Animated.Value(0)).current;
    const wave2 = useRef(new Animated.Value(0)).current;
    const fillWave = useRef(new Animated.Value(0)).current;


    //ANIMAÇÃO DA ÁGUA
    useEffect(() => {
        const animateWave = (wave, duration) =>
            Animated.loop(
                Animated.sequence([
                    Animated.timing(wave, {
                        toValue: 1,
                        duration,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(wave, {
                        toValue: 0,
                        duration,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );

        animateWave(wave1, 7000).start();
        animateWave(wave2, 9000).start();
        animateWave(fillWave, 4200).start();
    }, [wave1, wave2, fillWave]);


    //Funções para calcular a meta de consumo de água, adicionar água e resetar a meta
    function calcularAgua() {
        const valor = peso.toString().replace(',', '.').trim();
        const pesoNum = Number(valor);

        if (!valor || Number.isNaN(pesoNum) || pesoNum <= 0) {
            setMetaDiaria(0);
            setConsumoAtual(0);
            return;
        }

        const totalMl = pesoNum * 35;
        setMetaDiaria(totalMl);
        setConsumoAtual(0);
    }

    function adicionarAgua() {
        if (!metaDiaria) {
            return;
        }

        setConsumoAtual((valorAnterior) => {
            const proximo = Math.min(valorAnterior + 250, metaDiaria);
            return proximo;
        });
    }

    function resetMeta() {
        setMetaDiaria(0);
        setConsumoAtual(0);
        setPeso('');
    }
// Segurança para evitar divisão por zero
    const restante = metaDiaria > 0 ? Math.max(metaDiaria - consumoAtual, 0) : 0;
    const percentual = metaDiaria ? Math.min((consumoAtual / metaDiaria) * 100, 100) : 0;
    const litroMeta = (metaDiaria / 1000).toFixed(2);
    const litroAtual = (consumoAtual / 1000).toFixed(2);
    const percentualLabel = Math.round(percentual);

    return (

        // Renderização do componente Água
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.wave,
                    styles.waveOne,
                    {
                        transform: [
                            {
                                translateX: wave1.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-25, 25],
                                }),
                            },
                        ],
                    },
                ]}
            />
        
            <Animated.View
                style={[
                    styles.wave,
                    styles.waveTwo,
                    {
                        transform: [
                            {
                                translateX: wave2.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [25, -25],
                                }),
                            },
                        ],
                    },
                ]}
            />


            <View style={styles.card}>
                <Text style={styles.title}>Consumo de Água</Text>

                <View style={styles.bottleWrap}>
                    <View style={styles.bottleCap} />
                    <View style={styles.bottleNeck} />

                    <View style={styles.bottleBody}>
                        <Animated.View
                            style={[
                                styles.bottleFill,
                                {
                                    height: `${Math.max(percentual, 0)}%`,
                                },
                            ]}
                        >
                            <Animated.View
                                style={[
                                    styles.waterWave,
                                    {
                                        transform: [
                                            {
                                                translateX: fillWave.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [-18, 18],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            />
                        </Animated.View>
                    </View>
                </View>

                <Text style={styles.levelText}>{metaDiaria > 0 ? `${percentualLabel}% da meta` : 'Meta não definida'}</Text>

                <Input
                    placeholder="Digite seu peso (kg)"
                    value={peso}
                    onChangeText={setPeso}
                    keyboardType="numeric"
                />

                <Button label="Calcular meta" onPress={calcularAgua} />

                {metaDiaria > 0 ? (
                    <>
                        <Text style={styles.resultado}>Meta do dia: {litroMeta} L</Text>
                        <Text style={styles.resultado}>Já bebeu: {litroAtual} L</Text>
                        <Text style={styles.resultado}>Faltam: {(restante / 1000).toFixed(2)} L</Text>

                        <View style={styles.progressBarBackground}>
                            <Animated.View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${percentual}%`,
                                    },
                                ]}
                            />
                        </View>

                        <View style={styles.actionsRow}>
                            <Button label="Adicionar 250 ml" onPress={adicionarAgua} />
                            <Button label="Reset" onPress={resetMeta} />
                        </View>
                    </>
                ) : (
                    <Text style={styles.resultado}>Informe seu peso para calcular sua meta.</Text>
                )}
            </View>
        </View>
    );
}
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import styles from './style';

import BotaoTipo from '../../components/BotaoTipo';
import CardTipo from '../../components/CardTipo';
import { tipos, podeDoar, podeReceber } from '../../data/tiposSanguineos';

export default function Sangue() {
    // guarda o tipo sanguíneo escolhido (começa com O+)
    const [meuTipo, setMeuTipo] = useState('O+');

    return (
        <ScrollView style={styles.fundo} contentContainerStyle={styles.container}>
            <View style={styles.conteudo}>
                <Text style={styles.titulo}>Meu Sangue</Text>

                {/* Um botão para cada tipo; ao tocar, troca o tipo escolhido */}
                <Text style={styles.subtitulo}>Toque no seu tipo sanguíneo:</Text>
                <View style={styles.botoes}>
                    {tipos.map((tipo) => (
                        <BotaoTipo
                            key={tipo}
                            tipo={tipo}
                            ativo={tipo === meuTipo}
                            onPress={() => setMeuTipo(tipo)}
                        />
                    ))}
                </View>

                {/* Resultado: muda sozinho quando troca o tipo escolhido */}
                <CardTipo
                    titulo={`Seu tipo: ${meuTipo}`}
                    doar={podeDoar[meuTipo]}
                    receber={podeReceber[meuTipo]}
                />
            </View>
        </ScrollView>
    );
}

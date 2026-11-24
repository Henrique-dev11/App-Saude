import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import styles from './style';

import BotaoAgua from '../../components/botaoAgua';
import BtnNegativo from '../../components/BtnNegativo';
import BarraAgua from '../../components/BarraAgua';
import MetaAgua from '../../components/MetaAgua';
import InputCampo from '../../components/InputCampo';

export default function Agua() {
    const [consumido, setConsumido] = useState(0);
    const [peso, setPeso] = useState('0');

    // recalculada a cada render, então muda sozinha quando "peso" muda
    const meta = MetaAgua(Number(peso));

    function adicionarAgua(quantidade) {
        let novoValor = consumido + quantidade;

        // pode passar da meta; só não deixa ficar negativo
        if (novoValor < 0) novoValor = 0;

        setConsumido(novoValor);
    }


    return (

        <ScrollView
            style={styles.fundo}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.conteudo}>
                <Text style={styles.titulo}>Controle de Água</Text>

                <View style={styles.card}>
                    <View style={styles.linhaPeso}>
                        <Text style={styles.labelPeso}> Digite seu peso:(kg):</Text>
                    </View>
                    <InputCampo
                        style={styles.botao}
                        keyboardType="numeric"
                        value={peso}
                        onChangeText={setPeso}
                    />
                </View>

                <View style={[styles.card, styles.cardProgresso]}>
                    <Image source={require('../../../assets/gota.png')} style={styles.gota} />

                    <Text style={styles.resultado}>{consumido} ml / {meta} ml</Text>

                    <BarraAgua consumido={consumido} total={meta} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.texto}>Adicionar Água</Text>
                    <View style={styles.botoes}>
                        <BotaoAgua
                            quantidade={200}
                            image={require('../../../assets/g1.png')}
                            onPress={() => adicionarAgua(200)}
                        />
                        <BotaoAgua
                            quantidade={300}
                            image={require('../../../assets/g2.png')}
                            onPress={() => adicionarAgua(300)}
                        />
                        <BotaoAgua
                            quantidade={500}
                            image={require('../../../assets/g3.png')}
                            onPress={() => adicionarAgua(500)}
                        />

                        <BotaoAgua
                            quantidade={1000}
                            image={require('../../../assets/g3.png')}
                            onPress={() => adicionarAgua(1000)}
                        />

                    </View>

                    <Text style={[styles.texto, styles.textoSegundo]}>Retirar Água</Text>
                    <View style={styles.botoes}>
                        <BtnNegativo
                            quantidade={200}
                            image={require('../../../assets/g3.png')}
                            onPress={() => adicionarAgua(-200)}
                        />
                        <BtnNegativo
                            quantidade={300}
                            image={require('../../../assets/g3.png')}
                            onPress={() => adicionarAgua(-300)}
                        />
                        <BtnNegativo
                            quantidade={500}
                            image={require('../../../assets/g3.png')}
                            onPress={() => adicionarAgua(-500)}
                        />
                        <BtnNegativo
                            quantidade={1000}
                            image={require('../../../assets/g3.png')}
                            onPress={() => adicionarAgua(-1000)}
                        />

                    </View>
                </View>
            </View>
        </ScrollView>

    );
}

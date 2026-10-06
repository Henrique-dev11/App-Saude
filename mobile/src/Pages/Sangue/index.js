import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';

import styles from './style';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function Sangue() {
    
    const [tipoSanguineo, setTipoSanguineo] = useState('');
    const [doacao, setDoacao] = useState(null);



    function verificarDoacao() {
        if (!tipoSanguineo) {
            setDoacao({
                titulo: 'Tipo sanguíneo não informado',
                mensagem: 'Informe o tipo sanguíneo para verificar compatibilidade.',
                destaque: '#d93025',
            });
            return;
        }

        const compatibilidade = {
            'A+': ['A+', 'AB+'],
            'A-': ['A+', 'A-', 'AB+', 'AB-'],
            'B+': ['B+', 'AB+'],
            'B-': ['B+', 'B-', 'AB+', 'AB-'],
            'AB+': ['AB+'],
            'AB-': ['AB+', 'AB-'],
            'O+': ['A+', 'B+', 'O+', 'AB+'],
            'O-': ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
        };

        const tiposCompativeis = compatibilidade[tipoSanguineo.toUpperCase()] || [];
        if (tiposCompativeis.length === 0) {
            setDoacao({
                titulo: 'Tipo sanguíneo inválido',
                mensagem: 'Informe um tipo sanguíneo válido (ex.: A+, O-, etc.).',
                destaque: '#d93025',
            });
            return;
        }

        setDoacao({
            titulo: 'Compatibilidade de doação',
            mensagem: `Você pode doar para os seguintes tipos: ${tiposCompativeis.join(', ')}`,
            destaque: '#1c8c5c',
        });
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.container}>
                <View style={styles.headerCard}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.icon}>🩸</Text>
                    </View>

                    <View style={styles.headerText}>
                        <Text style={styles.kicker}>Monitoramento</Text>
                        <Text style={styles.title}>Sangue</Text>
                        <Text style={styles.subtitle}>Avaliação rápida do hemograma</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Dados laboratoriais</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tipo Sanguíneo</Text>
                        <Input
                            placeholder="Ex.: A+"
                            value={tipoSanguineo}
                            onChangeText={setTipoSanguineo}
                        />
                    </View>

                    <Button label="Verificar compatibilidade de doação" onPress={verificarDoacao} />
                </View>


                {doacao && (
                    <View style={[styles.resultCard, { borderColor: doacao.destaque }]}>
                        <Text style={[styles.resultTitle, { color: doacao.destaque }]}>{doacao.titulo}</Text>
                        <Text style={styles.resultMessage}>{doacao.mensagem}</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
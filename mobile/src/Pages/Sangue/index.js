import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';

import styles from './style';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function Sangue() {
    const [hemoglobina, setHemoglobina] = useState('');
    const [hematocrito, setHematocrito] = useState('');
    const [plaquetas, setPlaquetas] = useState('');
    const [leucocitos, setLeucocitos] = useState('');
    const [resultado, setResultado] = useState(null);

    function analisarDados() {
        if (!hemoglobina || !hematocrito || !plaquetas || !leucocitos) {
            setResultado({
                titulo: 'Dados incompletos',
                mensagem: 'Preencha todos os campos para avaliar o hemograma.',
                destaque: '#d93025',
            });
            return;
        }

        const hgb = Number(hemoglobina.replace(',', '.'));
        const hct = Number(hematocrito.replace(',', '.'));
        const plt = Number(plaquetas.replace(',', '.'));
        const wbc = Number(leucocitos.replace(',', '.'));

        let titulo = 'Perfil estável';
        let mensagem = 'Os valores indicam uma tendência saudável no hemograma.';
        let destaque = '#1c8c5c';

        if (hgb < 12 || hct < 36 || plt < 150000 || wbc < 4000) {
            titulo = 'Atenção necessária';
            mensagem = 'Alguns valores estão abaixo do esperado e podem exigir avaliação médica.';
            destaque = '#d97706';
        }

        if (hgb > 18 || hct > 52 || plt > 450000 || wbc > 11000) {
            titulo = 'Valores elevados';
            mensagem = 'Há indicação de aumento acima do padrão; procure orientação profissional.';
            destaque = '#b91c1c';
        }

        setResultado({ titulo, mensagem, destaque });
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
                        <Text style={styles.label}>Hemoglobina (g/dL)</Text>
                        <Input
                            placeholder="Ex.: 14,2"
                            keyboardType="decimal-pad"
                            value={hemoglobina}
                            onChangeText={setHemoglobina}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Hematócrito (%)</Text>
                        <Input
                            placeholder="Ex.: 42"
                            keyboardType="decimal-pad"
                            value={hematocrito}
                            onChangeText={setHematocrito}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Plaquetas (µL)</Text>
                        <Input
                            placeholder="Ex.: 250000"
                            keyboardType="number-pad"
                            value={plaquetas}
                            onChangeText={setPlaquetas}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Leucócitos (µL)</Text>
                        <Input
                            placeholder="Ex.: 7600"
                            keyboardType="number-pad"
                            value={leucocitos}
                            onChangeText={setLeucocitos}
                        />
                    </View>

                    <Button label="Avaliar resultados" onPress={analisarDados} />
                </View>

                {resultado && (
                    <View style={[styles.resultCard, { borderColor: resultado.destaque }]}>
                        <Text style={[styles.resultTitle, { color: resultado.destaque }]}>{resultado.titulo}</Text>
                        <Text style={styles.resultMessage}>{resultado.mensagem}</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

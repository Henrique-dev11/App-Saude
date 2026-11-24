import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import InputCampo from '../../components/InputCampo';
import Botao from '../../components/Botao';
import ComparacaoMedicoes from '../../components/ComparacaoMedicoes';
import DataMedicao, { dataHoraAtual } from '../../components/DataMedicao';
import useMedicoes from '../../hooks/useMedicoes';
import { validarMedicao, dataMedicaoLocal } from '../../services/dadosMedicoes';
import styles from './style';

export default function Pressao() {
    const { registros, carregando, salvando, erroHistorico, carregar, salvar } = useMedicoes('pressao');
    const [formulario, setFormulario] = useState(false);
    const [sistolica, setSistolica] = useState('');
    const [diastolica, setDiastolica] = useState('');
    const [dia, setDia] = useState('');
    const [hora, setHora] = useState('');
    const [erro, setErro] = useState('');
    const recente = registros[registros.length - 1];
    function alternar() {
        const agora = dataHoraAtual(); setDia(agora.dia); setHora(agora.hora);
        setErro(''); setFormulario(!formulario);
    }
    async function registrar() {
        setErro('');
        try {
            if (!/^\d+$/.test(sistolica.trim()) || !/^\d+$/.test(diastolica.trim())) throw new Error('Informe os dois valores da pressão em números inteiros.');
            const data = validarMedicao({ tipo: 'pressao', valor: Number(sistolica), diastolica: Number(diastolica), data: dataMedicaoLocal(dia, hora) });
            await salvar(data); setFormulario(false); setSistolica(''); setDiastolica('');
        } catch (error) { setErro(error.message); }
    }
    return <ScrollView style={styles.fundo} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled"><View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>Pressão arterial</Text>
        {carregando && <ActivityIndicator accessibilityLabel="Carregando histórico de pressão" />}
        {erroHistorico ? <><Text accessibilityRole="alert" style={styles.erro}>{erroHistorico}</Text><Botao titulo="Carregar histórico novamente" onPress={carregar} /></> : null}
        <Text style={styles.legenda}>Última medição</Text>
        <Text style={styles.valor}>{recente ? `${recente.valor}/${recente.diastolica}` : '—'} <Text style={styles.unidade}>mmHg</Text></Text>
        <Text style={styles.legenda}>{recente ? new Date(recente.data).toLocaleString('pt-BR') : 'Nenhuma medição registrada.'}</Text>
        <Botao titulo={formulario ? 'Cancelar registro' : '+ Registrar pressão'} onPress={alternar} disabled={carregando || salvando || Boolean(erroHistorico)} />
        {formulario && <View style={styles.secao}><Text style={styles.label}>Sistólica (mmHg)</Text><InputCampo accessibilityLabel="Sistólica em mmHg" placeholder="Ex.: 120" value={sistolica} onChangeText={setSistolica} maxLength={3} /><Text style={styles.label}>Diastólica (mmHg)</Text><InputCampo accessibilityLabel="Diastólica em mmHg" placeholder="Ex.: 80" value={diastolica} onChangeText={setDiastolica} maxLength={3} /><DataMedicao dia={dia} hora={hora} setDia={setDia} setHora={setHora} />{erro ? <Text style={styles.erro} accessibilityRole="alert">{erro}</Text> : null}<Botao titulo="Salvar medição" onPress={registrar} carregando={salvando} /></View>}
        <ComparacaoMedicoes registros={registros} tipo="pressao" />
        <Text style={styles.aviso}>Medições salvas na sua conta, com data e hora.</Text>
    </View></ScrollView>;
}

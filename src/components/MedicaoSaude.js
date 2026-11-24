import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import InputCampo from './InputCampo';
import Botao from './Botao';
import GraficoSaude from './GraficoSaude';
import { colors } from '../theme';
import styles from '../screens/Pressao/style';

export default function MedicaoSaude({ tipo }) {
  const pressao = tipo === 'pressao';
  const [registros, setRegistros] = useState([]);
  const [formulario, setFormulario] = useState(false);
  const [valor, setValor] = useState('');
  const [diastolica, setDiastolica] = useState('');
  const [contexto, setContexto] = useState('Em jejum');
  const [erro, setErro] = useState('');
  const atual = registros[0];
  function salvar() {
    const numero = Number(valor.replace(',', '.'));
    const inferior = Number(diastolica);
    if (!/^\d+(?:[.,]\d+)?$/.test(valor) || (pressao
      ? !/^\d+$/.test(valor) || !/^\d+$/.test(diastolica) || numero < 40 || numero > 300 || inferior < 20 || inferior > 200 || inferior >= numero
      : numero < 10 || numero > 1000)) {
      setErro(pressao ? 'Informe uma pressão válida, com a sistólica maior que a diastólica.' : 'Informe um valor entre 10 e 1.000 mg/dL.');
      return;
    }
    setRegistros(lista => [{ valor: numero, diastolica: inferior, contexto, data: new Date() }, ...lista]);
    setFormulario(false); setValor(''); setDiastolica(''); setErro('');
  }
  return <ScrollView style={styles.fundo} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled"><View style={styles.card}>
    <Text accessibilityRole="header" style={styles.title}>{pressao ? 'Pressão arterial' : 'Glicemia'}</Text>
    <Text style={styles.legenda}>{atual ? 'Último registro' : 'Exemplo de medição'}</Text>
    <Text style={styles.valor}>{atual ? `${atual.valor.toLocaleString('pt-BR')}${pressao ? '/' + atual.diastolica : ''}` : pressao ? '120/80' : '95'} <Text style={styles.unidade}>{pressao ? 'mmHg' : 'mg/dL'}</Text></Text>
    <Text style={styles.tag}>{pressao ? atual ? 'Medição registrada' : 'Normal · exemplo' : atual?.contexto || 'Em jejum · exemplo'}</Text>
    <Text style={styles.legenda}>Tendência dos últimos 7 dias · dados ilustrativos</Text>
    <GraficoSaude values={pressao ? [126, 122, 125, 117, 121, 118, 120] : [100, 97, 102, 92, 96, 91, 95]} color={pressao ? colors.info : colors.primary} label={pressao ? 'Pressão sistólica ilustrativa em mmHg' : 'Glicemia ilustrativa em mg/dL'} />
    <Botao titulo={formulario ? 'Cancelar registro' : '+ Registrar'} onPress={() => { setFormulario(!formulario); setErro(''); }} />
    {formulario && <View style={styles.secao}>
      <Text style={styles.label}>{pressao ? 'Sistólica (mmHg)' : 'Glicemia (mg/dL)'}</Text>
      <InputCampo accessibilityLabel={pressao ? 'Sistólica' : 'Glicemia'} placeholder={pressao ? 'Ex.: 120' : 'Ex.: 95'} keyboardType="decimal-pad" value={valor} onChangeText={setValor} maxLength={6} />
      {pressao ? <><Text style={styles.label}>Diastólica (mmHg)</Text><InputCampo accessibilityLabel="Diastólica" placeholder="Ex.: 80" value={diastolica} onChangeText={setDiastolica} maxLength={3} /></> : <View style={styles.opcoes}>{['Em jejum', 'Pós-refeição'].map(opcao => <Pressable key={opcao} accessibilityRole="radio" accessibilityState={{ checked: contexto === opcao }} onPress={() => setContexto(opcao)} style={[styles.opcao, contexto === opcao && styles.selecionada]}><Text style={styles.texto}>{opcao}</Text></Pressable>)}</View>}
      {erro ? <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text> : null}
      <Botao titulo="Salvar medição" onPress={salvar} />
    </View>}
    <Text style={styles.aviso}>Registros disponíveis enquanto esta tela permanecer aberta. Os exemplos não são dados pessoais.</Text>
    {registros.length > 0 && <View style={styles.secao}><Text style={styles.label}>Histórico desta sessão</Text>{registros.map((registro, i) => <View key={i} style={styles.linha}><Text style={styles.texto}>{registro.valor}{pressao ? '/' + registro.diastolica + ' mmHg' : ' mg/dL · ' + registro.contexto}</Text><Text style={styles.legenda}>{registro.data.toLocaleString('pt-BR')}</Text></View>)}</View>}
  </View></ScrollView>;
}

import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import Botao from '../../components/Botao';
import InputCampo from '../../components/InputCampo';
import styles from './style';
const exemplos = [{ nome: 'Dipirona', gravidade: 'Severa' }, { nome: 'Poeira', gravidade: 'Leve' }, { nome: 'Amendoim', gravidade: 'Moderada' }];
export default function Alergia() {
  const [alergias, setAlergias] = useState([]);
  const [nome, setNome] = useState('');
  const [gravidade, setGravidade] = useState('Leve');
  const [formulario, setFormulario] = useState(false);
  const [erro, setErro] = useState('');
  function adicionar() {
    const limpo = nome.trim();
    if (limpo.length < 2) return setErro('Informe o nome da alergia.');
    if (alergias.some(a => a.nome.toLocaleLowerCase('pt-BR') === limpo.toLocaleLowerCase('pt-BR'))) return setErro('Esta alergia já está cadastrada.');
    setAlergias(lista => [...lista, { nome: limpo, gravidade }]);
    setNome(''); setErro(''); setFormulario(false);
  }
  return <ScrollView style={styles.fundo} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled"><View style={styles.card}>
    <Text style={styles.title} accessibilityRole="header">Minhas alergias</Text>
    <Text style={styles.legenda}>{alergias.length ? 'Alergias adicionadas nesta sessão' : 'Exemplos de alergias · nenhum registro pessoal'}</Text>
    {(alergias.length ? alergias : exemplos).map(a => <View key={a.nome} style={styles.listaLinha}><Text style={styles.texto}>{a.nome}</Text><Text style={styles.tag}>{a.gravidade}</Text></View>)}
    <Botao titulo={formulario ? 'Cancelar' : '+ Adicionar alergia'} onPress={() => { setFormulario(!formulario); setErro(''); }} />
    {formulario && <View style={styles.secao}><Text style={styles.label}>Nome da alergia</Text><InputCampo accessibilityLabel="Nome da alergia" placeholder="Ex.: Dipirona" keyboardType="default" value={nome} onChangeText={setNome} maxLength={80} /><Text style={styles.label}>Gravidade informada</Text><View style={styles.opcoes}>{['Leve', 'Moderada', 'Severa'].map(g => <Pressable key={g} accessibilityRole="radio" accessibilityState={{ checked: gravidade === g }} onPress={() => setGravidade(g)} style={[styles.opcao, gravidade === g && styles.selecionada]}><Text style={styles.texto}>{g}</Text></Pressable>)}</View>{erro ? <Text style={styles.erro} accessibilityRole="alert">{erro}</Text> : null}<Botao titulo="Salvar alergia" onPress={adicionar} /></View>}
    <Text style={styles.aviso}>Registros disponíveis enquanto esta tela permanecer aberta.</Text>
  </View></ScrollView>;
}

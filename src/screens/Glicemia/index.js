import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Line, Circle, Polyline, Rect } from 'react-native-svg';
import InputCampo from '../../components/InputCampo';
import Botao from '../../components/Botao';
import { colors } from '../../theme';
import styles from './style';
import useMedicoes from '../../hooks/useMedicoes';
import ComparacaoMedicoes from '../../components/ComparacaoMedicoes';
import DataMedicao, { dataHoraAtual } from '../../components/DataMedicao';
import { validarMedicao, dataMedicaoLocal } from '../../services/dadosMedicoes';

function Icone({ tipo, color = colors.textMuted }) {
  const desenhos = { hoje: 'M12 3a9 9 0 1 0 9 9M12 3v9l6-4', historico: 'M5 4h14v17H5V4Zm4 5h6m-6 4h6m-6 4h4', grafico: 'M3 3v18h18M6 15l4-5 4 3 6-8', perfil: 'M20 21v-2a8 8 0 0 0-16 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z' };
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" accessible={false}><Path d={desenhos[tipo]} /></Svg>;
}
function GraficoDia({ dados }) {
  const teto = Math.max(252, ...dados.map(d => d.valor + 20));
  const y = valor => 150 - valor / teto * 130;
  const pontos = dados.map(d => [16 + d.minuto / 1440 * 320, y(d.valor)]);
  return <View accessible accessibilityRole="image" accessibilityLabel={`Glicemia do dia: ${dados.map(d => `${d.hora}, ${d.valor} mg/dL`).join('; ')}`}>
    <Svg width="100%" height={190} viewBox="0 0 370 190" accessible={false}>
      <Rect x="16" y="20" width="320" height="130" fill="#FAFCFC" />
      {[0, 1, 2, 3, 4].map(i => <Line key={i} x1={16 + i * 80} x2={16 + i * 80} y1="20" y2="150" stroke="#E3E8EA" strokeDasharray="3 4" />)}
      {[20, 85, 150].map(pos => <Line key={pos} x1="16" x2="336" y1={pos} y2={pos} stroke="#E3E8EA" strokeDasharray="3 4" />)}
      <Polyline points={pontos.map(p => p.join(',')).join(' ')} fill="none" stroke="#D59048" strokeWidth="2" strokeLinejoin="round" />
      {pontos.map(([cx, cy], i) => <Circle key={i} cx={cx} cy={cy} r="4" fill="#D59048" stroke="#FFFFFF" strokeWidth="1.5" />)}
    </Svg>
    <View style={styles.eixo}><Text style={styles.legenda}>00h</Text><Text style={styles.legenda}>06h</Text><Text style={styles.legenda}>12h</Text><Text style={styles.legenda}>18h</Text><Text style={styles.legenda}>24h</Text></View>
    <Text style={styles.escala}>Escala: 0–{Math.ceil(teto)} mg/dL</Text>
  </View>;
}

export default function Glicemia({ navigation }) {
  const insets = useSafeAreaInsets();
  const { registros: historico, carregando, salvando, erroHistorico, carregar, salvar: salvarRegistro } = useMedicoes('glicemia');
  const registros = historico.map(r => { const data = new Date(r.data); return { ...r, hora: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), minuto: data.getHours() * 60 + data.getMinutes() }; });
  const [dia, setDia] = useState('');
  const [hora, setHora] = useState('');
  const [aba, setAba] = useState('hoje');
  const [formulario, setFormulario] = useState(false);
  const [valor, setValor] = useState('');
  const [contexto, setContexto] = useState('Em jejum');
  const [erro, setErro] = useState('');
  const dados = registros;
  const recente = dados[dados.length - 1];
  const menor = dados.length ? dados.reduce((a, b) => a.valor < b.valor ? a : b) : null;
  const maior = dados.length ? dados.reduce((a, b) => a.valor > b.valor ? a : b) : null;
  const hoje = new Date().toDateString();
  const dadosHoje = registros.filter(r => new Date(r.data).toDateString() === hoje);
  function abrirFormulario() {
    const agora = dataHoraAtual(); setDia(agora.dia); setHora(agora.hora);
    setErro(''); setFormulario(true);
  }
  async function salvar() {
    setErro('');
    try {
      if (!/^\d+(?:[.,]\d+)?$/.test(valor.trim())) throw new Error('Informe uma glicemia válida.');
      const medicao = validarMedicao({ tipo: 'glicemia', valor: Number(valor.replace(',', '.')), contexto, data: dataMedicaoLocal(dia, hora) });
      await salvarRegistro(medicao);
      setValor(''); setFormulario(false); setAba('hoje');
    } catch (error) { setErro(error.message); }
  }
  return <View style={styles.fundo}>
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 110 + insets.bottom }]}>
      <View style={styles.cabecalho}><View><Text style={styles.sobretitulo}>ACOMPANHAMENTO DA GLICEMIA</Text><Text style={styles.titulo} accessibilityRole="header">{aba === 'hoje' ? 'Hoje' : aba === 'historico' ? 'Histórico' : 'Seu dia'}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Registrar glicemia" disabled={carregando || Boolean(erroHistorico)} onPress={abrirFormulario} style={({ pressed }) => [styles.adicionar, pressed && styles.pressionado]}><Text style={styles.mais}>＋</Text></Pressable></View>
      <View style={styles.avisoDemo}><View style={styles.ponto} /><Text style={styles.avisoTexto}>Medições salvas na sua conta</Text></View>
      {carregando && <ActivityIndicator accessibilityLabel="Carregando histórico de glicemia" />}
      {erroHistorico ? <><Text accessibilityRole="alert" style={styles.erro}>{erroHistorico}</Text><Botao titulo="Carregar histórico novamente" onPress={carregar} /></> : null}
      {aba === 'hoje' && recente && <>
        <Text style={styles.subtitulo}>Mais recente</Text>
        <View style={styles.medidor}>
          <Svg width="100%" height="100%" viewBox="0 0 340 300" accessible={false}>
            <Path d="M76 253 A132 132 0 1 1 264 253" stroke="#E5E8EC" strokeWidth="30" fill="none" strokeLinecap="round" />
            <Path d="M76 253 A132 132 0 0 1 39 176" stroke={colors.primary} strokeWidth="30" fill="none" strokeLinecap="round" />
          </Svg>
          <View style={styles.centroMedidor} accessible accessibilityLabel={`Última glicemia: ${recente.valor} miligramas por decilitro. ${recente.contexto}. ${recente.hora}`}>
            <Text style={styles.leitura}>{recente.valor.toLocaleString('pt-BR')}</Text><Text style={styles.unidade}>mg/dL</Text><Text style={styles.tempo}>{new Date(recente.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</Text><Text style={styles.contexto}>{recente.contexto}</Text>
          </View>
        </View>
        <View style={styles.extremos}>{[[menor, '↓', 'Menor leitura', '#D85457', '#FDEBEC'], [maior, '↑', 'Maior leitura', '#997622', '#FFF5CE']].map(([item, seta, titulo, cor, fundo]) => <View key={titulo} style={styles.extremo}><View style={[styles.seta, { backgroundColor: fundo }]}><Text style={{ color: cor, fontSize: 20 }}>{seta}</Text></View><View style={styles.extremoDados}><Text style={styles.legenda}>{titulo}</Text><Text style={styles.hora}>{new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · {item.hora}</Text><Text style={styles.valorExtremo}>{item.valor.toLocaleString('pt-BR')} <Text style={styles.unidadePequena}>mg/dL</Text></Text></View></View>)}</View>
      </>}
      {aba !== 'historico' && <View style={styles.card}><View style={styles.cardCabecalho}><Text style={styles.cardTitulo}>Seu dia</Text><Pressable accessibilityRole="button" onPress={() => setAba('historico')} style={styles.verTodos}><Text style={styles.link}>Ver todos →</Text></Pressable></View><Text style={styles.legenda}>Medições registradas hoje</Text>{dadosHoje.length ? <GraficoDia dados={dadosHoje} /> : <Text style={styles.vazio}>Nenhum registro hoje.</Text>}<View style={styles.legendaGrafico}><View style={styles.pontoGrafico} /><Text style={styles.legenda}>Suas medições em mg/dL</Text></View></View>}
      {aba === 'hoje' && !recente && !carregando && <Text style={styles.vazio}>Você ainda não tem medições salvas. Registre a primeira abaixo.</Text>}
      <View style={styles.card}><ComparacaoMedicoes registros={historico} tipo="glicemia" /></View>
      <Botao titulo="+ Registrar glicemia" onPress={abrirFormulario} disabled={carregando || Boolean(erroHistorico)} />
      <Text style={styles.rodape}>Medições salvas na sua conta, com data, hora e contexto. O arco é ilustrativo.</Text>
    </ScrollView>
    <View style={[styles.navegacao, { paddingBottom: Math.max(12, insets.bottom) }]}>{[['hoje', 'Hoje'], ['historico', 'Histórico'], ['grafico', 'Gráfico'], ['perfil', 'Perfil']].map(([tipo, titulo]) => <Pressable key={tipo} accessibilityRole="tab" accessibilityState={{ selected: aba === tipo }} onPress={() => tipo === 'perfil' ? navigation.navigate('Perfil') : setAba(tipo)} style={styles.itemNav}><Icone tipo={tipo} color={aba === tipo ? colors.primary : colors.textMuted} /><Text style={[styles.textoNav, aba === tipo && styles.navAtiva]}>{titulo}</Text></Pressable>)}</View>
    <Modal visible={formulario} transparent animationType="fade" onRequestClose={() => setFormulario(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}><View style={styles.modal} accessibilityViewIsModal><ScrollView keyboardShouldPersistTaps="handled"><View style={styles.cardCabecalho}><Text style={styles.cardTitulo}>Registrar glicemia</Text><Pressable accessibilityRole="button" accessibilityLabel="Fechar formulário" onPress={() => setFormulario(false)} style={styles.fechar}><Text style={styles.link}>✕</Text></Pressable></View><Text style={styles.label}>Glicemia (mg/dL)</Text><InputCampo accessibilityLabel="Glicemia em mg/dL" placeholder="Ex.: 95" value={valor} onChangeText={setValor} keyboardType="decimal-pad" maxLength={6} /><Text style={styles.label}>Contexto da medição</Text><View style={styles.opcoes}>{['Em jejum', 'Pós-refeição'].map(item => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: contexto === item }} onPress={() => setContexto(item)} style={[styles.opcao, contexto === item && styles.opcaoAtiva]}><Text style={styles.textoOpcao}>{item}</Text></Pressable>)}</View>{erro ? <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text> : null}<DataMedicao dia={dia} hora={hora} setDia={setDia} setHora={setHora} /><Botao titulo="Salvar medição" onPress={salvar} carregando={salvando} /></ScrollView></View></KeyboardAvoidingView>
    </Modal>
  </View>;
}

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Line, Polyline, Circle } from 'react-native-svg';
import { colors, radius, spacing, typography } from '../theme';
import { ordenarMedicoes, compararMedicoes } from '../services/dadosMedicoes';

const numero = n => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const diferenca = n => `${n > 0 ? '+' : ''}${numero(n)}`;
const dataTexto = r => new Date(r.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const valorMedicao = r => r.tipo === 'pressao' ? `${numero(r.valor)}/${numero(r.diastolica)} mmHg` : `${numero(r.valor)} mg/dL`;

function Curva({ registros, pressao }) {
    const valores = registros.flatMap(r => pressao ? [r.valor, r.diastolica] : [r.valor]);
    const min = Math.min(...valores) - 10, max = Math.max(...valores) + 10;
    const ponto = (r, i, chave) => [registros.length === 1 ? 160 : 16 + i / (registros.length - 1) * 288, 104 - (r[chave] - min) / (max - min) * 88];
    return <View accessible accessibilityRole="image" accessibilityLabel={`Evolução: ${registros.map(r => `${dataTexto(r)}, ${valorMedicao(r)}`).join('; ')}`}>
        <Svg width="100%" height={130} viewBox="0 0 320 130" accessible={false}>
            {[16, 60, 104].map(y => <Line key={y} x1="12" x2="308" y1={y} y2={y} stroke={colors.border} strokeDasharray="3 4" />)}
            {(pressao ? ['valor', 'diastolica'] : ['valor']).map((chave, j) => <React.Fragment key={chave}><Polyline points={registros.map((r, i) => ponto(r, i, chave).join(',')).join(' ')} fill="none" stroke={j ? colors.info : colors.primary} strokeWidth="2.5" />{registros.map((r, i) => { const [cx, cy] = ponto(r, i, chave); return <Circle key={r.id} cx={cx} cy={cy} r="3" fill={j ? colors.info : colors.primary} />; })}</React.Fragment>)}
        </Svg>
        <Text style={s.legenda}>{pressao ? 'Verde: sistólica · Azul: diastólica · mmHg' : 'Glicemia · mg/dL'}</Text>
        <Text style={s.legenda}>Da mais antiga à mais recente. Cada ponto é uma medição.</Text>
    </View>;
}
export default function ComparacaoMedicoes({ registros, tipo }) {
    const [periodo, setPeriodo] = useState(0);
    const [contexto, setContexto] = useState('Todos');
    const [baseId, setBaseId] = useState(null);
    const [atualId, setAtualId] = useState(null);
    const inicio = new Date(); inicio.setHours(0, 0, 0, 0);
    if (periodo) inicio.setDate(inicio.getDate() - periodo + 1);
    const lista = ordenarMedicoes(registros).filter(r => (!periodo || new Date(r.data) >= inicio) && (tipo === 'pressao' || contexto === 'Todos' || r.contexto === contexto));
    const atual = lista.find(r => r.id === atualId) || lista[lista.length - 1];
    const indiceAtual = lista.findIndex(r => r.id === atual?.id);
    const anteriores = lista.slice(0, indiceAtual);
    const base = anteriores.find(r => r.id === baseId) || anteriores[anteriores.length - 1];
    const comparacao = compararMedicoes(base, atual);
    const pressao = tipo === 'pressao';
    return <View style={s.painel}>
        <Text style={s.titulo} accessibilityRole="header">Comparar medições</Text>
        <View style={s.opcoes}>{[[7, '7 dias'], [30, '30 dias'], [0, 'Todo o histórico']].map(([valor, titulo]) => <Pressable key={valor} accessibilityRole="radio" accessibilityState={{ checked: periodo === valor }} onPress={() => { setPeriodo(valor); setBaseId(null); setAtualId(null); }} style={[s.opcao, periodo === valor && s.ativa]}><Text style={s.textoOpcao}>{titulo}</Text></Pressable>)}</View>
        {!pressao && <><Text style={s.legenda}>Contexto da glicemia</Text><View style={s.opcoes}>{['Todos', 'Em jejum', 'Pós-refeição'].map(valor => <Pressable key={valor} accessibilityRole="radio" accessibilityState={{ checked: contexto === valor }} onPress={() => { setContexto(valor); setBaseId(null); setAtualId(null); }} style={[s.opcao, contexto === valor && s.ativa]}><Text style={s.textoOpcao}>{valor}</Text></Pressable>)}</View></>}
        {!lista.length ? <Text style={s.legenda}>Nenhuma medição neste período. Registre uma medição para começar seu histórico.</Text> : <>
            <Curva registros={lista} pressao={pressao} />
            {comparacao ? <View style={s.resumo} accessibilityLiveRegion="polite">
                <Text style={s.label}>BASE · {dataTexto(base)}</Text><Text style={s.valor}>{valorMedicao(base)}</Text>
                <Text style={s.label}>ATUAL · {dataTexto(atual)}</Text><Text style={s.valor}>{valorMedicao(atual)}</Text>
                <Text style={s.label}>Diferença (atual − base)</Text>
                <Text style={s.delta}>{pressao ? `Sistólica: ${diferenca(comparacao.valor)} mmHg\nDiastólica: ${diferenca(comparacao.diastolica)} mmHg` : `${diferenca(comparacao.valor)} mg/dL`}</Text>
                {!comparacao.mesmoContexto && <Text style={s.legenda}>Contextos diferentes: {base.contexto} → {atual.contexto}. Use o filtro para comparar o mesmo contexto.</Text>}
            </View> : <Text style={s.legenda}>São necessárias duas medições neste filtro para comparar. Selecione uma medição posterior como Atual.</Text>}
            <Text style={s.label}>Histórico · {lista.length} {lista.length === 1 ? 'registro' : 'registros'}</Text>
            <Text style={s.legenda}>Escolha a medição Base e uma medição posterior como Atual.</Text>
            {[...lista].reverse().map(r => <View key={r.id} style={s.linha}><View style={s.dados}><Text style={s.valorLinha}>{valorMedicao(r)}</Text><Text style={s.legenda}>{dataTexto(r)}</Text>{!pressao && <Text style={s.legenda}>{r.contexto}</Text>}</View><View style={s.botoes}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Usar ${dataTexto(r)} como base`} accessibilityState={{ selected: base?.id === r.id, disabled: !anteriores.some(a => a.id === r.id) }} disabled={!anteriores.some(a => a.id === r.id)} onPress={() => setBaseId(r.id)} style={[s.botao, base?.id === r.id && s.ativa, !anteriores.some(a => a.id === r.id) && s.desabilitado]}><Text style={s.textoOpcao}>Base</Text></Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Usar ${dataTexto(r)} como atual`} accessibilityState={{ selected: atual?.id === r.id }} onPress={() => setAtualId(r.id)} style={[s.botao, atual?.id === r.id && s.ativa]}><Text style={s.textoOpcao}>Atual</Text></Pressable>
            </View></View>)}
        </>}
    </View>;
}
const s = StyleSheet.create({
    painel: { marginTop: spacing.lg, gap: spacing.md }, titulo: { ...typography.heading },
    opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, opcao: { padding: spacing.sm, minHeight: 44, justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm }, ativa: { backgroundColor: colors.primarySoft, borderColor: colors.primary }, textoOpcao: { color: colors.text, fontSize: 12 },
    legenda: { color: colors.textMuted, fontSize: 12, lineHeight: 19 }, label: { ...typography.label, fontSize: 12 },
    resumo: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.background, gap: spacing.sm }, valor: { ...typography.heading, marginBottom: spacing.sm }, delta: { color: colors.primaryDark, fontSize: 17, fontWeight: '600', lineHeight: 26 },
    linha: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }, dados: { flex: 1, minWidth: 145 }, valorLinha: { ...typography.body, fontWeight: '600' }, botoes: { flexDirection: 'row', gap: spacing.xs }, botao: { paddingHorizontal: 10, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm }, desabilitado: { opacity: 0.35 },
});

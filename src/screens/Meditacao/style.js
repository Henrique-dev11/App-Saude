import { StyleSheet } from 'react-native';
import base from '../Pressao/style';
import { colors, radius, spacing, typography } from '../../theme';

export default StyleSheet.create({
  ...base,
  temporizador: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.md },
  relogio: { ...typography.title, color: colors.primaryDark, fontSize: 56, fontVariant: ['tabular-nums'] },
  progresso: { height: 6, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden', marginBottom: spacing.md },
  progressoPreenchido: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },
  tocando: { ...typography.caption, color: colors.primaryDark, textAlign: 'center', marginBottom: spacing.sm },
  botaoReiniciar: { minHeight: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: radius.pill, marginVertical: spacing.md },
  textoReiniciar: { ...typography.body, color: colors.primaryDark, fontWeight: '600' },
  faixa: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 76, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  faixaSelecionada: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  numero: { ...typography.caption, color: colors.textMuted },
  dadosFaixa: { flex: 1 },
  tituloFaixa: { ...typography.body, fontWeight: '600' },
  descricaoFaixa: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  marcador: { color: colors.primaryDark, fontSize: 22 },
  pressionado: { opacity: 0.7 },
  volume: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  controlesVolume: { flexDirection: 'row', gap: spacing.sm },
  botaoVolume: { width: 48, height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  desabilitado: { opacity: 0.4 },
  creditos: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  link: { minHeight: 44, justifyContent: 'center' },
  textoLink: { ...typography.caption, color: colors.primaryDark, textDecorationLine: 'underline' },
});

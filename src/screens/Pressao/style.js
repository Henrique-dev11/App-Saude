import { StyleSheet } from 'react-native';
import { colors, layout, radius, shadows, spacing, typography } from '../../theme';

export default StyleSheet.create({
  fundo: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.lg, alignItems: 'center' },
  card: { width: '100%', maxWidth: layout.maxFormWidth, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  title: { ...typography.title, textAlign: 'center', marginBottom: spacing.lg },
  label: { ...typography.label, marginBottom: spacing.sm },
  legenda: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  texto: { ...typography.body },
  valor: { ...typography.title, fontSize: 38, marginVertical: spacing.sm },
  unidade: { ...typography.body, color: colors.textMuted },
  tag: { ...typography.caption, color: colors.primaryDark, backgroundColor: colors.primarySoft, borderRadius: radius.sm, padding: spacing.sm, alignSelf: 'flex-start', marginBottom: spacing.lg },
  secao: { marginTop: spacing.lg, gap: spacing.sm },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  opcao: { minHeight: 48, justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm },
  selecionada: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  aviso: { ...typography.caption, color: colors.textMuted, marginTop: spacing.md, lineHeight: 20 },
  erro: { ...typography.body, color: colors.danger },
  linha: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm },
  listaLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
});

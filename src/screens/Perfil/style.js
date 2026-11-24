import { StyleSheet } from 'react-native';
import { colors, layout, radius, shadows, spacing, typography } from '../../theme';

export default StyleSheet.create({
    fundo: { flex: 1, backgroundColor: colors.background },
    container: { flexGrow: 1, padding: spacing.lg, alignItems: 'center' },
    card: { width: '100%', maxWidth: layout.maxFormWidth, backgroundColor: colors.surface,
        borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.card },
    titulo: { ...typography.title, textAlign: 'center', marginBottom: spacing.lg },
    foto: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', backgroundColor: colors.primarySoft, marginBottom: spacing.md },
    nome: { fontSize: 23, fontWeight: '700', color: colors.text, textAlign: 'center' },
    email: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.md },
    secao: { ...typography.heading, marginTop: spacing.lg, marginBottom: spacing.md },
    linha: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.sm,
        borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.sm },
    rotulo: { ...typography.label, marginBottom: 6 },
    valor: { ...typography.body, fontWeight: '600' },
    formulario: { marginTop: spacing.lg },
    senha: { marginTop: spacing.md },
    dica: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.sm },
    link: { paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
    linkTexto: { color: colors.primary, fontSize: 15, fontWeight: '600' },
    sair: { color: colors.danger, fontSize: 16, fontWeight: '700' },
    erro: { color: colors.danger, fontSize: 14, marginTop: spacing.md },
    sucesso: { color: colors.success, fontSize: 14, marginTop: spacing.md },
});

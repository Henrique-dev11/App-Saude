import { StyleSheet } from 'react-native';
import { colors, layout, radius, shadows, spacing, typography } from '../../theme';

export default StyleSheet.create({
    fundo: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flexGrow: 1,
        padding: spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        maxWidth: layout.maxFormWidth,
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
    },
    logo: {
        width: 90,
        height: 90,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginBottom: spacing.sm,
    },
    titulo: {
        ...typography.title,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitulo: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    rotulo: {
        ...typography.label,
        marginBottom: 6,
    },
    // mensagem de erro da validação (vermelho do tema)
    erro: {
        color: colors.danger,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
});

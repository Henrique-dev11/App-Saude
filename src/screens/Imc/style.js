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
    title: {
        ...typography.title,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    label: {
        ...typography.label,
        marginBottom: 6,
    },
    btn: {
        width: '100%',
        backgroundColor: colors.primary,
        borderRadius: radius.pill,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.sm,
    },
    btnPressed: {
        backgroundColor: colors.primaryDark,
    },
    btnText: {
        color: colors.textOnPrimary,
        fontWeight: '600',
        fontSize: 16,
    },
    resultadoContainer: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
    },
    resultado: {
        ...typography.heading,
        textAlign: 'center',
    },
    categoria: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: spacing.sm,
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        overflow: 'hidden',
    },
    imc: {
        width: '100%',
        maxWidth: 260,
        aspectRatio: 436 / 242,
        height: undefined,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginBottom: spacing.md,
    },
});

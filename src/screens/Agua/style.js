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
        alignItems: 'center',
    },
    // Coluna central: limita a largura em tablet/desktop
    conteudo: {
        width: '100%',
        maxWidth: layout.maxFormWidth,
    },
    titulo: {
        ...typography.title,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
    },
    cardProgresso: {
        alignItems: 'center',
    },
    gota: {
        width: 72,
        height: 100,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginBottom: spacing.sm + 4,
    },
    resultado: {
        ...typography.heading,
        marginBottom: spacing.md,
    },
    linhaPeso: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm + 4,
        gap: spacing.sm,
    },
    labelPeso: {
        ...typography.heading,
    },
    texto: {
        ...typography.heading,
        marginBottom: spacing.md,
    },
    textoSegundo: {
        marginTop: spacing.lg,
    },
    botao: {},
    botoes: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
});

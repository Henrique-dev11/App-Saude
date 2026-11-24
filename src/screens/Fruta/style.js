import { StyleSheet } from 'react-native';
import { colors, layout, spacing } from '../../theme';

export default StyleSheet.create({
    fundo: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    conteudo: {
        width: '100%',
        maxWidth: layout.maxFormWidth,
    },
    titulo: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    subtitulo: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    erro: {
        color: colors.danger,
        fontSize: 14,
        marginTop: spacing.md,
    },
});

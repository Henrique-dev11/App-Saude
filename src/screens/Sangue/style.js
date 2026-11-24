import { StyleSheet } from 'react-native';
import { colors, layout, spacing } from '../../theme';

// Aqui ficam só os estilos da tela.
// Os estilos do botão e do card estão dentro de cada componente.
export default StyleSheet.create({
    fundo: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    // limita a largura em telas grandes
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
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
    },
    botoes: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
});

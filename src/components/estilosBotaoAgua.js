import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme';

// Estilos compartilhados pelos botões de adicionar (+) e retirar (-) água
export default StyleSheet.create({
    botao: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing.sm + 4,
        paddingHorizontal: spacing.sm,
        minWidth: 76,
        ...shadows.soft,
    },
    pressionado: {
        backgroundColor: colors.primarySoft,
    },
    image: {
        width: 40,
        height: 56,
        resizeMode: 'contain',
        marginBottom: spacing.sm,
    },
    texto: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
    },
    textoNegativo: {
        color: colors.danger,
    },
});

import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../theme';

const UserCard = ({ nome, cargo, onPress, imagem, icone }) => {
    return (
        <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={onPress}
        >
            <View style={styles.avatarBox}>
                {icone || <Image source={imagem ? imagem : require('../../assets/avatar.png')} style={styles.avatar} />}
            </View>
            <Text style={styles.name} numberOfLines={1}>{nome}</Text>
            {cargo ? <Text style={styles.cargo}>{cargo}</Text> : null}
        </Pressable>
    );
};

export default UserCard;

const styles = StyleSheet.create({
    card: {
        width: '31%', // 3 colunas: 3 x 31% + o espaço sobrando entre eles (ver Home/style.js)
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xs + 2,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
    },
    cardPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
    avatarBox: {
        width: '100%',
        maxWidth: 84,
        aspectRatio: 1, // fica quadrado e encolhe junto com o card em telas pequenas
        borderRadius: radius.lg,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm + 4,
    },
    avatar: {
        width: '70%',
        height: '70%',
        resizeMode: 'contain',
    },
    name: {
        ...typography.heading,
        fontSize: 14,
        textAlign: 'center',
    },
    cargo: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: 2,
    },
});

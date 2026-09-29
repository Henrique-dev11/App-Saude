import React from 'react';
import { Text, StyleSheet, Image, Pressable } from 'react-native';

const UserCard = ({ nome, cargo, onPress, imagem }) => {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
            ]}
        >
            <Image
                source={imagem || require('../../assets/avatar.png')}
                style={styles.avatar}
                resizeMode="contain"
            />
            <Text style={styles.name}>{nome}</Text>
            <Text style={styles.cargo}>{cargo}</Text>
        </Pressable>
    );
};

export default UserCard;

const styles = StyleSheet.create({
    card: {
        width: '48%',
        minHeight: 180,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e7f3ff',
    },
    cardPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 18,
        marginBottom: 10,
        backgroundColor: '#f1f9ff',
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f3b5c',
        textAlign: 'center',
    },
    cargo: {
        fontSize: 13,
        color: '#55758a',
        textAlign: 'center',
        marginTop: 4,
    },
});
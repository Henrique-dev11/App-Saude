import { Pressable, Text, StyleSheet } from 'react-native';

export default function Button({ label, onPress }) {
    return (
        <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={onPress}
        >
            <Text style={styles.btnText}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    btn: {
        backgroundColor: '#2e86de',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 16,
    },
    btnPressed: {
        opacity: 0.7,
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
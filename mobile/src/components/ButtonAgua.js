import { Pressable, Text, StyleSheet } from 'react-native';

export default function ButtonAgua({ label, onPress }) {
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
        backgroundColor: '#1E88E5',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 16,
        width: '100%',
        alignItems: 'center',
    },
    btnPressed: {
        opacity: 0.8,
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
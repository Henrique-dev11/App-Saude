import { View, Text, StyleSheet } from 'react-native';

const Card = ({ titulo, children }) => {
    return (
        <View style={styles.card}>

            {titulo && (
                <Text style={styles.title}>
                    {titulo}
                </Text>
            )}

            {children}

        </View>
    );
};

export default Card;

const styles = StyleSheet.create({

    card: {
        width: '100%',
        maxWidth: 430,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 30,
        padding: 22,
        alignItems: 'center',

        shadowColor: '#0f4c81',
        shadowOffset: {
            width: 0,
            height: 18,
        },
        shadowOpacity: 0.14,
        shadowRadius: 20,

        elevation: 8,
    },

    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#0d5d8f',
        marginBottom: 18,
        letterSpacing: 0.5,
    },

});
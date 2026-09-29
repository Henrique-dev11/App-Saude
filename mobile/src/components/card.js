import { View, Text, StyleSheet } from 'react-native';



const Card = () => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>Card Title</Text>
            <Text>Conteúdo do cartão</Text>
        </View>
    );
};

export default Card;

const styles = StyleSheet.create({
    card: {
   flex: 1,
    margin: 8,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    
    // Sombra para o card (opcional)
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
});
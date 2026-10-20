import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import Avatar from './src/components/Avatar';
import Login from './src/Pages/Login';
import Cadastro from './src/Pages/Cadastro';
import Perfil from './src/Pages/Perfil';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import UserCard from './src/components/Usercard';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Imc from './src/Pages/Imc';
import Sangue from './src/Pages/Sangue';
import Agua from './src/Pages/Agua';
import Remedio from './src/Pages/Remedio';
import Alergias from './src/Pages/Alergias';
import Glicemia from './src/Pages/Glicemia';
import Pressao from './src/Pages/Pressao';
import Vacinas from './src/Pages/Vacinas';
import Meditacao from './src/Pages/Meditacao';
import Fruta from './src/Pages/Fruta';
import Dica from './src/Pages/Dica';
import Emergencia from './src/Pages/Emergencia';

const Stack = createNativeStackNavigator();

const cards = [
    { nome: 'Sangue', cargo: 'Hemograma', page: 'Sangue', imagem: require('./assets/Sangue.png') },
    { nome: 'Água', cargo: 'Beber água', page: 'Agua', imagem: require('./assets/Água.png') },
    { nome: 'Remédio', cargo: 'Seus Remédios', page: 'Remedio', imagem: require('./assets/Remedio.png') },
    { nome: 'Alergias', cargo: 'Suas Alergias', page: 'Alergias', imagem: require('./assets/Alergias.png') },
    { nome: 'Glicemia', cargo: 'Sua Glicemia', page: 'Glicemia', imagem: require('./assets/Glicemia.png') },
    { nome: 'Pressão', cargo: 'Sua saúde', page: 'Pressao', imagem: require('./assets/Pressao.png') },
    { nome: 'IMC', cargo: 'Cálculo corporal', page: 'Imc', imagem: require('./assets/IMC1.png') },
    { nome: 'Vacinas', cargo: 'Seu calendário', page: 'Vacinas', imagem: require('./assets/Vacinas.png') },
    { nome: 'Meditação', cargo: 'Mente saudável', page: 'Meditacao', imagem: require('./assets/Meditação.png') },
    { nome: 'Fruta', cargo: 'Alimentação', page: 'Fruta', imagem: require('./assets/Frutas.png') },
    { nome: 'Dica', cargo: 'Uma dica', page: 'Dica', imagem: require('./assets/Dicas.png') },
    { nome: 'Emergência', cargo: 'Caso urgente', page: 'Emergencia', imagem: require('./assets/Emergencias.png') },
];

function Home({ navigation }) {
    const { user } = useAuth();
    return (
        <SafeAreaView style={styles.scroll}><ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><Text style={[styles.headerTitle, { flex: 1 }]}>Olá, {user.name}!</Text><Avatar name={user.name} photo={user.photo} onPress={() => navigation.navigate('Perfil')} /></View>
                <Text style={styles.headerSubtitle}>Seu cuidado diário em um lugar só</Text>
            </View>

            <View style={styles.container}>
                {cards.map((card) => (
                    <UserCard
                        key={card.page}
                        nome={card.nome}
                        cargo={card.cargo}
                        imagem={card.imagem}
                        onPress={() => navigation.navigate(card.page)}
                    />
                ))}
            </View>
        </ScrollView></SafeAreaView>
    );
}

function AppNavigator() {
    const { user } = useAuth();
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={({ navigation }) => ({ headerRight: () => user ? <Avatar name={user.name} photo={user.photo} onPress={() => navigation.navigate('Perfil')} /> : null })}>
                {!user ? <Stack.Group navigationKey="guest">
                    <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                    <Stack.Screen name="Cadastro" component={Cadastro} options={{ title: 'Cadastro' }} />
                </Stack.Group> : <Stack.Group navigationKey="user">

                <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />

                <Stack.Screen
                    name="Imc"
                    component={Imc}
                    options={{ title: 'IMC' }}
                />
                <Stack.Screen
                    name="Sangue"
                    component={Sangue}
                    options={{ title: 'Sangue' }}
                />
                <Stack.Screen
                    name="Agua"
                    component={Agua}
                    options={{ title: 'Água' }}
                />
                <Stack.Screen
                    name="Remedio"
                    component={Remedio}
                    options={{ title: 'Remédio' }}
                />
                <Stack.Screen
                    name="Alergias"
                    component={Alergias}
                    options={{ title: 'Alergias' }}
                />
                <Stack.Screen
                    name="Glicemia"
                    component={Glicemia}
                    options={{ title: 'Glicemia' }}
                />
                <Stack.Screen
                    name="Pressao"
                    component={Pressao}
                    options={{ title: 'Pressão' }}
                />
                <Stack.Screen
                    name="Vacinas"
                    component={Vacinas}
                    options={{ title: 'Vacinas' }}
                />
                <Stack.Screen
                    name="Meditacao"
                    component={Meditacao}
                    options={{ title: 'Meditação' }}
                />
                <Stack.Screen
                    name="Fruta"
                    component={Fruta}
                    options={{ title: 'Fruta' }}
                />
                <Stack.Screen
                    name="Dica"
                    component={Dica}
                    options={{ title: 'Dica' }}
                />
                <Stack.Screen
                    name="Emergencia"
                    component={Emergencia}
                    options={{ title: 'Emergência' }}
                />
            <Stack.Screen name="Perfil" component={Perfil} options={{ title: 'Meu perfil', headerRight: () => null }} />
                </Stack.Group>}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: '#edf8ff',
    },
    scrollContent: {
        paddingBottom: 24,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 28,
        paddingBottom: 18,
        backgroundColor: '#dff3ff',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#0d3b5f',
    },
    headerSubtitle: {
        marginTop: 6,
        fontSize: 16,
        color: '#4d6a7d',
    },
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: '#edf8ff',
    },
});
export default function App() {
    return <SafeAreaProvider><AuthProvider><AppNavigator /></AuthProvider></SafeAreaProvider>;
}

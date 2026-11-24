// App.js
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AutenticacaoProvider, useAutenticacao } from './src/contexts/Autenticacao';
import Botao from './src/components/Botao';

import Home from './src/screens/Home';
import Imc from './src/screens/Imc';
import Agua from './src/screens/Agua';
import Alergia from './src/screens/Alergia';
import Dica from './src/screens/Dica';
import Emergencia from './src/screens/Emergencia';
import Fruta from './src/screens/Fruta';
import Glicemia from './src/screens/Glicemia';
import Pressao from './src/screens/Pressao';
import Meditacao from './src/screens/Meditacao';
import Remedio from './src/screens/Remedio';
import Sangue from './src/screens/Sangue';
import Perfil from './src/screens/Perfil';
import BotaoPerfil from './src/components/BotaoPerfil';
import Vacina from './src/screens/Vacina';
import Login from './src/screens/Login';
import Cadastro from './src/screens/Cadastro';
import UnidadesSaude from './src/screens/UnidadesSaude';

import { colors } from './src/theme';

const Stack = createNativeStackNavigator();

// Aparência padrão do cabeçalho, aplicada a todas as telas
const opcoesPadrao = {
  headerStyle: { backgroundColor: colors.header },
  headerTintColor: colors.headerText,
  headerTitleStyle: { fontWeight: '600' },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

export default function App() {
  return <AutenticacaoProvider><Rotas /></AutenticacaoProvider>;
}

function Rotas() {
  const { usuario, iniciando, erroInicial, restaurar, destino } = useAutenticacao();
  if (iniciando || erroInicial) return <View style={styles.inicio}>
    {iniciando ? <><ActivityIndicator size="large" color={colors.primary} /><Text>Carregando sua conta...</Text></>
      : <><Text accessibilityRole="alert">{erroInicial}</Text><Botao titulo="Tentar novamente" onPress={restaurar} /></>}
  </View>;
  return (
    <NavigationContainer>
      <Stack.Navigator
        key={usuario ? 'autenticado' : 'publico'}
        initialRouteName={usuario ? destino : 'Login'}
        screenOptions={({ navigation }) => ({
          ...opcoesPadrao,
          // botão de perfil no canto superior direito de todas as telas
          headerRight: () => <BotaoPerfil onPress={() => navigation.navigate('Perfil')} />,
        })}
      >
        {/* login e cadastro: sem cabeçalho */}
        {!usuario ? <>
        <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
        <Stack.Screen name='Cadastro' component={Cadastro} options={{ headerShown: false }} />
        </> : <>
        <Stack.Screen name='Home' component={Home} options={{ headerBackVisible: false }} />
        <Stack.Screen name='Imc' component={Imc} />
        <Stack.Screen name='Agua' component={Agua} />
        <Stack.Screen name='Sangue' component={Sangue} />
        <Stack.Screen name='Fruta' component={Fruta} />
        <Stack.Screen name='Pressao' component={Pressao} options={{ title: 'Pressão arterial' }} />
        <Stack.Screen name='Glicemia' component={Glicemia} />
        <Stack.Screen name='Alergias' component={Alergia} />
        <Stack.Screen name='Meditacao' component={Meditacao} options={{ title: 'Meditação' }} />
        <Stack.Screen name='UnidadesSaude' component={UnidadesSaude} options={{ title: 'Unidades de saúde',
          headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: '600', color: colors.text } }} />
        {/* na tela de perfil não precisa do botão de perfil */}
        <Stack.Screen name='Perfil' component={Perfil} options={{ headerRight: () => null }} />
        </>}
      </Stack.Navigator>
      <StatusBar style='light' />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({ inicio: { flex: 1, justifyContent: 'center', alignItems: 'center',
  backgroundColor: colors.background, padding: 24, gap: 16 } });

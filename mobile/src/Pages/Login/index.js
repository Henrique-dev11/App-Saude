import { useState } from 'react';
import { Text, Pressable } from 'react-native';
import AccountLayout from '../../components/AccountLayout';
import FormField from '../../components/FormField';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import styles from './style';
export default function Login({ navigation, route }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    function submit() {
        setError('');
        if (!email.trim() || !password) return setError('Preencha o e-mail e a senha.');
        try { login(email, password); } catch (err) { setError(err.message); }
    }
    return <AccountLayout title="Bem-vindo" subtitle="Entre para cuidar da sua saúde.">
        {route.params?.registered && <Text style={styles.success}>Cadastro realizado! Entre com seu e-mail e senha.</Text>}
        <FormField label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />
        <FormField label="Senha" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete="current-password" onSubmitEditing={submit} />
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <Button label="Entrar" onPress={submit} />
        <Pressable onPress={() => navigation.navigate('Cadastro')}><Text style={styles.link}>Criar minha conta</Text></Pressable>
        <Text style={styles.subtitle}>Demonstração local: os cadastros são apagados ao fechar o app.</Text>
    </AccountLayout>;
}

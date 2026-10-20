import { useState } from 'react';
import { Text, Pressable } from 'react-native';
import AccountLayout from '../../components/AccountLayout';
import FormField from '../../components/FormField';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../Login/style';
import HealthFields from '../../components/HealthFields';
import { normalizeHealthProfile } from '../../Function/functionPerfil';
export default function Cadastro({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [weight, setWeight] = useState('');
    const [age, setAge] = useState('');
    const [bloodType, setBloodType] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    function submit() {
        setError('');
        if (!name.trim()) return setError('Informe seu nome.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Informe um e-mail válido.');
        if (password.length < 8) return setError('A senha deve ter pelo menos 8 caracteres.');
        if (password !== confirmation) return setError('As senhas não conferem.');
        try {
            const health = normalizeHealthProfile({ weight, age, bloodType });
            register({ name, email, password, ...health });
            navigation.navigate('Login', { registered: true });
        } catch (err) { setError(err.message); }
    }
    return <AccountLayout title="Criar conta" subtitle="Preencha seus dados para começar.">
        <FormField label="Nome" value={name} onChangeText={setName} autoComplete="name" maxLength={80} />
        <FormField label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />
        <HealthFields weight={weight} age={age} bloodType={bloodType}
            onWeightChange={setWeight} onAgeChange={setAge} onBloodTypeChange={setBloodType} />
        <FormField label="Senha" placeholder="Pelo menos 8 caracteres" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete="new-password" />
    
        <FormField label="Confirmar senha" value={confirmation} onChangeText={setConfirmation} secureTextEntry autoCapitalize="none" onSubmitEditing={submit} />
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <Button label="Cadastrar" onPress={submit} />
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.link}>Já tenho conta</Text></Pressable>
    </AccountLayout>;
}

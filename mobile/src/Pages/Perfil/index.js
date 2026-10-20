import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AccountLayout from '../../components/AccountLayout';
import Avatar from '../../components/Avatar';
import FormField from '../../components/FormField';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../Login/style';
import HealthFields from '../../components/HealthFields';
export default function Perfil({ navigation }) {
    const { user, updateProfile, logout } = useAuth();
    const [name, setName] = useState(user.name);
    const [photo, setPhoto] = useState(user.photo);
    const [weight, setWeight] = useState(String(user.weight ?? ''));
    const [age, setAge] = useState(String(user.age ?? ''));
    const [bloodType, setBloodType] = useState(user.bloodType || '');
    const [error, setError] = useState('');
    async function choosePhoto() {
        setError('');
        try {
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
            if (!result.canceled && result.assets?.[0]) setPhoto(result.assets[0].uri);
        } catch { setError('Não foi possível abrir a galeria. Verifique as permissões e tente novamente.'); }
    }
    function save() {
        if (!name.trim()) return setError('Informe seu nome.');
        try {
            updateProfile({ name, photo, weight, age, bloodType });
            navigation.goBack();
        } catch (err) { setError(err.message); }
    }
    return <AccountLayout title="Meu perfil" subtitle="Atualize sua foto e seus dados de saúde.">
        <View style={styles.photo}><Avatar name={name} photo={photo} size={96} onPress={choosePhoto} /><Pressable onPress={choosePhoto}><Text style={styles.link}>Escolher foto da galeria</Text></Pressable></View>
        {!!photo && <Pressable onPress={() => setPhoto(null)}><Text style={styles.link}>Remover foto</Text></Pressable>}
        <FormField label="Nome" value={name} onChangeText={setName} maxLength={80} />
        <Text style={styles.subtitle}>{user.email}</Text>
        <HealthFields weight={weight} age={age} bloodType={bloodType}
            onWeightChange={setWeight} onAgeChange={setAge} onBloodTypeChange={setBloodType} />
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <Button label="Salvar alterações" onPress={save} />
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.link}>Cancelar</Text></Pressable>
        <Pressable onPress={logout}><Text style={styles.link}>Sair da conta</Text></Pressable>
    </AccountLayout>;
}
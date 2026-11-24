import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import styles from './style';

// componentes reaproveitados do projeto
import InputCampo from '../../components/InputCampo';
import Botao from '../../components/Botao';
import BotaoLink from '../../components/BotaoLink';
import { useAutenticacao } from '../../contexts/Autenticacao';

export default function Login({ navigation, route }) {
    const { entrar: autenticar } = useAutenticacao();
    const [carregando, setCarregando] = useState(false);
    // cada campo da tela fica guardado em um estado
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState(route?.params?.aviso || '');

    // IMPORTANTE: validação do login
    async function entrar() {
        if (carregando) return;
        if (email.trim() === '' || senha === '') {
            setErro('Preencha o e-mail e a senha.');
            return; 
        }

        setErro('');
        setCarregando(true);
        try { await autenticar({ email, senha }); }
        catch (error) { setErro(error.message); }
        finally { setCarregando(false); }
    }

    return (
        <ScrollView
            style={styles.fundo}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps='handled'
        >
            <View style={styles.card}>
                <Image source={require('../../../assets/logo.png')} style={styles.logo} />
                <Text style={styles.titulo}>Bem-vindo!</Text>
                <Text style={styles.subtitulo}>Entre para cuidar da sua saúde</Text>

                <Text style={styles.rotulo}>E-mail:</Text>
                <InputCampo
                    placeholder='Digite seu e-mail'
                    keyboardType='email-address'
                    value={email}
                    onChangeText={setEmail}
                    editable={!carregando} autoComplete="email" accessibilityLabel="E-mail"
                />

                <Text style={styles.rotulo}>Senha:</Text>
                {/* secureTextEntry esconde a senha com bolinhas */}
                <InputCampo
                    placeholder='Digite sua senha'
                    keyboardType='default'
                    secureTextEntry
                    value={senha}
                    onChangeText={setSenha}
                    editable={!carregando} autoComplete="current-password" accessibilityLabel="Senha"
                />

                {/* só aparece se tiver erro */}
                {erro ? <Text style={styles.erro} accessibilityRole="alert">{erro}</Text> : null}

                <Botao titulo='Entrar' onPress={entrar} carregando={carregando} />

                {/* leva para a tela de cadastro */}
                {!carregando && <BotaoLink
                    texto='Não tem conta?'
                    destaque='Cadastre-se'
                    onPress={() => navigation.navigate('Cadastro')}
                />}
            </View>
        </ScrollView>
    );
}

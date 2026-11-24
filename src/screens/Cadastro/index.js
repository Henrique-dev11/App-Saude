import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import styles from './style';
import InputCampo from '../../components/InputCampo';
import Botao from '../../components/Botao';
import BotaoLink from '../../components/BotaoLink';
import CamposUsuario, { formularioUsuario } from '../../components/CamposUsuario';
import { validarCadastro } from '../../services/validarUsuario';
import { useAutenticacao } from '../../contexts/Autenticacao';

export default function Cadastro({ navigation }) {
    const { cadastrar } = useAutenticacao();
    const [dados, setDados] = useState(formularioUsuario());
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState('');
    const [salvando, setSalvando] = useState(false);

    async function enviar() {
        if (salvando) return;
        setErro('');
        try {
            const payload = { ...dados, senha, confirmarSenha };
            validarCadastro(payload);
            setSalvando(true);
            await cadastrar(payload);
        } catch (error) {
            if (error.code === 'SESSION_STORAGE') navigation.navigate('Login', { aviso: error.message });
            else setErro(error.message);
        }
        finally { setSalvando(false); }
    }

    return <ScrollView style={styles.fundo} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
            <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.titulo}>Criar conta</Text>
            <Text style={styles.subtitulo}>Seus dados para cuidar da sua saúde</Text>
            <CamposUsuario value={dados} onChange={setDados} disabled={salvando} />
            <Text style={styles.rotulo}>Senha</Text>
            <InputCampo placeholder="Crie sua senha" accessibilityLabel="Senha" keyboardType="default" secureTextEntry
                autoComplete="new-password" value={senha} onChangeText={setSenha} editable={!salvando} />
            <Text style={styles.subtitulo}>Use de 8 a 128 caracteres, com letras e números.</Text>
            <Text style={styles.rotulo}>Confirmar senha</Text>
            <InputCampo placeholder="Repita sua senha" accessibilityLabel="Confirmar senha" keyboardType="default" secureTextEntry
                autoComplete="new-password" value={confirmarSenha} onChangeText={setConfirmarSenha} editable={!salvando} />
            {erro ? <Text style={styles.erro} accessibilityRole="alert">{erro}</Text> : null}
            <Botao titulo="Cadastrar" onPress={enviar} carregando={salvando} />
            {!salvando && <BotaoLink texto="Já tem conta?" destaque="Entrar" onPress={() => navigation.navigate('Login')} />}
        </View>
    </ScrollView>;
}

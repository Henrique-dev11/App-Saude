import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Platform, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import styles from './style';
import InputCampo from '../../components/InputCampo';
import Botao from '../../components/Botao';
import CamposUsuario, { formularioUsuario } from '../../components/CamposUsuario';
import { validarDadosPessoais, validarSenha } from '../../services/validarUsuario';
import { useAutenticacao } from '../../contexts/Autenticacao';

export default function Perfil({ navigation }) {
    const { usuario, salvarPerfil, alterarSenha, sair, recarregarPerfil } = useAutenticacao();
    const [editando, setEditando] = useState(false);
    const [dados, setDados] = useState(formularioUsuario(usuario));
    const [foto, setFoto] = useState(usuario.foto);
    const [versao, setVersao] = useState(usuario.versao);
    const [trocandoSenha, setTrocandoSenha] = useState(false);
    const [senhas, setSenhas] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' });
    const [ocupado, setOcupado] = useState(false);
    const [erro, setErro] = useState('');
    const [conflito, setConflito] = useState(false);
    const [sucesso, setSucesso] = useState('');

    function editar() {
        setDados(formularioUsuario(usuario));
        setFoto(usuario.foto);
        setVersao(usuario.versao);
        setErro(''); setSucesso(''); setConflito(false); setEditando(true); setTrocandoSenha(false);
    }
    async function escolherFoto() {
        setErro('');
        try {
            if (Platform.OS !== 'web') {
                const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permissao.granted) throw new Error('Permita o acesso à galeria nas configurações do aparelho para escolher uma foto.');
            }
            const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true,
                aspect: [1, 1], quality: 0.6, base64: true });
            if (resultado.canceled) return;
            const asset = resultado.assets?.[0];
            if (!asset?.base64) throw new Error('Não foi possível ler esta imagem. Escolha outra foto.');
            if (asset.base64.length > 2800000) throw new Error('Escolha uma foto com até 2 MB.');
            // Usa a assinatura do arquivo: o formato pode mudar após o recorte do seletor.
            const inicio = asset.base64;
            const mime = inicio.startsWith('/9j/') ? 'jpeg' : inicio.startsWith('iVBORw0KGgo') ? 'png'
                : inicio.startsWith('UklGR') ? 'webp' : null;
            if (!mime) throw new Error('Escolha uma foto JPEG, PNG ou WebP.');
            setFoto('data:image/' + mime + ';base64,' + inicio);
        } catch (error) { setErro(error.message || 'Não foi possível abrir a galeria.'); }
    }
    async function salvar() {
        if (ocupado) return;
        setErro(''); setSucesso(''); setConflito(false);
        try {
            const validados = validarDadosPessoais(dados);
            setOcupado(true);
            await salvarPerfil({ ...validados, foto, versao });
            setEditando(false);
            setSucesso('Perfil atualizado com sucesso.');
        } catch (error) { setErro(error.message); setConflito(error.code === 'PROFILE_CONFLICT'); }
        finally { setOcupado(false); }
    }
    async function salvarSenha() {
        if (ocupado) return;
        setErro(''); setSucesso('');
        try {
            if (!senhas.senhaAtual) throw new Error('Informe sua senha atual.');
            validarSenha(senhas.novaSenha);
            if (senhas.novaSenha !== senhas.confirmar) throw new Error('As novas senhas não são iguais.');
            setOcupado(true);
            await alterarSenha({ senhaAtual: senhas.senhaAtual, novaSenha: senhas.novaSenha });
            setSenhas({ senhaAtual: '', novaSenha: '', confirmar: '' });
            setTrocandoSenha(false);
            setSucesso('Senha alterada com sucesso. As outras sessões foram encerradas.');
        } catch (error) { setErro(error.message); }
        finally { setOcupado(false); }
    }
    async function encerrar() {
        setOcupado(true); setErro('');
        try { await sair(); }
        catch (error) { setErro(error.message); }
        finally { setOcupado(false); }
    }
    async function recarregar() {
        setOcupado(true);
        try { await recarregarPerfil(); setEditando(false); setConflito(false); setErro(''); }
        catch (error) { setErro(error.message); }
        finally { setOcupado(false); }
    }
    const linha = (rotulo, valor) => <View style={styles.linha} key={rotulo}>
        <Text style={styles.rotulo}>{rotulo}</Text><Text style={styles.valor}>{valor}</Text>
    </View>;

    return <ScrollView style={styles.fundo} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
            <Text style={styles.titulo}>Meu perfil</Text>
            <Image source={(editando ? foto : usuario.foto) ? { uri: editando ? foto : usuario.foto }
                : require('../../../assets/avatar.png')} style={styles.foto} accessibilityLabel="Foto de perfil" />
            <Text style={styles.nome}>{usuario.nome}</Text>
            <Text style={styles.email}>{usuario.email}</Text>
            {editando ? <>
                <Botao titulo={foto ? 'Substituir foto' : 'Adicionar foto'} onPress={escolherFoto} disabled={ocupado} />
                {foto ? <Pressable onPress={() => setFoto(null)} disabled={ocupado} accessibilityRole="button" style={styles.link}>
                    <Text style={styles.linkTexto}>Remover foto</Text></Pressable> : null}
                <View style={styles.formulario}><CamposUsuario value={dados} onChange={setDados} disabled={ocupado} /></View>
                <Botao titulo="Salvar alterações" onPress={salvar} carregando={ocupado} />
                <Botao titulo="Cancelar edição" disabled={ocupado} onPress={() => { setEditando(false); setErro(''); setConflito(false); }} />
            </> : <>
                <Text style={styles.secao}>Informações pessoais</Text>
                {linha('Idade', usuario.idade + ' anos')}
                {linha('Tipo sanguíneo', usuario.tipoSanguineo)}
                <Text style={styles.secao}>Alergias</Text>
                {linha('Tipo de alergia', usuario.tipoAlergia || 'Não informado')}
                <Text style={styles.secao}>Informações físicas</Text>
                {linha('Peso', usuario.peso.toLocaleString('pt-BR') + ' kg')}
                {linha('Altura', usuario.altura.toLocaleString('pt-BR') + ' cm')}
                {!trocandoSenha && <Botao titulo="Editar perfil" onPress={editar} disabled={ocupado} />}
            </>}
            {!editando && <View style={styles.senha}>
                <Text style={styles.secao}>Segurança da conta</Text>
                {trocandoSenha ? <>
                    {[
                        ['senhaAtual', 'Senha atual', 'current-password'],
                        ['novaSenha', 'Nova senha', 'new-password'],
                        ['confirmar', 'Confirmar nova senha', 'new-password'],
                    ].map(([key, label, complete]) => <View key={key}>
                        <Text style={styles.rotulo}>{label}</Text>
                        <InputCampo keyboardType="default" secureTextEntry placeholder={label} accessibilityLabel={label}
                            autoComplete={complete} editable={!ocupado} value={senhas[key]}
                            onChangeText={value => setSenhas({ ...senhas, [key]: value })} />
                    </View>)}
                    <Text style={styles.dica}>Use de 8 a 128 caracteres, com letras e números.</Text>
                    <Botao titulo="Salvar nova senha" onPress={salvarSenha} carregando={ocupado} />
                    <Botao titulo="Cancelar alteração de senha" disabled={ocupado} onPress={() => { setTrocandoSenha(false);
                        setSenhas({ senhaAtual: '', novaSenha: '', confirmar: '' }); setErro(''); }} />
                </> : <Botao titulo="Alterar senha" disabled={ocupado} onPress={() => { setTrocandoSenha(true); setErro(''); setSucesso(''); }} />}
            </View>}
            {erro ? <Text style={styles.erro} accessibilityRole="alert">{erro}</Text> : null}
            {conflito && <Botao titulo="Recarregar perfil" onPress={recarregar} disabled={ocupado} />}
            {sucesso ? <Text style={styles.sucesso} accessibilityLiveRegion="polite">{sucesso}</Text> : null}
            {!editando && !trocandoSenha && <Botao titulo="Ir para o início" onPress={() => navigation.navigate('Home')} disabled={ocupado} />}
            <Pressable style={styles.link} accessibilityRole="button" disabled={ocupado} onPress={encerrar}>
                <Text style={styles.sair}>Sair da conta</Text>
            </Pressable>
        </View>
    </ScrollView>;
}

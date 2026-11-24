import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const CHAVE = 'app-saude.sessao.v1';
let token = null;

function endereco(caminho) {
    const configured = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_FRUIT_API_URL;
    let base = configured;
    if (!base && Platform.OS === 'web') base = window.location.origin;
    if (!base && __DEV__ && Constants.expoConfig?.hostUri) {
        const host = Constants.expoConfig.hostUri;
        base = host.includes('://') ? host : 'http://' + host;
    }
    if (!base) throw Object.assign(new Error('O serviço de contas ainda não foi configurado.'), { code: 'AUTH_CONFIGURATION' });
    try {
        const url = new URL('/api/auth' + caminho, base);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
        return url.toString();
    } catch { throw Object.assign(new Error('O endereço do serviço de contas está inválido.'), { code: 'AUTH_CONFIGURATION' }); }
}

async function requisitar(method, caminho, data) {
    try {
        const response = await axios({ method, url: endereco(caminho), data, timeout: 15000,
            withCredentials: Platform.OS === 'web',
            headers: { 'X-App-Client': Platform.OS === 'web' ? 'web' : 'native',
                ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        });
        if (caminho !== '/logout' && (!response.data?.usuario?.id || typeof response.data.usuario.nome !== 'string')) {
            throw Object.assign(new Error('O serviço de contas retornou uma resposta inválida.'), { code: 'INVALID_RESPONSE' });
        }
        return response.data;
    } catch (error) {
        if (['INVALID_RESPONSE', 'AUTH_CONFIGURATION'].includes(error.code)) throw error;
        const message = error.response?.data?.error ||
            (error.code === 'ECONNABORTED' ? 'A solicitação demorou mais que o esperado. Tente novamente.'
                : 'Não foi possível conectar ao serviço de contas. Verifique sua conexão e tente novamente.');
        throw Object.assign(new Error(message), { code: error.response?.data?.code || error.code });
    }
}

async function receberSessao(result) {
    if (Platform.OS !== 'web') {
        if (!result.token) throw new Error('Não foi possível iniciar a sessão neste aparelho.');
        try { await SecureStore.setItemAsync(CHAVE, result.token, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }); }
        catch {
            // Não anuncia sessão persistente quando o armazenamento seguro falha.
            token = result.token;
            try { await requisitar('POST', '/logout'); } catch { /* A credencial não fica armazenada no aparelho. */ }
            token = null;
            throw Object.assign(new Error('Seus dados estão salvos, mas não foi possível guardar a sessão neste aparelho. Tente entrar novamente.'), { code: 'SESSION_STORAGE' });
        }
        token = result.token;
    }
    return result.usuario;
}

export async function restaurarSessao() {
    if (Platform.OS !== 'web') {
        token = await SecureStore.getItemAsync(CHAVE);
        if (!token) return null;
    }
    const tokenConsultado = token;
    try { return (await requisitar('GET', '/me')).usuario; }
    catch (error) {
        if (error.code !== 'UNAUTHENTICATED') throw error;
        if (token === tokenConsultado) await limparSessaoLocal();
        return null;
    }
}

export async function limparSessaoLocal() {
    if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(CHAVE);
    token = null;
}

export const cadastrarUsuario = async data => receberSessao(await requisitar('POST', '/register', data));
export const entrarUsuario = async data => receberSessao(await requisitar('POST', '/login', data));
export const atualizarUsuario = async data => (await requisitar('PATCH', '/me', data)).usuario;
export const alterarSenhaUsuario = async data => receberSessao(await requisitar('POST', '/password', data));
export async function sairUsuario() {
    await requisitar('POST', '/logout');
    await limparSessaoLocal();
}

export const listarMedicoes = async tipo => (await requisitar('GET', '/medicoes?tipo=' + encodeURIComponent(tipo))).medicoes;
export const salvarMedicao = async data => (await requisitar('POST', '/medicoes', data)).medicao;

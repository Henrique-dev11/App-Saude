import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { validarFrutas } from './validarFrutas';
import { prepararFrutas } from './nomesFrutas';
import { falhaDeConexao } from './errosFrutas';

// Guarda apenas respostas reais, por servidor, durante a sessão do aplicativo.
const cache = new Map();

function enderecoApi() {
    const configured = process.env.EXPO_PUBLIC_FRUIT_API_URL;
    if (configured) {
        try {
            const url = new URL(configured);
            if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
            return url.toString();
        } catch {
            throw Object.assign(new Error('O endereço do serviço de frutas está inválido.'), { code: 'FRUIT_CONFIGURATION' });
        }
    }
    if (Platform.OS === 'web') {
        return new URL('/api/fruit/all', window.location.origin).toString();
    }
    if (__DEV__ && Constants.expoConfig?.hostUri) {
        const host = Constants.expoConfig.hostUri;
        const url = new URL(host.includes('://') ? host : 'http://' + host);
        url.pathname = '/api/fruit/all';
        return url.toString();
    }
    throw Object.assign(new Error('O serviço de frutas ainda não foi configurado.'), { code: 'FRUIT_CONFIGURATION' });
}

export async function carregarFrutas(signal, { forcarAtualizacao = false } = {}) {
    const endereco = enderecoApi();
    const url = new URL(endereco);
    if (forcarAtualizacao) url.searchParams.set('refresh', '1');
    try {
        const response = await axios.get(url.toString(), { timeout: 12000, signal });
        const source = response.headers['x-fruit-source'];
        let frutas;
        try { frutas = prepararFrutas(validarFrutas(response.data)); }
        catch { throw Object.assign(new Error('O serviço de frutas retornou dados inválidos. Tente novamente.'), { code: 'FRUIT_INVALID_DATA' }); }
        const avisos = [];
        if (source === 'cache') {
            avisos.push('Sem conexão com o serviço de frutas. Exibindo os dados da última consulta.');
        }
        if (frutas.some(fruta => !fruta.nomePtBr)) {
            avisos.push('Algumas frutas ainda não puderam ser traduzidas e não aparecem na lista.');
        }
        const result = {
            frutas,
            aviso: avisos.join(' '),
            offline: source === 'cache',
            atualizadaEm: response.headers['x-fruit-updated-at'] || null,
        };
        cache.set(endereco, result);
        return result;
    } catch (error) {
        if (signal?.aborted || axios.isCancel(error)) throw error;
        const offline = falhaDeConexao(error) || error.response?.data?.code === 'FRUIT_NETWORK_ERROR';
        if (offline && cache.has(endereco)) {
            return { ...cache.get(endereco), offline: true,
                aviso: 'Sem conexão com o serviço de frutas. Exibindo os dados da última consulta.' };
        }
        if (error.code === 'FRUIT_INVALID_DATA') throw error;
        let message = 'Não foi possível conectar ao serviço de frutas. Tente novamente.';
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.response?.data?.code === 'FRUIT_TIMEOUT') {
            message = 'A consulta de frutas demorou mais que o esperado. Tente novamente.';
        } else if (error.response) {
            message = error.response.data?.code === 'FRUIT_INVALID_DATA'
                ? 'O serviço de frutas retornou dados inválidos. Tente novamente.'
                : 'O serviço de frutas está temporariamente indisponível. Tente novamente.';
        }
        throw Object.assign(new Error(message), { code: offline ? 'FRUIT_NETWORK_ERROR' : 'FRUIT_REQUEST_FAILED' });
    }
}

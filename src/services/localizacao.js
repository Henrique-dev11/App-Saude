import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { coordenadaValida } from './unidadesSaude';

async function comPrazo(operacao) {
    let timer;
    try {
        return await Promise.race([operacao, new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error('A localização demorou para responder. Tente novamente em um local com sinal.')), 20000);
        })]);
    } finally { clearTimeout(timer); }
}

async function pedirPermissao() {
    if (Platform.OS === 'web' && !globalThis.isSecureContext) {
        throw new Error('Abra o app em HTTPS ou localhost para permitir sua localização.');
    }
    // O próprio getCurrentPositionAsync abre a permissão do navegador, inclusive
    // nos navegadores que não implementam navigator.permissions.query.
    if (Platform.OS === 'web') return;
    const permissao = await comPrazo(Location.requestForegroundPermissionsAsync());
    if (permissao.status !== 'granted' || permissao.granted === false) {
        throw new Error('Localização não autorizada. Você pode continuar consultando as 10 UBS ou liberar o acesso nas configurações.');
    }
}

export async function obterLocalizacao() {
    await pedirPermissao();
    if (!await Location.hasServicesEnabledAsync()) {
        throw new Error('Ative a localização do aparelho e tente novamente.');
    }
    try {
        const resultado = await comPrazo(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
        if (!coordenadaValida(resultado.coords)) throw new Error();
        return { latitude: resultado.coords.latitude, longitude: resultado.coords.longitude,
            precisao: resultado.coords.accuracy };
    } catch (error) {
        if (error.message?.startsWith('A localização demorou')) throw error;
        if (Platform.OS === 'web' && error.code === 1) {
            throw new Error('Localização não autorizada. Libere o acesso nas configurações do navegador ou continue consultando as 10 UBS.');
        }
        throw new Error('Não foi possível obter sua posição. Verifique o sinal e tente novamente.');
    }
}

// O geocodificador nativo demonstrado nos slides existe somente no Android/iOS.
// No navegador, a tela oferece a pesquisa de endereços diretamente no Google Maps.
export async function buscarEnderecoNativo(endereco) {
    if (Platform.OS === 'android') await pedirPermissao();
    const resultados = await comPrazo(Location.geocodeAsync(endereco.trim()));
    const ponto = resultados.find(coordenadaValida);
    if (!ponto) throw new Error('Endereço não encontrado. Inclua rua, número e cidade.');
    return { latitude: ponto.latitude, longitude: ponto.longitude, nome: endereco.trim() };
}

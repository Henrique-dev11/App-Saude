const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const { runInNewContext } = require('node:vm');
const { transformSync } = require('@babel/core');
const filename = require.resolve('../src/services/localizacao.js');
const requireService = createRequire(filename);
const { code } = transformSync(readFileSync(filename, 'utf8'), { filename, configFile: false, babelrc: false,
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')] });

function servico(location, os = 'android', seguro = true) {
    const module = { exports: {} };
    runInNewContext(code, { module, exports: module.exports, isSecureContext: seguro, setTimeout, clearTimeout,
        require: name => name === 'react-native' ? { Platform: { OS: os } } : name === 'expo-location' ? location : requireService(name) });
    return module.exports;
}
const coords = { latitude: -23.55, longitude: -46.63, accuracy: 30 };
const location = () => ({
    requestForegroundPermissionsAsync: async () => ({ status: 'granted', granted: true }),
    hasServicesEnabledAsync: async () => true,
    getCurrentPositionAsync: async () => ({ coords }),
    Accuracy: { Balanced: 3 },
});

test('Consulta somente após permissão nativa e preserva latitude, longitude e precisão reais', async () => {
    const api = location();
    const chamadas = [];
    api.requestForegroundPermissionsAsync = async () => { chamadas.push('permissao'); return { status: 'granted' }; };
    api.getCurrentPositionAsync = async () => { chamadas.push('posicao'); return { coords }; };
    const ponto = await servico(api).obterLocalizacao();
    assert.deepEqual(chamadas, ['permissao', 'posicao']);
    assert.equal(ponto.latitude, coords.latitude);
    assert.equal(ponto.longitude, coords.longitude);
    assert.equal(ponto.precisao, 30);
});

test('Permissão negada não solicita posição nem substitui a localização por coordenadas fictícias', async () => {
    const api = location();
    api.requestForegroundPermissionsAsync = async () => ({ status: 'denied' });
    api.getCurrentPositionAsync = () => assert.fail('GPS não deveria ser consultado');
    await assert.rejects(servico(api).obterLocalizacao(), /não autorizada/);
});

test('GPS desativado e falhas de sinal geram mensagens recuperáveis', async () => {
    const api = location();
    api.hasServicesEnabledAsync = async () => false;
    await assert.rejects(servico(api).obterLocalizacao(), /Ative a localização/);
    api.hasServicesEnabledAsync = async () => true;
    api.getCurrentPositionAsync = async () => { throw new Error('offline'); };
    await assert.rejects(servico(api).obterLocalizacao(), /Verifique o sinal/);
});

test('Web usa a permissão do próprio navegador e exige HTTPS ou localhost', async () => {
    const api = location();
    api.requestForegroundPermissionsAsync = () => assert.fail('Não depender de navigator.permissions no navegador');
    assert.equal((await servico(api, 'web').obterLocalizacao()).latitude, coords.latitude);
    await assert.rejects(servico(api, 'web', false).obterLocalizacao(), /HTTPS ou localhost/);
    api.getCurrentPositionAsync = async () => { throw { code: 1 }; };
    await assert.rejects(servico(api, 'web').obterLocalizacao(), /não autorizada/);
});

test('Geocodificação no Android pede permissão e transforma endereço em um marcador real', async () => {
    const api = location();
    api.geocodeAsync = async endereco => { assert.equal(endereco, 'Rua Humaitá, São Paulo'); return [coords]; };
    const ponto = await servico(api).buscarEnderecoNativo(' Rua Humaitá, São Paulo ');
    assert.equal(ponto.latitude, coords.latitude);
    assert.equal(ponto.nome, 'Rua Humaitá, São Paulo');
    api.geocodeAsync = async () => [];
    await assert.rejects(servico(api).buscarEnderecoNativo('rua inexistente'), /Endereço não encontrado/);
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const { runInNewContext } = require('node:vm');
const { transformSync } = require('@babel/core');
const fruits = require('../src/data/frutas.json');
const { filtrarFrutasPorNome } = require('../src/services/nomesFrutas');

// Executa o serviço real com os módulos nativos e a rede controlados pelo teste.
const filename = require.resolve('../src/services/frutas.js');
const requireService = createRequire(filename);
const { code } = transformSync(readFileSync(filename, 'utf8'), {
    filename, configFile: false, babelrc: false,
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
});

function service({ os = 'web', hostUri, configured, dev = true, getImpl } = {}) {
    const module = { exports: {} };
    runInNewContext(code, {
        module, exports: module.exports,
        require: name => {
            if (name === 'axios') return { get: getImpl, isCancel: error => error.code === 'ERR_CANCELED' };
            if (name === 'react-native') return { Platform: { OS: os } };
            if (name === 'expo-constants') return { expoConfig: { hostUri } };
            return requireService(name);
        },
        URL, __DEV__: dev,
        process: { env: { EXPO_PUBLIC_FRUIT_API_URL: configured } },
        window: { location: { origin: 'http://localhost:8082' } },
    });
    return module.exports.carregarFrutas;
}

for (const [name, options, expectedUrl] of [
    ['web', {}, 'http://localhost:8082/api/fruit/all'],
    ['Android no Expo', { os: 'android', hostUri: '192.168.0.10:8081' }, 'http://192.168.0.10:8081/api/fruit/all'],
    ['iOS no Expo', { os: 'ios', hostUri: '192.168.0.20:8081' }, 'http://192.168.0.20:8081/api/fruit/all'],
    ['outra porta', { os: 'android', hostUri: '192.168.0.10:8084' }, 'http://192.168.0.10:8084/api/fruit/all'],
    ['túnel HTTPS', { os: 'android', hostUri: 'https://example.exp.direct' }, 'https://example.exp.direct/api/fruit/all'],
    ['servidor configurado', { os: 'android', configured: 'https://example.com/api/fruit/all', dev: false }, 'https://example.com/api/fruit/all'],
]) {
    test('Cliente consulta o servidor e pesquisa em português: ' + name, async () => {
        let requests = 0;
        const controller = new AbortController();
        const carregar = service({ ...options, getImpl: async (url, config) => {
            requests++;
            assert.equal(url, expectedUrl);
            assert.equal(config.timeout, 12000);
            assert.equal(config.signal, controller.signal);
            return { data: fruits, headers: {} };
        } });
        const result = await carregar(controller.signal);
        assert.equal(requests, 1);
        assert.equal(result.aviso, '');
        assert.deepEqual(filtrarFrutasPorNome(result.frutas, 'maca').map(fruta => fruta.nomePtBr), ['Maçã', 'Maçã verde']);
    });
}

for (const [name, getImpl] of [
    ['falha de rede', async () => { throw Object.assign(new Error('offline'), { code: 'ERR_NETWORK' }); }],
    ['timeout', async () => { throw Object.assign(new Error('timeout'), { code: 'ECONNABORTED' }); }],
    ['resposta inválida', async () => ({ data: { error: 'invalid' }, headers: {} })],
]) {
    test('Cliente informa erro sem substituir por dados embutidos após ' + name, async () => {
        await assert.rejects(service({ getImpl })(), /serviço de frutas|consulta de frutas/);
    });
}

test('Aplicativo publicado sem servidor configurado informa o problema de configuração', async () => {
    await assert.rejects(service({ os: 'android', dev: false,
        getImpl: () => assert.fail('Não deve consultar um servidor de desenvolvimento') })(),
    error => error.code === 'FRUIT_CONFIGURATION');
});

test('Cliente informa falhas de atualização e tradução sem exibir nomes originais', async () => {
    const result = await service({ getImpl: async () => ({
        data: [...fruits, { ...fruits[0], id: 999, name: 'Unknown fruit', nomePtBr: null }],
        headers: { 'x-fruit-source': 'cache', 'x-fruit-translation': 'fallback' },
    }) })();
    assert.match(result.aviso, /Sem conexão/);
    assert.match(result.aviso, /não aparecem na lista/);
    assert.deepEqual(filtrarFrutasPorNome(result.frutas, 'Unknown'), []);
});

test('Tradução local válida não provoca aviso de falha em uma consulta bem-sucedida', async () => {
    const result = await service({ getImpl: async () => ({ data: fruits,
        headers: { 'x-fruit-source': 'api', 'x-fruit-translation': 'fallback' } }) })();
    assert.equal(result.aviso, '');
    assert.equal(result.offline, false);
});

test('Cache offline contém a última resposta real e a recuperação substitui esses dados', async () => {
    let requests = 0;
    const banana = fruits.find(fruta => fruta.name === 'Banana');
    const carregar = service({ getImpl: async url => {
        requests++;
        if (requests === 2) throw Object.assign(new Error('offline'), { code: 'ERR_NETWORK' });
        if (requests === 3) assert.equal(new URL(url).searchParams.get('refresh'), '1');
        return { data: [{ ...banana, nutritions: { calories: requests === 1 ? 123 : 456 } }], headers: {} };
    } });
    const online = await carregar();
    assert.equal(online.frutas[0].nutritions.calories, 123);
    const offline = await carregar();
    assert.equal(offline.frutas[0].nutritions.calories, 123);
    assert.equal(offline.offline, true);
    const recovered = await carregar(undefined, { forcarAtualizacao: true });
    assert.equal(recovered.frutas[0].nutritions.calories, 456);
    assert.equal(recovered.offline, false);
    assert.equal(recovered.aviso, '');
});

for (const [name, failure] of [
    ['HTTP 500', Object.assign(new Error('HTTP 500'), { response: { status: 500, data: {} } })],
    ['timeout', Object.assign(new Error('timeout'), { code: 'ECONNABORTED' })],
]) {
    test('Cache prévio não oculta ' + name, async () => {
        let requests = 0;
        const carregar = service({ getImpl: async () => {
            if (requests++ > 0) throw failure;
            return { data: fruits, headers: {} };
        } });
        await carregar();
        await assert.rejects(carregar(), /Tente novamente/);
    });
}

test('Cancelamento da requisição é propagado ao componente', async () => {
    const controller = new AbortController();
    controller.abort();
    const error = new Error('canceled');
    error.code = 'ERR_CANCELED';
    const carregar = service({ getImpl: async () => { throw error; } });
    await assert.rejects(carregar(controller.signal), thrown => thrown === error);
});

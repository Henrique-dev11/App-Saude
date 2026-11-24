const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { transformSync } = require('@babel/core');

const { code } = transformSync(readFileSync(require.resolve('../src/services/autenticacao.js'), 'utf8'), {
    configFile: false, babelrc: false, plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
});
const usuario = { id: 'id-teste', nome: 'Ana Silva', email: 'ana@example.com' };

function service({ os = 'web', request, savedToken = null, storeFails = false } = {}) {
    const module = { exports: {} };
    const armazenamento = new Map(savedToken ? [['app-saude.sessao.v1', savedToken]] : []);
    runInNewContext(code, { module, exports: module.exports, URL, __DEV__: true,
        process: { env: {} }, window: { location: { origin: 'http://localhost:8082' } },
        require: name => {
            if (name === 'axios') return request;
            if (name === 'react-native') return { Platform: { OS: os } };
            if (name === 'expo-constants') return { expoConfig: { hostUri: '192.168.0.10:8081' } };
            if (name === 'expo-secure-store') return {
                WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
                getItemAsync: async key => armazenamento.get(key) || null,
                setItemAsync: async (key, value) => { if (storeFails) throw new Error('disk full'); armazenamento.set(key, value); },
                deleteItemAsync: async key => { armazenamento.delete(key); },
            };
            throw new Error(name);
        },
    });
    return { auth: module.exports, armazenamento };
}

test('Web usa cookies com credenciais e não grava tokens ou senhas no armazenamento local', async () => {
    const requests = [];
    const { auth, armazenamento } = service({ request: async config => {
        requests.push(config);
        return { data: config.url.endsWith('/logout') ? { ok: true } : { usuario } };
    } });
    await auth.entrarUsuario({ email: usuario.email, senha: 'Exemplo123' });
    assert.equal((await auth.restaurarSessao()).id, usuario.id);
    await auth.sairUsuario();
    assert.equal(armazenamento.size, 0);
    assert.ok(requests.every(req => req.withCredentials && !req.headers.Authorization));
    assert.equal(requests[0].url, 'http://localhost:8082/api/auth/login');
});

test('Celular restaura token protegido, usa Bearer e apaga a credencial ao sair', async () => {
    const requests = [];
    const { auth, armazenamento } = service({ os: 'android', savedToken: 'token-seguro', request: async config => {
        requests.push(config);
        return { data: config.url.endsWith('/logout') ? { ok: true } : { usuario } };
    } });
    assert.equal((await auth.restaurarSessao()).nome, usuario.nome);
    assert.equal(requests[0].headers.Authorization, 'Bearer token-seguro');
    assert.equal(requests[0].url, 'http://192.168.0.10:8081/api/auth/me');
    await auth.sairUsuario();
    assert.equal(armazenamento.size, 0);
});

test('Falha de conexão não apaga a sessão nativa ou transforma erro em usuário fictício', async () => {
    const { auth, armazenamento } = service({ os: 'ios', savedToken: 'token-seguro', request: async () => { throw new Error('offline'); } });
    await assert.rejects(auth.restaurarSessao(), /Verifique sua conexão/);
    assert.equal(armazenamento.get('app-saude.sessao.v1'), 'token-seguro');
});

test('Sessão inválida é descartada; resposta HTML não é aceita como autenticação', async () => {
    const invalid = service({ os: 'android', savedToken: 'token-antigo', request: async () => {
        throw { response: { data: { code: 'UNAUTHENTICATED', error: 'Sessão expirada.' } } };
    } });
    assert.equal(await invalid.auth.restaurarSessao(), null);
    assert.equal(invalid.armazenamento.size, 0);
    const html = service({ request: async () => ({ data: '<html></html>' }) });
    await assert.rejects(html.auth.restaurarSessao(), /resposta inválida/);
});

test('Não anuncia login persistente se o armazenamento seguro falhar', async () => {
    let saiu = false;
    const { auth, armazenamento } = service({ os: 'android', storeFails: true, request: async config => {
        if (config.url.endsWith('/logout')) { saiu = true; return { data: { ok: true } }; }
        return { data: { usuario, token: 'token-recebido' } };
    } });
    await assert.rejects(auth.entrarUsuario({ email: usuario.email, senha: 'Exemplo123' }), error => error.code === 'SESSION_STORAGE');
    assert.equal(saiu, true);
    assert.equal(armazenamento.size, 0);
});

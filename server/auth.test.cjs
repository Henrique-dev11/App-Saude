const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { createAuthHandler } = require('./auth.cjs');

async function api(run, options = {}) {
    const handler = createAuthHandler({ databasePath: ':memory:', ...options });
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const base = 'http://127.0.0.1:' + server.address().port;
    try { await run(base); }
    finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); handler.close(); }
}
const data = { nome: 'João Silva', email: 'joao@example.com', senha: 'Cadastro123', confirmarSenha: 'Cadastro123',
    idade: 35, tipoSanguineo: 'O+', peso: 80, altura: 180 };

test('Cookie web é HttpOnly, restaura sessão, atualiza perfil e encerra a sessão', async () => {
    await api(async base => {
        const register = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify({ ...data, tipoAlergia: 'Dipirona' }) });
        assert.equal(register.status, 201);
        const body = await register.json();
        assert.equal(body.usuario.nome, 'João Silva');
        assert.equal(body.usuario.tipoAlergia, 'Dipirona');
        assert.equal(body.token, undefined);
        const cookie = register.headers.get('set-cookie');
        assert.match(cookie, /HttpOnly/);
        assert.match(cookie, /SameSite=Lax/);
        assert.match(cookie, /Max-Age=2592000/);
        const headers = { Cookie: cookie.split(';')[0], 'Content-Type': 'application/json', Origin: base };
        const me = await fetch(base + '/api/auth/me', { headers });
        assert.equal(me.status, 200);
        assert.equal(me.headers.get('cache-control'), 'no-store');
        const perfilRestaurado = (await me.json()).usuario;
        assert.equal(perfilRestaurado.email, data.email);
        assert.equal(perfilRestaurado.tipoAlergia, 'Dipirona');
        const { id, ...fields } = body.usuario;
        const updated = await fetch(base + '/api/auth/me', { method: 'PATCH', headers, body: JSON.stringify({ ...fields, nome: 'João Souza' }) });
        assert.equal(updated.status, 200);
        assert.equal((await updated.json()).usuario.nome, 'João Souza');
        const out = await fetch(base + '/api/auth/logout', { method: 'POST', headers });
        assert.equal(out.status, 200);
        assert.match(out.headers.get('set-cookie'), /Max-Age=0/);
        assert.equal((await fetch(base + '/api/auth/me', { headers })).status, 401);
    });
});

test('Cliente nativo recebe credencial opaca e acessa apenas o seu perfil', async () => {
    await api(async base => {
        const response = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-App-Client': 'native' }, body: JSON.stringify(data) });
        const body = await response.json();
        assert.match(body.token, /^[A-Za-z0-9_-]{43}$/);
        const me = await fetch(base + '/api/auth/me', { headers: { Authorization: 'Bearer ' + body.token } });
        assert.equal((await me.json()).usuario.email, data.email);
        assert.equal((await fetch(base + '/api/auth/me?id=' + body.usuario.id)).status, 401);
    });
});

test('Bloqueia origens externas, formulários não JSON e atualizações sem autenticação', async () => {
    await api(async base => {
        const denied = await fetch(base + '/api/auth/register', { method: 'POST', headers: { Origin: 'https://invasor.example', 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        assert.equal(denied.status, 403);
        assert.equal(denied.headers.get('access-control-allow-origin'), null);
        const form = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{}' });
        assert.equal(form.status, 415);
        assert.equal((await fetch(base + '/api/auth/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })).status, 401);
    });
});

test('Cookie de produção usa Secure; limite de tentativas evita força bruta', async () => {
    await api(async base => {
        const registered = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        assert.match(registered.headers.get('set-cookie'), /; Secure/);
        for (let i = 0; i < 29; i++) await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{}' });
        const blocked = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        assert.equal(blocked.status, 429);
    }, { secureCookie: true });
});

test('API de medições salva registros autenticados e não aceita acessar outra conta', async () => {
    await api(async base => {
        async function register(email) {
            const res = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-App-Client': 'native' }, body: JSON.stringify({ ...data, email }) });
            return res.json();
        }
        const a = await register('medicoes-a@example.com');
        const b = await register('medicoes-b@example.com');
        const headers = { Authorization: 'Bearer ' + a.token, 'Content-Type': 'application/json' };
        const medicao = { tipo: 'glicemia', valor: 95, contexto: 'Em jejum', data: '2026-01-01T10:00:00Z' };
        const saved = await fetch(base + '/api/auth/medicoes', { method: 'POST', headers, body: JSON.stringify(medicao) });
        assert.equal(saved.status, 201);
        assert.equal((await saved.json()).medicao.valor, 95);
        const read = await fetch(base + '/api/auth/medicoes?tipo=glicemia', { headers });
        assert.equal(read.status, 200);
        assert.equal(read.headers.get('cache-control'), 'no-store');
        const body = await read.json();
        assert.equal(body.medicoes.length, 1); assert.equal(body.usuario.id, a.usuario.id);
        const other = await fetch(base + '/api/auth/medicoes?tipo=glicemia&usuario_id=' + a.usuario.id, { headers: { Authorization: 'Bearer ' + b.token } });
        assert.deepEqual((await other.json()).medicoes, []);
        assert.equal((await fetch(base + '/api/auth/medicoes?tipo=glicemia')).status, 401);
        assert.equal((await fetch(base + '/api/auth/medicoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(medicao) })).status, 401);
        const invalid = await fetch(base + '/api/auth/medicoes', { method: 'POST', headers, body: JSON.stringify({ ...medicao, valor: '95' }) });
        assert.equal(invalid.status, 400);
        assert.equal((await (await fetch(base + '/api/auth/medicoes?tipo=glicemia', { headers })).json()).medicoes.length, 1);
    });
});

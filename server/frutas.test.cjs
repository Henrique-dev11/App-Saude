const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createFruitServer } = require('./index.cjs');
const { validarFrutas } = require('../src/services/validarFrutas');
const fruits = require('../src/data/frutas.json');
const { prepararFrutas, nomeLocal, filtrarFrutasPorNome } = require('../src/services/nomesFrutas');

async function withServer(fetchImpl, run, options = {}) {
    const server = createFruitServer({ fetchImpl, ...options });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    try { await run('http://127.0.0.1:' + server.address().port); }
    finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}

test('API entrega frutas válidas, CORS e reutiliza cache', async () => {
    let requests = 0;
    let translationRequests = 0;
    await withServer(async url => {
        if (url.startsWith('https://api.mymemory.translated.net/')) {
            translationRequests++;
            return { ok: true, json: async () => ({ responseStatus: 200,
                responseData: { translatedText: fruits.map(fruta => nomeLocal(fruta.name)).join('\n') } }) };
        }
        requests++;
        return { ok: true, json: async () => fruits };
    }, async base => {
        const response = await fetch(base + '/api/fruit/all');
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('access-control-allow-origin'), '*');
        assert.equal(response.headers.get('x-fruit-source'), 'api');
        assert.match(response.headers.get('access-control-expose-headers'), /X-Fruit-Translation/);
        assert.equal(response.headers.get('x-fruit-translation'), 'api');
        const data = await response.json();
        assert.deepEqual(data, prepararFrutas(fruits));
        assert.equal(data.find(fruta => fruta.name === 'Apple').nomePtBr, 'Maçã');
        assert.deepEqual(filtrarFrutasPorNome(data, 'maca').map(fruta => fruta.nomePtBr), ['Maçã', 'Maçã verde']);
        assert.equal((await fetch(base + '/api/fruit/all')).headers.get('x-fruit-translation'), 'cache');
        assert.equal(requests, 1);
        assert.equal(translationRequests, 1);
        assert.equal((await fetch(base + '/inexistente')).status, 404);
        assert.equal((await fetch(base + '/api/fruit/all', { method: 'POST' })).status, 405);
        assert.equal((await fetch(base + '/api/fruit/all', { method: 'OPTIONS' })).status, 204);
    });
});

for (const [name, upstream, status, code] of [
    ['rede indisponível', async () => { throw Object.assign(new Error('offline'), { cause: { code: 'ENETUNREACH' } }); }, 503, 'FRUIT_NETWORK_ERROR'],
    ['HTTP 500', async () => ({ ok: false }), 503, 'FRUIT_UPSTREAM_HTTP'],
    ['resposta inválida', async () => ({ ok: true, json: async () => ({ error: 'invalid' }) }), 502, 'FRUIT_INVALID_DATA'],
    ['timeout', async () => { throw new DOMException('timeout', 'TimeoutError'); }, 503, 'FRUIT_TIMEOUT'],
]) {
    test('Informa erro real, sem usar catálogo embutido, quando ocorre ' + name, async () => {
        await withServer(upstream, async base => {
            const response = await fetch(base + '/api/fruit/all');
            assert.equal(response.status, status);
            assert.equal((await response.json()).code, code);
            assert.equal(response.headers.get('x-fruit-source'), null);
        });
    });
}

test('Rejeita listas vazias, IDs repetidos e valores nutricionais inválidos', () => {
    for (const data of [[], {}, [fruits[0], fruits[0]],
        [{ ...fruits[0], nutritions: { ...fruits[0].nutritions, sugar: '10' } }]]) {
        assert.throws(() => validarFrutas(data));
    }
    assert.equal(validarFrutas(fruits), fruits);
});

test('Mantém frutas da API quando só a tradução falha', async () => {
    let translationRequests = 0;
    await withServer(async url => {
        if (url.includes('mymemory')) {
            translationRequests++;
            throw new Error('Tradução offline');
        }
        return { ok: true, json: async () => fruits };
    }, async base => {
        const response = await fetch(base + '/api/fruit/all');
        assert.equal(response.headers.get('x-fruit-source'), 'api');
        assert.equal(response.headers.get('x-fruit-translation'), 'fallback');
        assert.deepEqual(await response.json(), prepararFrutas(fruits));
        await fetch(base + '/api/fruit/all');
        assert.equal(translationRequests, 1);
    });
});

test('Reutiliza dados anteriores quando a Fruityvice falha após expirar o cache', async () => {
    let time = 0;
    let requests = 0;
    const subset = fruits.filter(fruta => ['Apple', 'Banana'].includes(fruta.name));
    await withServer(async url => {
        if (url.includes('mymemory')) return { ok: false };
        if (requests++) throw Object.assign(new Error('offline'), { cause: { code: 'ENETUNREACH' } });
        return { ok: true, json: async () => subset };
    }, async base => {
        await fetch(base + '/api/fruit/all');
        time += 60 * 60 * 1000 + 1;
        const response = await fetch(base + '/api/fruit/all');
        assert.equal(response.headers.get('x-fruit-source'), 'cache');
        assert.deepEqual(await response.json(), prepararFrutas(subset));
    }, { now: () => time });
});

test('Aceita dados nutricionais parciais ou ausentes sem preencher valores', () => {
    const data = [
        { id: 1, name: 'Banana', nutritions: { calories: 96, fat: null } },
        { id: 6, name: 'Apple', nutritions: null },
    ];
    assert.equal(validarFrutas(data), data);
    assert.equal(data[0].nutritions.fat, null);
    assert.equal(data[0].nutritions.sugar, undefined);
});

test('Tentar novamente ignora o cache positivo e volta ao provedor imediatamente', async () => {
    let requests = 0;
    const apple = fruits.find(fruta => fruta.name === 'Apple');
    await withServer(async url => {
        if (url.includes('mymemory')) return { ok: false };
        requests++;
        return { ok: true, json: async () => [{ ...apple, nutritions: { ...apple.nutritions, calories: 100 + requests } }] };
    }, async base => {
        const first = await fetch(base + '/api/fruit/all');
        assert.ok(first.headers.get('x-fruit-updated-at'));
        assert.equal((await first.json())[0].nutritions.calories, 101);
        await fetch(base + '/api/fruit/all');
        assert.equal(requests, 1);
        const updated = await fetch(base + '/api/fruit/all?refresh=1');
        assert.equal((await updated.json())[0].nutritions.calories, 102);
        assert.equal(requests, 2);
        assert.equal(updated.headers.get('cache-control'), 'no-store');
    });
});

test('Falha inicial não fica presa no cache; nova tentativa recupera os dados reais', async () => {
    let requests = 0;
    await withServer(async url => {
        if (url.includes('mymemory')) return { ok: false };
        if (requests++ === 0) throw Object.assign(new Error('offline'), { cause: { code: 'ENETUNREACH' } });
        return { ok: true, json: async () => fruits };
    }, async base => {
        assert.equal((await fetch(base + '/api/fruit/all')).status, 503);
        const recovered = await fetch(base + '/api/fruit/all?refresh=1');
        assert.equal(recovered.status, 200);
        assert.equal(recovered.headers.get('x-fruit-source'), 'api');
        assert.equal((await recovered.json()).length, fruits.length);
        assert.equal(requests, 2);
    });
});

test('HTTP 500 não é ocultado pelo cache de uma consulta anterior', async () => {
    let requests = 0;
    await withServer(async url => {
        if (url.includes('mymemory')) return { ok: false };
        return requests++ === 0 ? { ok: true, json: async () => fruits } : { ok: false };
    }, async base => {
        await fetch(base + '/api/fruit/all');
        const response = await fetch(base + '/api/fruit/all?refresh=1');
        assert.equal(response.status, 503);
        assert.equal((await response.json()).code, 'FRUIT_UPSTREAM_HTTP');
    });
});

test('O handler pode ser montado junto ao Expo sem abrir uma segunda porta', async () => {
    const { createFruitHandler } = require('./index.cjs');
    const http = require('node:http');
    const handler = createFruitHandler({ fetchImpl: async url => url.includes('mymemory')
        ? { ok: false } : { ok: true, json: async () => fruits } });
    const server = http.createServer((req, res) => {
        if (req.url === '/api/fruit/all') return handler(req, res);
        res.end('Expo');
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    try {
        const base = 'http://127.0.0.1:' + server.address().port;
        assert.equal(await (await fetch(base)).text(), 'Expo');
        const data = await (await fetch(base + '/api/fruit/all')).json();
        assert.equal(data.find(fruta => fruta.name === 'Banana').nutritions.calories, 96);
    } finally {
        server.closeAllConnections();
        await new Promise(resolve => server.close(resolve));
    }
});

test('Requisições simultâneas compartilham as consultas externas', async () => {
    let requests = 0;
    let translationRequests = 0;
    await withServer(async url => {
        await new Promise(resolve => setTimeout(resolve, 15));
        if (url.includes('mymemory')) {
            translationRequests++;
            return { ok: true, json: async () => ({ responseStatus: 200,
                responseData: { translatedText: 'Maçã' } }) };
        }
        requests++;
        return { ok: true, json: async () => [fruits.find(fruta => fruta.name === 'Apple')] };
    }, async base => {
        const responses = await Promise.all(Array.from({ length: 5 }, () => fetch(base + '/api/fruit/all')));
        for (const response of responses) {
            assert.equal(response.status, 200);
            assert.equal((await response.json())[0].nomePtBr, 'Maçã');
        }
        assert.equal(requests, 1);
        assert.equal(translationRequests, 1);
    });
});

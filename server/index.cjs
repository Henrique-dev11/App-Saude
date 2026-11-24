const http = require('node:http');
const { validarFrutas } = require('../src/services/validarFrutas');
const { createFruitTranslator } = require('./traduzirFrutas.cjs');
const { falhaDeConexao } = require('../src/services/errosFrutas');

function createFruitHandler({ fetchImpl = fetch, now = Date.now } = {}) {
    const traduzirFrutas = createFruitTranslator({ fetchImpl, now });
    let cache;
    let expires = 0;
    let updatedAt;
    let pending;
    async function load(refresh) {
        if (!refresh && cache && now() < expires) return { fruits: cache, source: 'api' };
        if (!pending) {
            pending = (async () => {
                try {
                    const response = await fetchImpl('https://www.fruityvice.com/api/fruit/all', {
                        signal: AbortSignal.timeout(6000),
                    });
                    if (!response.ok) throw Object.assign(new Error('API indisponível'), { code: 'FRUIT_UPSTREAM_HTTP', status: 503 });
                    let fruits;
                    try { fruits = validarFrutas(await response.json()); }
                    catch { throw Object.assign(new Error('Dados inválidos'), { code: 'FRUIT_INVALID_DATA', status: 502 }); }
                    cache = fruits;
                    updatedAt = new Date(now()).toISOString();
                    expires = now() + 60 * 60 * 1000;
                    return { fruits: cache, source: 'api' };
                } catch (error) {
                    expires = 0;
                    // Só reutiliza dados efetivamente obtidos da API em falhas de conexão.
                    if (falhaDeConexao(error) && cache) return { fruits: cache, source: 'cache' };
                    if (typeof error.code === 'string' && error.code.startsWith('FRUIT_')) throw error;
                    throw Object.assign(new Error('Falha ao consultar as frutas'), {
                        code: falhaDeConexao(error) ? 'FRUIT_NETWORK_ERROR' : 'FRUIT_TIMEOUT', status: 503,
                    });
                }
            })();
        }
        try { return await pending; }
        finally { pending = undefined; }
    }
    return async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Expose-Headers', 'X-Fruit-Source, X-Fruit-Translation, X-Fruit-Updated-At');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        if (req.method !== 'GET') { res.writeHead(405); res.end(JSON.stringify({ error: 'Método não permitido' })); return; }
        if (req.url?.split('?')[0] !== '/api/fruit/all') {
            res.writeHead(404); res.end(JSON.stringify({ error: 'Rota não encontrada' })); return;
        }
        try {
            const refresh = new URL(req.url, 'http://localhost').searchParams.get('refresh') === '1';
            const { fruits, source } = await load(refresh);
            const translated = await traduzirFrutas(fruits, { refresh });
            res.setHeader('X-Fruit-Source', source);
            res.setHeader('X-Fruit-Translation', translated.translationSource);
            res.setHeader('X-Fruit-Updated-At', updatedAt);
            res.end(JSON.stringify(translated.fruits));
        } catch (error) {
            res.writeHead(error.status || 503);
            res.end(JSON.stringify({ error: 'Não foi possível carregar as frutas.', code: error.code || 'FRUIT_UNAVAILABLE' }));
        }
    };
}

function createFruitServer(options) {
    return http.createServer(createFruitHandler(options));
}

if (require.main === module) {
    const auth = require('./auth.cjs').createAuthHandler();
    const fruits = createFruitHandler();
    const server = http.createServer((req, res) => req.url?.startsWith('/api/auth/') ? auth(req, res) : fruits(req, res));
    server.on('close', () => auth.close());
    server.on('error', error => { console.error('Não foi possível iniciar a API:', error.message); process.exitCode = 1; });
    server.listen(Number(process.env.PORT || 3001), '0.0.0.0', () =>
        console.log('API de frutas: http://localhost:' + server.address().port + '/api/fruit/all'));
}
module.exports = { createFruitServer, createFruitHandler };

const { createUserStore, DURACAO_SESSAO } = require('./usuarios.cjs');

function readJson(req) {
    if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
        throw Object.assign(new Error('Envie os dados em formato JSON.'), { status: 415 });
    }
    return new Promise((resolve, reject) => {
        const chunks = [];
        let length = 0;
        let failed = false;
        req.on('data', chunk => {
            if (failed) return;
            length += chunk.length;
            if (length > 3 * 1024 * 1024) {
                failed = true;
                chunks.length = 0;
                reject(Object.assign(new Error('Os dados enviados excedem o limite. Use uma foto com até 2 MB.'), { status: 413 }));
            } else chunks.push(chunk);
        });
        req.on('end', () => {
            if (failed) return;
            try {
                const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
                if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
                resolve(data);
            } catch { reject(Object.assign(new Error('Os dados enviados estão inválidos.'), { status: 400 })); }
        });
        req.on('error', reject);
    });
}

function createAuthHandler(options = {}) {
    const store = createUserStore(options);
    const allowedOrigins = options.allowedOrigins || (process.env.AUTH_ALLOWED_ORIGINS || '').split(',').filter(Boolean);
    const secureCookie = options.secureCookie ?? process.env.AUTH_COOKIE_SECURE === 'true';
    const attempts = new Map();
    const now = options.now || Date.now;
    function cookie(res, token) {
        res.setHeader('Set-Cookie', 'saude_session=' + token + '; Path=/api/auth; HttpOnly; SameSite=Lax; Max-Age=' +
            (token ? DURACAO_SESSAO / 1000 : 0) + (secureCookie ? '; Secure' : ''));
    }
    function tokenFrom(req) {
        const bearer = /^Bearer ([A-Za-z0-9_-]+)$/.exec(req.headers.authorization || '');
        if (bearer) return bearer[1];
        return (req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith('saude_session='))?.slice(14);
    }
    function sessao(req, res, result) {
        cookie(res, result.token);
        return req.headers['x-app-client'] === 'native' ? result : { usuario: result.usuario };
    }
    const handler = async (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Vary', 'Origin');
        const origin = req.headers.origin;
        try {
            const sameHost = origin && [
                'http://' + req.headers.host, 'https://' + req.headers.host,
            ].includes(origin);
            if (origin && !sameHost && !allowedOrigins.includes(origin)) {
                throw Object.assign(new Error('Origem da requisição não permitida.'), { status: 403 });
            }
            if (origin) {
                res.setHeader('Access-Control-Allow-Origin', origin);
                res.setHeader('Access-Control-Allow-Credentials', 'true');
            }
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-App-Client');
            if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
            const path = req.url?.split('?')[0];
            if (['/api/auth/register', '/api/auth/login', '/api/auth/password'].includes(path) && req.method === 'POST') {
                const key = req.socket.remoteAddress;
                let entry = attempts.get(key);
                if (!entry || entry.until <= now()) { entry = { count: 0, until: now() + 15 * 60 * 1000 }; attempts.set(key, entry); }
                if (++entry.count > 30) throw Object.assign(new Error('Muitas tentativas. Aguarde alguns minutos e tente novamente.'), { status: 429 });
                if (attempts.size > 1000) for (const [ip, item] of attempts) if (item.until <= now()) attempts.delete(ip);
            }
            let body;
            let status = 200;
            if (req.method === 'POST' && path === '/api/auth/register') {
                body = sessao(req, res, await store.cadastrar(await readJson(req)));
                status = 201;
            } else if (req.method === 'POST' && path === '/api/auth/login') {
                body = sessao(req, res, await store.entrar(await readJson(req)));
            } else if (req.method === 'GET' && path === '/api/auth/me') {
                body = { usuario: store.perfil(tokenFrom(req)) };
            } else if (req.method === 'PATCH' && path === '/api/auth/me') {
                // A identidade sempre vem da sessão, nunca de um ID enviado pelo cliente.
                store.perfil(tokenFrom(req));
                body = { usuario: store.atualizar(tokenFrom(req), await readJson(req)) };
            } else if (req.method === 'POST' && path === '/api/auth/password') {
                store.perfil(tokenFrom(req));
                body = sessao(req, res, await store.alterarSenha(tokenFrom(req), await readJson(req)));
            } else if (req.method === 'GET' && path === '/api/auth/medicoes') {
                const token = tokenFrom(req);
                const tipo = new URL(req.url, 'http://localhost').searchParams.get('tipo');
                body = { usuario: store.perfil(token), medicoes: store.listarMedicoes(token, tipo) };
            } else if (req.method === 'POST' && path === '/api/auth/medicoes') {
                const token = tokenFrom(req);
                const usuario = store.perfil(token);
                const medicao = store.salvarMedicao(token, await readJson(req));
                status = 201;
                body = { usuario, medicao };
            } else if (req.method === 'POST' && path === '/api/auth/logout') {
                store.sair(tokenFrom(req));
                cookie(res, '');
                body = { ok: true };
            } else { throw Object.assign(new Error('Rota não encontrada.'), { status: 404 }); }
            res.writeHead(status);
            res.end(JSON.stringify(body));
        } catch (error) {
            req.resume();
            const duplicate = error.errcode === 2067;
            const status = duplicate ? 409 : (error.status || 500);
            res.writeHead(status);
            res.end(JSON.stringify({ error: duplicate ? 'Já existe uma conta com este e-mail.'
                : status < 500 ? error.message : 'Não foi possível salvar os dados. Tente novamente.',
            code: duplicate ? 'EMAIL_IN_USE' : (error.code && status < 500 ? error.code : 'AUTH_REQUEST_FAILED') }));
        }
    };
    handler.close = () => store.close();
    return handler;
}

module.exports = { createAuthHandler };

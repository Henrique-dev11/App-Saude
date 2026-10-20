// Proxy restrito à leitura de frutas. Evita o bloqueio CORS da Fruityvice no navegador.
module.exports = async function fruitsMiddleware(req, res, next) {
    if (req.url.split('?')[0] !== '/api/fruits') return next();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (req.method !== 'GET') {
        res.statusCode = 405;
        res.setHeader('Allow', 'GET');
        res.end(JSON.stringify({ error: 'Método não permitido.' }));
        return;
    }
    try {
        const response = await fetch('https://www.fruityvice.com/api/fruit/all', {
            signal: AbortSignal.timeout(12000),
        });
        if (!response.ok) throw new Error('API indisponível');
        const fruits = await response.json();
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify(fruits));
    } catch {
        res.statusCode = 502;
        res.end(JSON.stringify({ error: 'Não foi possível consultar as frutas.' }));
    }
};

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createFruitTranslator } = require('./traduzirFrutas.cjs');

const resposta = translatedText => ({ ok: true, json: async () => ({
    responseStatus: 200, responseData: { translatedText },
}) });

test('Traduz frutas conhecidas e novas em pt-BR, preserva originais e reutiliza cache por nome', async () => {
    const requests = [];
    const traduzir = createFruitTranslator({ fetchImpl: async (url, options) => {
        const query = new URL(url);
        assert.equal(query.origin, 'https://api.mymemory.translated.net');
        assert.equal(query.searchParams.get('langpair'), 'en|pt-BR');
        assert.ok(options.signal instanceof AbortSignal);
        requests.push(query.searchParams.get('q'));
        return resposta(requests.length === 1 ? 'maçã\nBANANA\nNectarina' : 'Acerola');
    } });
    const input = [{ name: 'Apple', id: 6 }, { name: 'Banana', id: 1 }, { name: 'Nectarine', id: 105 }];
    const result = await traduzir(input);
    assert.equal(result.translationSource, 'api');
    assert.deepEqual(result.fruits.map(fruta => fruta.nomePtBr), ['Maçã', 'Banana', 'Nectarina']);
    assert.deepEqual(result.fruits.map(fruta => fruta.name), ['Apple', 'Banana', 'Nectarine']);
    assert.ok(input.every(fruta => !Object.hasOwn(fruta, 'nomePtBr')));
    assert.equal((await traduzir(input)).translationSource, 'cache');
    await traduzir([...input, { name: 'Barbados Cherry' }]);
    assert.deepEqual(requests, ['Apple\nBanana\nNectarine', 'Barbados Cherry']);
});

test('Respeita o limite de 500 bytes UTF-8 e separa nomes compostos da API', async () => {
    const requests = [];
    const traduzir = createFruitTranslator({ fetchImpl: async url => {
        const text = new URL(url).searchParams.get('q');
        requests.push(text);
        assert.ok(Buffer.byteLength(text, 'utf8') <= 500);
        return resposta(text.split('\n').map(() => 'Fruta traduzida').join('\n'));
    } });
    const input = [{ name: 'GreenApple' }, ...Array.from({ length: 80 }, (_, index) => ({
        name: 'Very long fruit name ' + index,
    }))];
    const result = await traduzir(input);
    assert.ok(requests.length > 1);
    assert.ok(requests[0].startsWith('Green Apple\n'));
    assert.equal(result.fruits.length, input.length);
    assert.ok(result.fruits.every(fruta => fruta.nomePtBr === 'Fruta traduzida'));
});

for (const [name, fetchImpl] of [
    ['erro de rede', async () => { throw new Error('offline'); }],
    ['timeout', async () => { throw new DOMException('Timeout', 'TimeoutError'); }],
    ['HTTP 500', async () => ({ ok: false })],
    ['JSON inválido', async () => ({ ok: true, json: async () => { throw new Error('JSON'); } })],
    ['cota esgotada', async () => ({ ok: true, json: async () => ({ responseStatus: 403, responseData: { translatedText: 'Quota exceeded' } }) })],
    ['resposta vazia', async () => resposta('')],
    ['linhas insuficientes', async () => resposta('Maçã')],
    ['nome não traduzido', async () => resposta('Apple\nNectarine')],
    ['dados técnicos', async () => resposta('{"id": 6}\n<fruit>')],
]) {
    test('Usa tradução local e oculta fruta desconhecida em caso de ' + name, async () => {
        const traduzir = createFruitTranslator({ fetchImpl });
        const result = await traduzir([{ name: 'Apple' }, { name: 'Nectarine' }]);
        assert.equal(result.translationSource, 'fallback');
        assert.deepEqual(result.fruits.map(fruta => fruta.nomePtBr), ['Maçã', null]);
    });
}

test('Repete tradução com falha após um minuto sem esperar expirar o catálogo', async () => {
    let time = 0;
    let requests = 0;
    const traduzir = createFruitTranslator({ now: () => time, fetchImpl: async () => {
        if (requests++ === 0) throw new Error('offline');
        return resposta('Nectarina');
    } });
    assert.equal((await traduzir([{ name: 'Nectarine' }])).fruits[0].nomePtBr, null);
    await traduzir([{ name: 'Nectarine' }]);
    assert.equal(requests, 1);
    time += 60000;
    assert.equal((await traduzir([{ name: 'Nectarine' }])).fruits[0].nomePtBr, 'Nectarina');
    assert.equal(requests, 2);
});

test('Mantém última tradução válida se a tradução falhar após 24 horas', async () => {
    let time = 0;
    let requests = 0;
    const traduzir = createFruitTranslator({ now: () => time, fetchImpl: async () => {
        if (requests++ > 0) throw new Error('offline');
        return resposta('Nectarina');
    } });
    await traduzir([{ name: 'Nectarine' }]);
    time += 24 * 60 * 60 * 1000;
    const result = await traduzir([{ name: 'Nectarine' }]);
    assert.equal(result.translationSource, 'fallback');
    assert.equal(result.fruits[0].nomePtBr, 'Nectarina');
});

test('Normaliza sinônimos e distingue limões conforme nomes brasileiros', async () => {
    const traduzir = createFruitTranslator({ fetchImpl: async () => resposta('Kiwi\nFruta kiwi\nPitaia\nFruta do dragão\nLimão\nLima') });
    const result = await traduzir(['Kiwi', 'Kiwifruit', 'Pitahaya', 'Dragonfruit', 'Lemon', 'Lime'].map(name => ({ name })));
    assert.deepEqual(result.fruits.map(fruta => fruta.nomePtBr), ['Kiwi', 'Kiwi', 'Pitaya', 'Pitaya', 'Limão-siciliano', 'Limão-taiti']);
});

test('Mantém variedades distintas quando o tradutor retorna o mesmo nome', async () => {
    const traduzir = createFruitTranslator({ fetchImpl: async () => resposta('Amora\nAmora') });
    const result = await traduzir([{ name: 'Blackberry' }, { name: 'Morus' }]);
    assert.deepEqual(result.fruits.map(fruta => fruta.nomePtBr), ['Amora-preta', 'Amora']);
});

test('Aceita tradução que acrescenta acentos a uma fruta nova', async () => {
    const traduzir = createFruitTranslator({ fetchImpl: async () => resposta('Açaí') });
    const result = await traduzir([{ name: 'Acai' }]);
    assert.equal(result.fruits[0].nomePtBr, 'Açaí');
    assert.equal(result.translationSource, 'api');
});

test('Nomes repetidos com espaços e maiúsculas compartilham uma única tradução', async () => {
    let requests = 0;
    const traduzir = createFruitTranslator({ fetchImpl: async url => {
        requests++;
        assert.equal(new URL(url).searchParams.get('q'), 'APPLE');
        return resposta('Apple');
    } });
    const result = await traduzir([{ name: 'Apple' }, { name: '  APPLE  ' }]);
    assert.equal(requests, 1);
    assert.deepEqual(result.fruits.map(fruta => fruta.nomePtBr), ['Maçã', 'Maçã']);
});

test('Nova tentativa repete uma tradução malsucedida imediatamente', async () => {
    let requests = 0;
    const traduzir = createFruitTranslator({ fetchImpl: async () => {
        if (requests++ === 0) throw new Error('offline');
        return resposta('Nectarina');
    } });
    const frutas = [{ name: 'Nectarine' }];
    assert.equal((await traduzir(frutas)).fruits[0].nomePtBr, null);
    const result = await traduzir(frutas, { refresh: true });
    assert.equal(requests, 2);
    assert.equal(result.fruits[0].nomePtBr, 'Nectarina');
});

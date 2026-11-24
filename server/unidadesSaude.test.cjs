const { test } = require('node:test');
const assert = require('node:assert/strict');
const { catalogo, coordenadaValida, lerCoordenadas, textoCoordenadas, distanciaKm,
    filtrarUnidades, urlGoogleMaps, urlBuscarEndereco } = require('../src/services/unidadesSaude');

test('Catálogo tem 10 UBS distintas, com coordenadas de São Paulo e fonte individual no Google Maps', () => {
    assert.equal(catalogo.length, 10);
    assert.equal(new Set(catalogo.map(item => item.id)).size, 10);
    assert.equal(new Set(catalogo.map(item => item.googlePlaceId)).size, 10);
    for (const unidade of catalogo) {
        assert.ok(coordenadaValida(unidade));
        assert.ok(unidade.latitude > -24 && unidade.latitude < -23);
        assert.ok(unidade.longitude > -47 && unidade.longitude < -46);
        assert.equal(unidade.cidade, 'São Paulo');
        assert.match(unidade.googlePlaceId, /^ChIJ/);
        const fonte = new URL(unidade.fonteUrl);
        assert.equal(fonte.hostname, 'www.google.com');
        // Confere o ponto do catálogo contra a coordenada da página pesquisada.
        const [lat, lng] = fonte.pathname.match(/@(-?[\d.]+),(-?[\d.]+)/).slice(1).map(Number);
        assert.ok(Math.abs(unidade.latitude - lat) < 0.0000001);
        assert.ok(Math.abs(unidade.longitude - lng) < 0.0000001);
    }
});

test('Lê latitude antes de longitude e mantém os sinais negativos, inclusive zero', () => {
    assert.deepEqual(lerCoordenadas(' -23.6250, -46.6400 '), { latitude: -23.625, longitude: -46.64 });
    assert.deepEqual(lerCoordenadas('0; 0'), { latitude: 0, longitude: 0 });
    assert.equal(lerCoordenadas('UBS Sé'), null);
    assert.equal(lerCoordenadas('Rua Humaitá, 520'), null);
    assert.equal(textoCoordenadas({ latitude: -23.625, longitude: -46.64 }), '-23.6250000, -46.6400000');
});

test('Rejeita coordenadas fora dos limites e valores não numéricos', () => {
    for (const texto of ['91, 0', '0, -181', '-91, 46']) assert.throws(() => lerCoordenadas(texto), /latitude/);
    for (const ponto of [{ latitude: NaN, longitude: 1 }, { latitude: 1, longitude: Infinity },
        { latitude: '1', longitude: 2 }, null]) {
        assert.equal(coordenadaValida(ponto), false);
        assert.throws(() => textoCoordenadas(ponto));
    }
});

test('Busca ignora acentos e combina nome, bairro e endereço sem alterar o catálogo', () => {
    assert.deepEqual(filtrarUnidades('SE FREDERICO').map(item => item.id), ['se']);
    assert.deepEqual(filtrarUnidades('  SANTA CECILIA  ').map(item => item.id), ['santa-cecilia']);
    assert.ok(filtrarUnidades('bela vista').some(item => item.id === 'humaita'));
    assert.equal(filtrarUnidades('cidade que não existe').length, 0);
    assert.equal(filtrarUnidades().length, 10);
    assert.ok(catalogo.every(item => !Object.hasOwn(item, 'distancia')));
});

test('Distância em linha reta usa quilômetros e não inventa posição se o GPS estiver ausente', () => {
    assert.equal(distanciaKm(catalogo[0], catalogo[0]), 0);
    assert.ok(Math.abs(distanciaKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 }) - 111.195) < 0.01);
    assert.equal(distanciaKm(null, catalogo[0]), null);
    assert.ok(filtrarUnidades().every(item => item.distancia === null));
    const ponto = catalogo.find(item => item.id === 'se');
    const ordenadas = filtrarUnidades('', ponto);
    assert.equal(ordenadas[0].id, 'se');
    for (let i = 1; i < ordenadas.length; i++) assert.ok(ordenadas[i].distancia >= ordenadas[i - 1].distancia);
});

test('Google Maps abre a UBS pelo identificador e permite conferir apenas as coordenadas', () => {
    const ponto = catalogo[0];
    const unidade = new URL(urlGoogleMaps(ponto));
    assert.equal(unidade.searchParams.get('api'), '1');
    assert.equal(unidade.searchParams.get('query_place_id'), ponto.googlePlaceId);
    assert.equal(unidade.searchParams.get('query'), textoCoordenadas(ponto));
    const coordenadas = new URL(urlGoogleMaps(ponto, { somenteCoordenadas: true }));
    assert.equal(coordenadas.searchParams.get('query_place_id'), null);
    assert.equal(coordenadas.searchParams.get('query'), textoCoordenadas(ponto));
    const rota = new URL(urlGoogleMaps(ponto, { rota: true }));
    assert.equal(rota.pathname, '/maps/dir/');
    assert.equal(rota.searchParams.get('destination_place_id'), ponto.googlePlaceId);
    assert.equal(rota.searchParams.get('destination'), textoCoordenadas(ponto));
    assert.equal(rota.searchParams.get('origin'), null);
    assert.equal(new URL(urlBuscarEndereco(' Rua Humaitá, 520, São Paulo ')).searchParams.get('query'), 'Rua Humaitá, 520, São Paulo');
});

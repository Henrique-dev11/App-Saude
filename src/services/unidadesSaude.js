const catalogo = require('../data/ubs.json');

function coordenadaValida(ponto) {
    return Number.isFinite(ponto?.latitude) && Number.isFinite(ponto?.longitude)
        && Math.abs(ponto.latitude) <= 90 && Math.abs(ponto.longitude) <= 180;
}

function lerCoordenadas(texto) {
    // No padrão do Google Maps, o ponto é decimal e a vírgula separa latitude/longitude.
    const partes = texto.trim().match(/^([+-]?\d+(?:\.\d+)?)\s*[,;]\s*([+-]?\d+(?:\.\d+)?)$/);
    if (!partes) return null;
    const ponto = { latitude: Number(partes[1]), longitude: Number(partes[2]) };
    if (!coordenadaValida(ponto)) throw new Error('Use latitude entre -90 e 90 e longitude entre -180 e 180.');
    return ponto;
}

function textoCoordenadas(ponto) {
    if (!coordenadaValida(ponto)) throw new Error('Coordenadas inválidas.');
    return `${ponto.latitude.toFixed(7)}, ${ponto.longitude.toFixed(7)}`;
}

function distanciaKm(origem, destino) {
    if (!coordenadaValida(origem) || !coordenadaValida(destino)) return null;
    const rad = valor => valor * Math.PI / 180;
    const a = Math.sin(rad(destino.latitude - origem.latitude) / 2) ** 2
        + Math.cos(rad(origem.latitude)) * Math.cos(rad(destino.latitude))
        * Math.sin(rad(destino.longitude - origem.longitude) / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))));
}

const normalizar = valor => String(valor).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function filtrarUnidades(busca = '', localizacao = null, unidades = catalogo) {
    const termos = normalizar(busca).split(/\s+/).filter(Boolean);
    return unidades.filter(unidade => {
        const texto = normalizar([unidade.nome, unidade.nomeCompleto, unidade.bairro, unidade.endereco].join(' '));
        return termos.every(termo => texto.includes(termo));
    }).map(unidade => ({ ...unidade, distancia: distanciaKm(localizacao, unidade) }))
        .sort((a, b) => localizacao ? a.distancia - b.distancia : a.numero - b.numero);
}

function urlGoogleMaps(ponto, { rota = false, somenteCoordenadas = false } = {}) {
    const url = new URL(rota ? 'https://www.google.com/maps/dir/' : 'https://www.google.com/maps/search/');
    url.searchParams.set('api', '1');
    url.searchParams.set(rota ? 'destination' : 'query', textoCoordenadas(ponto));
    if (ponto.googlePlaceId && !somenteCoordenadas) {
        url.searchParams.set(rota ? 'destination_place_id' : 'query_place_id', ponto.googlePlaceId);
    }
    return url.toString();
}

function urlBuscarEndereco(endereco) {
    const url = new URL('https://www.google.com/maps/search/');
    url.searchParams.set('api', '1');
    url.searchParams.set('query', endereco.trim());
    return url.toString();
}

module.exports = { catalogo, coordenadaValida, lerCoordenadas, textoCoordenadas,
    distanciaKm, filtrarUnidades, urlGoogleMaps, urlBuscarEndereco };

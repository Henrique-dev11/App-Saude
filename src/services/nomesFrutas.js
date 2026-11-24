const nomesPtBr = require('../data/nomesFrutasPtBr.json');

function normalizarNome(nome) {
    return nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function chaveNomeOriginal(nome) {
    return normalizarNome(nome).replace(/[\s-]+/g, '');
}

function nomeLocal(nomeOriginal) {
    const chave = chaveNomeOriginal(nomeOriginal);
    return Object.hasOwn(nomesPtBr, chave) ? nomesPtBr[chave] : null;
}

function limparNomeTraduzido(nome) {
    if (typeof nome !== 'string') return null;
    const limpo = nome.trim().replace(/\s+/g, ' ').toLowerCase();
    if (limpo.length > 80 || !/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(limpo)) return null;
    return limpo.charAt(0).toUpperCase() + limpo.slice(1);
}

function prepararFrutas(frutas) {
    return frutas.map(fruta => ({
        ...fruta,
        nomePtBr: limparNomeTraduzido(fruta.nomePtBr) || nomeLocal(fruta.name),
    }));
}

function filtrarFrutasPorNome(frutas, busca = '') {
    const termo = normalizarNome(busca);
    const nomes = new Set();
    return frutas.filter(fruta => {
        if (!fruta.nomePtBr) return false;
        const nome = normalizarNome(fruta.nomePtBr);
        if (!nome.includes(termo) || nomes.has(nome)) return false;
        nomes.add(nome);
        return true;
    }).sort((a, b) => a.nomePtBr.localeCompare(b.nomePtBr, 'pt-BR'));
}

module.exports = {
    normalizarNome, chaveNomeOriginal, nomeLocal, limparNomeTraduzido,
    prepararFrutas, filtrarFrutasPorNome,
};

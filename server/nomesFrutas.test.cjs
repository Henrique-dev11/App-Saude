const { test } = require('node:test');
const assert = require('node:assert/strict');
const fruits = require('../src/data/frutas.json');
const { prepararFrutas, filtrarFrutasPorNome } = require('../src/services/nomesFrutas');

const frutas = prepararFrutas(fruits);

for (const [busca, nomes] of [
    ['maçã', ['Maçã', 'Maçã verde']],
    [' MACA ', ['Maçã', 'Maçã verde']],
    ['mAc\u0327A\u0303', ['Maçã', 'Maçã verde']],
    ['banana', ['Banana']],
    ['moran', ['Morango']],
    ['abacaxi', ['Abacaxi']],
    ['maracuja', ['Maracujá']],
    ['PESSEGO', ['Pêssego']],
    ['limao', ['Limão-siciliano', 'Limão-taiti']],
    ['kiwi', ['Kiwi']],
    ['pitaya', ['Pitaya']],
    ['fruta inexistente', []],
    ['apple', []],
    ['Rosaceae', []],
    ['52', []],
]) {
    test('Pesquisa pelo nome em português: ' + busca, () => {
        assert.deepEqual(filtrarFrutasPorNome(frutas, busca).map(fruta => fruta.nomePtBr), nomes);
    });
}

test('Todos os nomes da cópia local têm tradução, sem duplicatas na lista vazia', () => {
    assert.ok(frutas.every(fruta => typeof fruta.nomePtBr === 'string' && fruta.nomePtBr.length));
    const resultado = filtrarFrutasPorNome(frutas, '  ');
    assert.equal(resultado.length, fruits.length - 2);
    assert.equal(new Set(resultado.map(fruta => fruta.nomePtBr)).size, resultado.length);
    assert.deepEqual(frutas.map(fruta => fruta.name), fruits.map(fruta => fruta.name));
});

test('Usa traduções novas e omite nomes sem tradução ou com dados técnicos', () => {
    const dados = prepararFrutas([
        { name: 'Nectarine', nomePtBr: 'Nectarina' },
        { name: 'Unknown fruit' },
        { name: 'Unknown object', nomePtBr: '{"id": 5}' },
        { name: 'Unknown HTML', nomePtBr: '<b>Fruta</b>' },
        { name: 'Apple', nomePtBr: 42 },
    ]);
    assert.deepEqual(filtrarFrutasPorNome(dados).map(fruta => fruta.nomePtBr), ['Maçã', 'Nectarina']);
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { informacoesNutricionais } = require('../src/services/nutricaoFrutas');

test('Mantém os números da resposta, incluindo zero, com rótulos em português', () => {
    const result = informacoesNutricionais({ nutritions: { calories: 123, carbohydrates: 3.14, protein: 0, fat: 0.25, sugar: 2.7 } });
    assert.deepEqual(result.map(campo => campo.valor), [123, 3.14, 0, 0.25, 2.7]);
    assert.deepEqual(result.map(campo => campo.nome), ['Calorias', 'Carboidratos', 'Proteínas', 'Gorduras', 'Açúcares']);
    assert.deepEqual(result.map(campo => campo.unidade), ['kcal', 'g', 'g', 'g', 'g']);
});

test('Dados ausentes ou inválidos não são convertidos em zero nem estimados', () => {
    for (const fruta of [{}, { nutritions: null }, { nutritions: { calories: null, protein: '1', sugar: -1, fat: NaN } }]) {
        assert.ok(informacoesNutricionais(fruta).every(campo => campo.valor === null));
    }
});

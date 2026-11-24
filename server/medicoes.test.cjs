const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
const { createUserStore } = require('./usuarios.cjs');
const { validarMedicao, ordenarMedicoes, compararMedicoes, dataMedicaoLocal } = require('../src/services/dadosMedicoes');
const cadastro = email => ({ nome: 'Pessoa Teste', email, senha: 'Cadastro123', confirmarSenha: 'Cadastro123', idade: 35, tipoSanguineo: 'O+', peso: 80, altura: 180 });
const agora = Date.parse('2026-11-17T15:00:00Z');
const glicemia = { tipo: 'glicemia', valor: 95, contexto: 'Em jejum', data: '2026-11-17T10:00:00Z' };
const pressao = { tipo: 'pressao', valor: 120, diastolica: 80, data: '2026-11-17T11:00:00Z' };

test('Medições persistem após reiniciar o servidor e são isoladas por conta e tipo', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'saude-medicoes-'));
    const options = { databasePath: join(dir, 'teste.sqlite'), now: () => agora };
    let store = createUserStore(options);
    try {
        const a = await store.cadastrar(cadastro('a@example.com'));
        const b = await store.cadastrar(cadastro('b@example.com'));
        store.salvarMedicao(a.token, glicemia);
        store.salvarMedicao(a.token, pressao);
        store.salvarMedicao(a.token, { ...glicemia, valor: 85, data: '2026-11-15T10:00:00Z' });
        assert.equal(store.listarMedicoes(b.token, 'glicemia').length, 0);
        assert.throws(() => store.listarMedicoes(null, 'glicemia'), /sessão/);
        assert.throws(() => store.salvarMedicao(null, glicemia), /sessão/);
        store.close(); store = createUserStore(options);
        const lista = store.listarMedicoes(a.token, 'glicemia');
        assert.deepEqual(lista.map(r => r.valor), [85, 95]);
        assert.equal(store.listarMedicoes(a.token, 'pressao')[0].diastolica, 80);
        assert.equal(compararMedicoes(lista[0], lista[1]).valor, 10);
        assert.equal(store.listarMedicoes(b.token, 'pressao').length, 0);
    } finally { store.close(); rmSync(dir, { recursive: true, force: true }); }
});

test('Valida glicemia, pressão, contexto e datas antes de salvar', () => {
    for (const item of [
        { ...glicemia, valor: '95' }, { ...glicemia, valor: NaN }, { ...glicemia, valor: -1 },
        { ...glicemia, contexto: 'qualquer' }, { ...glicemia, data: 'inválida' },
        { ...glicemia, data: '2026-11-18T10:00:00Z' }, { ...pressao, diastolica: 130 },
        { ...pressao, valor: 120.5 }, { ...pressao, diastolica: null },
    ]) assert.throws(() => validarMedicao(item, agora));
    assert.equal(validarMedicao(glicemia, agora).valor, 95);
    assert.equal(validarMedicao(pressao, agora).diastolica, 80);
});

test('Compara diferenças positivas, negativas e nulas e identifica contextos distintos', () => {
    const a = { id: 1, ...glicemia }, b = { id: 2, ...glicemia, valor: 80, contexto: 'Pós-refeição' };
    assert.deepEqual(compararMedicoes(a, b), { valor: -15, diastolica: null, mesmoContexto: false });
    assert.equal(compararMedicoes(a, { ...a, id: 3 }).valor, 0);
    assert.equal(compararMedicoes(a, a), null);
    assert.equal(compararMedicoes(null, a), null);
    assert.equal(compararMedicoes(a, { id: 2, ...pressao }), null);
    assert.deepEqual(compararMedicoes({ id: 1, ...pressao }, { id: 2, ...pressao, valor: 125, diastolica: 75 }), { valor: 5, diastolica: -5, mesmoContexto: true });
});

test('Ordena pelo instante da medição, preservando registros com horários iguais', () => {
    const lista = [{ id: 2, ...glicemia }, { id: 1, ...glicemia }, { id: 3, ...glicemia, data: '2026-11-14T10:00:00Z' }];
    assert.deepEqual(ordenarMedicoes(lista).map(r => r.id), [3, 1, 2]);
    assert.equal(lista[0].id, 2);
});

test('Data local aceita medições anteriores e rejeita dias e horas impossíveis', () => {
    const resultado = new Date(dataMedicaoLocal('15/11/2026', '09:30', agora));
    assert.equal(resultado.getDate(), 15); assert.equal(resultado.getHours(), 9);
    for (const [dia, hora] of [['31/02/2026', '09:00'], ['15/11/2026', '25:00'], ['18/11/2026', '09:00']]) assert.throws(() => dataMedicaoLocal(dia, hora, agora));
});

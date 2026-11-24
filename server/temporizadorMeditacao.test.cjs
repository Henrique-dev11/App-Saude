const { test } = require('node:test');
const assert = require('node:assert/strict');
const { criarTemporizadorMeditacao } = require('../src/services/temporizadorMeditacao');

test('Pausa e retoma sem perder frações de segundo ou contar o tempo pausado', () => {
  let tempo = 0;
  const timer = criarTemporizadorMeditacao({ agora: () => tempo });
  assert.equal(timer.consultar().segundos, 600);
  timer.iniciar();
  tempo = 12500;
  assert.deepEqual(timer.pausar(), { segundos: 588, ativo: false, concluiu: false });
  tempo += 60000;
  timer.iniciar();
  tempo += 500;
  assert.equal(timer.consultar().segundos, 587);
});

test('Reiniciar durante a reprodução volta para 10:00 e mantém a sessão pausada', () => {
  let tempo = 0;
  const timer = criarTemporizadorMeditacao({ agora: () => tempo });
  timer.iniciar(); tempo += 420000;
  assert.deepEqual(timer.reiniciar(), { segundos: 600, ativo: false, concluiu: false });
  tempo += 900000;
  assert.deepEqual(timer.consultar(), { segundos: 600, ativo: false, concluiu: false });
});

test('Reiniciar uma sessão pausada não registra conclusão', () => {
  let tempo = 0;
  const timer = criarTemporizadorMeditacao({ agora: () => tempo });
  timer.iniciar(); tempo += 300000; timer.pausar();
  assert.equal(timer.reiniciar().concluiu, false);
  assert.equal(timer.consultar().segundos, 600);
});

test('Conclui apenas uma vez mesmo com atraso dos intervalos e permite nova sessão', () => {
  let tempo = 0;
  const timer = criarTemporizadorMeditacao({ agora: () => tempo });
  timer.iniciar(); tempo += 650000;
  assert.deepEqual(timer.consultar(), { segundos: 0, ativo: false, concluiu: true });
  assert.equal(timer.consultar().concluiu, false);
  assert.equal(timer.pausar().concluiu, false);
  assert.equal(timer.iniciar().segundos, 600);
});

test('Cliques repetidos em iniciar não alteram o prazo', () => {
  let tempo = 0;
  const timer = criarTemporizadorMeditacao({ agora: () => tempo });
  timer.iniciar(); tempo += 30000; timer.iniciar();
  assert.equal(timer.consultar().segundos, 570);
});

// O relógio usa tempo real, sem acumular atrasos dos intervalos do navegador.
function criarTemporizadorMeditacao({ agora = Date.now, duracao = 600 } = {}) {
  let restanteMs = duracao * 1000;
  let prazo = 0;
  let ativo = false;
  function consultar() {
    let concluiu = false;
    if (ativo) {
      restanteMs = Math.max(0, prazo - agora());
      if (!restanteMs) { ativo = false; concluiu = true; }
    }
    return { segundos: Math.ceil(restanteMs / 1000), ativo, concluiu };
  }
  return {
    consultar,
    iniciar() {
      if (ativo) return consultar();
      if (!restanteMs) restanteMs = duracao * 1000;
      prazo = agora() + restanteMs;
      ativo = true;
      return consultar();
    },
    pausar() {
      const estado = consultar();
      ativo = false;
      return { ...estado, ativo: false };
    },
    reiniciar() {
      ativo = false;
      restanteMs = duracao * 1000;
      return consultar();
    },
  };
}
module.exports = { criarTemporizadorMeditacao };

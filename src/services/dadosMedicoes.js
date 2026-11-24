function validarMedicao(data, agora = Date.now()) {
    const tipo = data?.tipo;
    if (!['glicemia', 'pressao'].includes(tipo)) throw new Error('Tipo de medição inválido.');
    const valor = data.valor;
    const diastolica = tipo === 'pressao' ? data.diastolica : null;
    if (typeof valor !== 'number' || !Number.isFinite(valor) || (tipo === 'glicemia'
        ? valor < 10 || valor > 1000
        : !Number.isInteger(valor) || valor < 40 || valor > 300 || !Number.isInteger(diastolica) || diastolica < 20 || diastolica > 200 || diastolica >= valor)) {
        throw new Error(tipo === 'glicemia' ? 'Informe uma glicemia entre 10 e 1.000 mg/dL.' : 'Informe uma pressão válida, com a sistólica maior que a diastólica.');
    }
    const contexto = tipo === 'glicemia' ? data.contexto : null;
    if (tipo === 'glicemia' && !['Em jejum', 'Pós-refeição'].includes(contexto)) throw new Error('Selecione o contexto da glicemia.');
    const instante = typeof data.data === 'string' ? Date.parse(data.data) : NaN;
    if (!Number.isFinite(instante) || instante > agora + 60000) throw new Error('Informe uma data válida que não esteja no futuro.');
    return { tipo, valor, diastolica, contexto, data: new Date(instante).toISOString() };
}
function ordenarMedicoes(registros) {
    return [...registros].sort((a, b) => Date.parse(a.data) - Date.parse(b.data) || (a.id || 0) - (b.id || 0));
}
function compararMedicoes(anterior, atual) {
    if (!anterior || !atual || anterior.tipo !== atual.tipo || anterior.id === atual.id) return null;
    return { valor: Number((atual.valor - anterior.valor).toFixed(4)),
        diastolica: atual.tipo === 'pressao' ? atual.diastolica - anterior.diastolica : null,
        mesmoContexto: anterior.contexto === atual.contexto };
}
// Entrada em data/hora local; a persistência sempre usa ISO com fuso explícito.
function dataMedicaoLocal(dia, hora, agora = Date.now()) {
    const d = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dia.trim());
    const h = /^(\d{2}):(\d{2})$/.exec(hora.trim());
    if (!d || !h) throw new Error('Use a data DD/MM/AAAA e a hora HH:MM.');
    const [, dd, mm, yyyy] = d.map(Number);
    const [, hh, min] = h.map(Number);
    const date = new Date(yyyy, mm - 1, dd, hh, min);
    if (date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd || hh > 23 || min > 59 || date.getTime() > agora + 60000) throw new Error('Confira a data e a hora. A medição não pode estar no futuro.');
    return date.toISOString();
}
module.exports = { validarMedicao, ordenarMedicoes, compararMedicoes, dataMedicaoLocal };

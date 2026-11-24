const tipos = require('../data/tiposSanguineos.json');

function invalidar(message) { throw Object.assign(new Error(message), { status: 400, code: 'VALIDATION_ERROR' }); }

function numero(valor, nome, min, max, inteiro = false) {
    const texto = String(valor ?? '').trim().replace(',', '.');
    if (!/^\d+(\.\d+)?$/.test(texto)) invalidar('Informe ' + nome + ' corretamente.');
    const result = Number(texto);
    if (!Number.isFinite(result) || result < min || result > max || (inteiro && !Number.isInteger(result))) {
        invalidar('Informe ' + nome + ' entre ' + min + ' e ' + max + (inteiro ? ', em anos completos.' : '.'));
    }
    return result;
}

function normalizarEmail(email) {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function validarDadosPessoais(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) invalidar('Preencha os dados do perfil.');
    const nome = typeof data.nome === 'string' ? data.nome.trim().replace(/\s+/g, ' ') : '';
    if (nome.length < 3 || nome.length > 120) invalidar('Informe seu nome completo, entre 3 e 120 caracteres.');
    const email = normalizarEmail(data.email);
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) invalidar('Informe um e-mail válido.');
    if (!tipos.includes(data.tipoSanguineo)) invalidar('Selecione seu tipo sanguíneo.');
    if (data.tipoAlergia != null && typeof data.tipoAlergia !== 'string') invalidar('Informe o tipo de alergia em texto.');
    const tipoAlergia = (data.tipoAlergia || '').trim().replace(/\s+/g, ' ');
    if (tipoAlergia.length > 300) invalidar('Descreva suas alergias em até 300 caracteres.');
    return {
        nome, email, tipoAlergia,
        idade: numero(data.idade, 'a idade', 1, 130, true),
        tipoSanguineo: data.tipoSanguineo,
        peso: numero(data.peso, 'o peso em kg', 0.1, 500),
        altura: numero(data.altura, 'a altura em cm', 30, 300),
    };
}

function validarSenha(senha) {
    if (typeof senha !== 'string' || senha.length < 8 || senha.length > 128 || !/\p{L}/u.test(senha) || !/\d/.test(senha)) {
        invalidar('Use uma senha de 8 a 128 caracteres, com letras e números.');
    }
    return senha;
}

function validarCadastro(data) {
    const usuario = validarDadosPessoais(data);
    validarSenha(data.senha);
    if (data.senha !== data.confirmarSenha) invalidar('As senhas não são iguais.');
    return usuario;
}

module.exports = { validarDadosPessoais, validarSenha, validarCadastro, normalizarEmail };
